// RLS / permission tests. Runs the real migrations + seed in an in-process
// Postgres (PGlite) and exercises every role.   Run: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { test, before } from "node:test";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const db = new PGlite();

const ids = {
  admin: "00000000-0000-0000-0000-0000000000a1",
  editor: "00000000-0000-0000-0000-0000000000e1",
  member: "00000000-0000-0000-0000-0000000000b1",
  other: "00000000-0000-0000-0000-0000000000b2",
  pending: "00000000-0000-0000-0000-0000000000c1",
  pendingEditor: "00000000-0000-0000-0000-0000000000c2",
};

// Run fn as an API role (anon / authenticated) with an optional JWT subject.
async function as(role, uid, fn) {
  await db.exec(`set role ${role}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role`);
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}
const q = async (sql, params) => (await db.query(sql, params)).rows;
const asAnon = (fn) => as("anon", null, fn);
const asUser = (name, fn) => as("authenticated", ids[name], fn);
const slugs = (rows) => rows.map((r) => r.slug).sort();

before(async () => {
  await db.exec(readFileSync(join(root, "tests/bootstrap.sql"), "utf8"));
  const dir = join(root, "migrations");
  for (const f of readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await db.exec(readFileSync(join(dir, f), "utf8"));
  }
  await db.exec(readFileSync(join(root, "seed.sql"), "utf8"));

  for (const [name, id] of Object.entries(ids)) {
    await db.query(`insert into auth.users (id, email) values ($1, $2)`, [
      id,
      `${name}@test.dev`,
    ]);
  }
  // Privileged setup runs as the superuser (no auth.uid()), like an SQL-editor bootstrap.
  await db.exec(`
    update public.profiles set role='admin',  membership_status='approved' where id='${ids.admin}';
    update public.profiles set role='editor', membership_status='approved' where id='${ids.editor}';
    update public.profiles set membership_status='approved' where id in ('${ids.member}','${ids.other}');
    -- an editor who was never approved must have no powers
    update public.profiles set role='editor' where id='${ids.pendingEditor}';
  `);
});

// ------------------------------------------------------------- signup trigger
test("signup creates a pending member profile and ignores role in metadata", async () => {
  const id = "00000000-0000-0000-0000-0000000000d1";
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data) values ($1, 'new@test.dev', $2)`,
    [
      id,
      JSON.stringify({
        full_name: "New Person",
        role: "admin",
        membership_status: "approved",
      }),
    ],
  );
  const [p] = await q(
    `select full_name, role, membership_status from public.profiles where id=$1`,
    [id],
  );
  assert.equal(p.full_name, "New Person");
  assert.equal(p.role, "member");
  assert.equal(p.membership_status, "pending");
});

// ------------------------------------------------------------------- visitors
test("anon sees only published, current content", async () => {
  await asAnon(async () => {
    const events = slugs(await q(`select slug from public.events`));
    assert.ok(events.includes("urban-planning-for-climate-resilience"));
    assert.ok(events.includes("sustainable-cities-workshop")); // past but published
    assert.ok(!events.includes("draft-event"));

    const jobs = slugs(await q(`select slug from public.jobs`));
    assert.ok(jobs.includes("planning-officer-lagos-state"));
    assert.ok(!jobs.includes("expired-role"), "expired jobs are hidden");

    const posts = slugs(await q(`select slug from public.posts`));
    assert.ok(!posts.includes("draft-article"));
    assert.equal((await q(`select 1 from public.leaders`)).length, 10);
    assert.ok((await q(`select 1 from public.site_settings`)).length >= 3);
  });
});

test("anon cannot read private tables", async () => {
  await asAnon(async () => {
    assert.equal((await q(`select 1 from public.profiles`)).length, 0);
    assert.equal((await q(`select 1 from public.membership_applications`)).length, 0);
    assert.equal((await q(`select 1 from public.event_registrations`)).length, 0);
    assert.equal((await q(`select 1 from public.contact_messages`)).length, 0);
  });
});

test("anon cannot write content", async () => {
  await asAnon(async () => {
    await assert.rejects(
      db.query(
        `insert into public.events (title, slug, starts_at) values ('Hack','hack', now())`,
      ),
      /row-level security/,
    );
    await assert.rejects(
      db.query(`insert into public.jobs (title, slug, organisation, description, job_type, apply_url)
                values ('Hack','hack','x','y','full_time','https://x.y')`),
      /row-level security/,
    );
    // UPDATE/DELETE silently match no rows under RLS
    const upd = await db.query(`update public.leaders set name='x' returning id`);
    assert.equal(upd.rows.length, 0);
    const del = await db.query(`delete from public.posts returning id`);
    assert.equal(del.rows.length, 0);
  });
});

test("anon can send a contact message but not read or fake its status", async () => {
  await asAnon(async () => {
    await db.query(
      `insert into public.contact_messages (name, email, subject, message)
       values ('Visitor','v@test.dev','Hello','Hi there, great forum')`,
    );
    await assert.rejects(
      db.query(`insert into public.contact_messages (name, email, message, status)
                values ('V','v@test.dev','Hello world','replied')`),
      /row-level security/,
    );
    await assert.rejects(
      db.query(
        `insert into public.contact_messages (name, email, message) values ('V','not-an-email','Hello world')`,
      ),
      /check constraint/,
    );
    assert.equal((await q(`select 1 from public.contact_messages`)).length, 0);
  });
});

// ---------------------------------------------------------- event registration
test("anyone can register for an open event, once per email", async () => {
  const [ev] = await q(
    `select id from public.events where slug='urban-planning-for-climate-resilience'`,
  );
  await asAnon(async () => {
    const [{ register_for_event: s }] = await q(
      `select public.register_for_event($1, 'Ada Visitor', ' Ada@Test.dev ')`,
      [ev.id],
    );
    assert.equal(s, "registered");
    await q(`select public.register_for_event($1, 'Ada Again', 'ada@test.dev')`, [ev.id]); // idempotent
  });
  const rows = await q(
    `select email, user_id from public.event_registrations where event_id=$1`,
    [ev.id],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, "ada@test.dev");
  assert.equal(rows[0].user_id, null);
});

test("registration is rejected for drafts, past/closed events and full events", async () => {
  const get = async (slug) =>
    (await q(`select id from public.events where slug=$1`, [slug]))[0].id;
  const draft = await get("draft-event");
  const past = await get("sustainable-cities-workshop");
  await asAnon(async () => {
    await assert.rejects(
      db.query(`select public.register_for_event($1,'A','a@test.dev')`, [draft]),
      /Event not found/,
    );
    await assert.rejects(
      db.query(`select public.register_for_event($1,'A','a@test.dev')`, [past]),
      /closed/,
    );
  });

  const full = await get("planning-career-summit");
  await db.exec(
    `update public.events set capacity = 1 where slug='planning-career-summit'`,
  );
  await asAnon(async () => {
    await q(`select public.register_for_event($1,'First','first@test.dev')`, [full]);
    await assert.rejects(
      db.query(`select public.register_for_event($1,'Second','second@test.dev')`, [full]),
      /full/,
    );
  });
});

test("registration by a signed-in member records their user id", async () => {
  const [ev] = await q(
    `select id from public.events where slug='ypf-annual-general-meeting'`,
  );
  await asUser("member", async () => {
    await q(`select public.register_for_event($1,'Member One','member@test.dev')`, [
      ev.id,
    ]);
    const mine = await q(`select user_id from public.event_registrations`);
    assert.equal(mine.length, 1); // member sees only their own registration
    assert.equal(mine[0].user_id, ids.member);
  });
  await asUser("other", async () => {
    assert.equal((await q(`select 1 from public.event_registrations`)).length, 0);
  });
});

// -------------------------------------------------------------------- members
test("members read and edit only their own profile", async () => {
  await asUser("member", async () => {
    const rows = await q(`select id from public.profiles`);
    assert.deepEqual(
      rows.map((r) => r.id),
      [ids.member],
    );
    await db.query(
      `update public.profiles set bio='Hello', institution='UNILAG' where id=$1`,
      [ids.member],
    );
    const other = await db.query(
      `update public.profiles set bio='pwned' where id=$1 returning id`,
      [ids.other],
    );
    assert.equal(other.rows.length, 0);
  });
});

test("members cannot escalate their own role or status", async () => {
  await asUser("member", async () => {
    await assert.rejects(
      db.query(`update public.profiles set role='admin' where id=$1`, [ids.member]),
      /Only admins/,
    );
    await assert.rejects(
      db.query(`update public.profiles set membership_status='suspended' where id=$1`, [
        ids.member,
      ]),
      /Only admins/,
    );
  });
  await asUser("pending", async () => {
    await assert.rejects(
      db.query(`update public.profiles set membership_status='approved' where id=$1`, [
        ids.pending,
      ]),
      /Only admins/,
    );
  });
});

test("members cannot insert or delete profiles", async () => {
  await asUser("member", async () => {
    await assert.rejects(
      db.query(
        `insert into public.profiles (id, role) values (gen_random_uuid(), 'admin')`,
      ),
      /permission denied|row-level/,
    );
    await assert.rejects(
      db.query(`delete from public.profiles where id=$1`, [ids.member]),
      /permission denied/,
    );
  });
});

test("members submit their own application but cannot approve it", async () => {
  await asUser("pending", async () => {
    await db.query(
      `insert into public.membership_applications (user_id, answers) values ($1, '{"why":"join"}')`,
      [ids.pending],
    );
    await assert.rejects(
      db.query(`insert into public.membership_applications (user_id) values ($1)`, [
        ids.other,
      ]),
      /row-level security/,
    );
    await assert.rejects(
      db.query(
        `insert into public.membership_applications (user_id, status) values ($1,'approved')`,
        [ids.pending],
      ),
      /row-level security|unique/,
    );
    const upd = await db.query(
      `update public.membership_applications set status='approved' returning id`,
    );
    assert.equal(upd.rows.length, 0);
    assert.equal((await q(`select 1 from public.membership_applications`)).length, 1);
  });
  await asUser("other", async () => {
    assert.equal((await q(`select 1 from public.membership_applications`)).length, 0);
  });
});

test("members cannot write content or read messages", async () => {
  await asUser("member", async () => {
    await assert.rejects(
      db.query(`insert into public.posts (title, slug) values ('Nope','nope')`),
      /row-level security/,
    );
    assert.equal((await q(`select 1 from public.contact_messages`)).length, 0);
    assert.equal((await q(`select 1 from public.events where status='draft'`)).length, 0);
  });
});

test("an unapproved user with the editor role has no editor powers", async () => {
  await asUser("pendingEditor", async () => {
    await assert.rejects(
      db.query(`insert into public.posts (title, slug) values ('Nope','nope2')`),
      /row-level security/,
    );
    assert.equal((await q(`select 1 from public.events where status='draft'`)).length, 0);
  });
});

// -------------------------------------------------------------------- editors
test("editors manage content and see drafts and registrations", async () => {
  await asUser("editor", async () => {
    assert.ok((await q(`select 1 from public.events where status='draft'`)).length >= 1);
    assert.ok(
      (await q(`select 1 from public.jobs where slug='expired-role'`)).length === 1,
    );
    await db.query(`insert into public.posts (title, slug, status, published_at)
                    values ('Editor post','editor-post','published', now())`);
    await db.query(`update public.leaders set bio='Updated' where name='Tunde Adejepo'`);
    await db.query(`insert into public.jobs (title, slug, organisation, description, job_type, apply_email)
                    values ('New role','new-role','Org','Desc','internship','hr@org.dev')`);
    assert.ok((await q(`select 1 from public.event_registrations`)).length >= 1);
  });
  await asAnon(async () => {
    assert.ok(slugs(await q(`select slug from public.posts`)).includes("editor-post"));
    assert.ok(
      !slugs(await q(`select slug from public.jobs`)).includes("new-role"),
      "draft job stays hidden",
    );
  });
});

test("editors cannot manage members, roles, settings or messages", async () => {
  await asUser("editor", async () => {
    assert.deepEqual(
      (await q(`select id from public.profiles`)).map((r) => r.id),
      [ids.editor],
    );
    await assert.rejects(
      db.query(`update public.profiles set role='admin' where id=$1`, [ids.editor]),
      /Only admins/,
    );
    assert.equal((await q(`select 1 from public.contact_messages`)).length, 0);
    assert.equal(
      (await db.query(`update public.site_settings set value='{}' returning key`)).rows
        .length,
      0,
    );
    assert.equal(
      (
        await db.query(
          `update public.membership_applications set status='approved' returning id`,
        )
      ).rows.length,
      0,
    );
  });
});

// --------------------------------------------------------------------- admins
test("admins read all profiles, messages and applications", async () => {
  await asUser("admin", async () => {
    assert.ok((await q(`select 1 from public.profiles`)).length >= 6);
    assert.ok((await q(`select 1 from public.contact_messages`)).length >= 1);
    assert.equal((await q(`select 1 from public.membership_applications`)).length, 1);
  });
});

test("approving an application approves the profile; admins can change roles", async () => {
  await asUser("admin", async () => {
    const [app] = await q(
      `select id from public.membership_applications where user_id=$1`,
      [ids.pending],
    );
    await db.query(
      `update public.membership_applications set status='approved', review_note='Welcome' where id=$1`,
      [app.id],
    );
    const [p] = await q(`select membership_status from public.profiles where id=$1`, [
      ids.pending,
    ]);
    assert.equal(p.membership_status, "approved");
    const [a] = await q(
      `select reviewed_by, reviewed_at from public.membership_applications where id=$1`,
      [app.id],
    );
    assert.equal(a.reviewed_by, ids.admin);
    assert.ok(a.reviewed_at);

    await db.query(`update public.profiles set role='editor' where id=$1`, [ids.other]);
    await db.query(
      `update public.site_settings set value='{"email":"new@ypf.org.ng"}' where key='contact'`,
    );
  });
  await asUser("other", async () => {
    // role change takes effect immediately
    await db.query(
      `insert into public.posts (title, slug) values ('By promoted editor','promoted')`,
    );
  });
});

test("a suspended admin loses all privileges", async () => {
  await db.exec(
    `update public.profiles set membership_status='suspended' where id='${ids.admin}'`,
  );
  await asUser("admin", async () => {
    assert.equal((await q(`select 1 from public.contact_messages`)).length, 0);
    assert.deepEqual(
      (await q(`select id from public.profiles`)).map((r) => r.id),
      [ids.admin],
    );
  });
  await db.exec(
    `update public.profiles set membership_status='approved' where id='${ids.admin}'`,
  );
});

test("saved jobs are private to their owner", async () => {
  const [{ id: jobId }] = await q(
    `select id from public.jobs where status='published' limit 1`,
  );
  await asUser("member", async () => {
    await db.query(`insert into public.saved_jobs (user_id, job_id) values ($1,$2)`, [
      ids.member,
      jobId,
    ]);
    assert.equal((await q(`select 1 from public.saved_jobs`)).length, 1);
    await assert.rejects(
      db.query(`insert into public.saved_jobs (user_id, job_id) values ($1,$2)`, [
        ids.other,
        jobId,
      ]),
    );
  });
  await asUser("other", async () => {
    assert.equal((await q(`select 1 from public.saved_jobs`)).length, 0);
  });
  await asAnon(async () => {
    // Supabase grants anon table access by default; RLS (no policy) hides every row.
    assert.equal((await q(`select 1 from public.saved_jobs`).catch(() => [])).length, 0);
  });
});
