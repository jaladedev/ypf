-- Development seed data. SAMPLE CONTENT ONLY: replace names, dates and copy
-- before launch. Dates are relative to "now" so the lists always have upcoming items.

insert into public.site_settings (key, value) values
  ('stats', '{"members_label":"Growing Network","reach_value":"33","reach_label":"Local governments","audience_label":"Students - Graduates MNITP/RTP"}'),
  ('contact', '{"email":"info@ypf.org.ng","phone":"+234 801 234 5678","address":"Ibadan, Oyo State, Nigeria"}'),
  ('social', '{"x":"","facebook":"","linkedin":"","instagram":"","youtube":""}')
on conflict (key) do nothing;

insert into public.leaders (name, role_title, "group", sort_order) values
  ('Tunde Adejepo', 'Chairperson', 'national_executive', 1),
  ('Chioma Okafor', 'Vice Chairperson', 'national_executive', 2),
  ('Abdul Musa', 'Secretary', 'national_executive', 3),
  ('Ngozi Eze', 'Treasurer', 'national_executive', 4),
  ('Kayode Bello', 'Financial Secretary', 'national_executive', 5),
  ('Aisha Mohammed', 'Public Relations Officer', 'national_executive', 6),
  ('Emeka Ibeaku', 'Welfare Officer', 'national_executive', 7),
  ('Fatima Sani', 'Programs Coordinator', 'national_executive', 8),
  ('Sample Coordinator (Ibadan)', 'Ibadan Zone Coordinator', 'coordinator', 1),
  ('Sample Coordinator (Ogbomosho)', 'Ogbomosho Zone Coordinator', 'coordinator', 2);

insert into public.events
  (title, slug, summary, body, starts_at, ends_at, venue, city, registration_deadline, capacity, features, status)
values
  ('Urban Planning for Climate Resilience', 'urban-planning-for-climate-resilience',
   'A practical dialogue on how planning can build climate resilience in Oyo State''s cities.',
   'Join industry experts, policymakers and young professionals for a practical dialogue on how planning can build climate resilience in Oyo State''s cities.',
   now() + interval '14 days', now() + interval '14 days 6 hours', 'Ibadan', 'Ibadan',
   now() + interval '12 days', 300,
   array['Expert speakers', 'Networking opportunities', 'Certificate of participation'], 'published'),
  ('YPF Annual General Meeting', 'ypf-annual-general-meeting',
   'Annual general meeting of the Young Planners Forum.', null,
   now() + interval '35 days', now() + interval '35 days 3 hours', 'Ogbomosho', 'Ogbomosho',
   now() + interval '33 days', null, '{}', 'published'),
  ('Planning Career Summit', 'planning-career-summit',
   'Careers, mentorship and CV clinics for emerging planners.', null,
   now() + interval '60 days', now() + interval '60 days 6 hours', 'Ibadan', 'Ibadan',
   null, null, array['Mentorship sessions', 'CV clinic'], 'published'),
  ('Sustainable Cities Workshop (past)', 'sustainable-cities-workshop',
   'A past workshop kept for the Past Events tab.', null,
   now() - interval '40 days', now() - interval '40 days' + interval '3 hours', 'Ogbomosho', 'Ogbomosho',
   null, null, '{}', 'published'),
  ('Draft event (not public)', 'draft-event', 'Visible to editors only.', null,
   now() + interval '90 days', null, 'TBC', 'TBC', null, null, '{}', 'draft');

insert into public.event_speakers (event_id, name, title, sort_order)
select e.id, s.name, s.title, s.sort_order
from public.events e
cross join (values
  ('Dr. Adebayo Oladipo', 'Urban Planning Expert', 1),
  ('Prof. Zainab Sule', 'Climate Specialist', 2),
  ('Tunde Okeke', 'City Planner', 3)
) as s(name, title, sort_order)
where e.slug = 'urban-planning-for-climate-resilience';

insert into public.jobs
  (title, slug, organisation, description, requirements, location, job_type, experience_level, specialisation, apply_url, deadline, status)
values
  ('Planning Officer - Oyo State', 'planning-officer-oyo-state', 'Sample State Planning Agency',
   'We are seeking a motivated Planning Officer to support urban and regional planning initiatives in Oyo State. The successful candidate will work with our team to support policy development, spatial analysis and project implementation.',
   array['Bachelor''s degree in Planning or related field', '1-3 years relevant experience (preferred)', 'Good communication and analytical skills', 'Proficiency in GIS and planning software (advantage)'],
   'Ibadan, Oyo State', 'full_time', 'entry_mid', 'Development control', 'https://example.org/apply/planning-officer', current_date + 21, 'published'),
  ('Urban Design Intern', 'urban-design-intern', 'Sample Design Studio',
   'Three-month internship supporting urban design projects.', array['Final-year student or recent graduate'],
   'Ibadan, Oyo State', 'internship', 'entry', 'Urban design', 'https://example.org/apply/urban-design-intern', current_date + 14, 'published'),
  ('GIS Analyst', 'gis-analyst', 'Sample Consultancy',
   'Contract role producing spatial analysis for planning studies.', array['Strong QGIS / ArcGIS skills'],
   'Ibadan, Oyo State', 'contract', 'mid', 'GIS', 'https://example.org/apply/gis-analyst', current_date + 30, 'published'),
  ('Community Planning Volunteer', 'community-planning-volunteer', 'Sample NGO',
   'Volunteer with a community planning programme.', '{}',
   'Ogbomosho, Oyo State', 'volunteer', 'entry', 'Community planning', 'https://example.org/apply/volunteer', current_date + 10, 'published'),
  ('Expired role (hidden)', 'expired-role', 'Sample Org',
   'Deadline has passed so this is hidden publicly.', '{}',
   'Oyo, Oyo State', 'full_time', 'mid', 'Housing', 'https://example.org/apply/expired', current_date - 5, 'published');

-- Example of a job that is applied for by email instead of a link.
update public.jobs
set apply_url = null, apply_email = 'jobs@example.org'
where slug = 'gis-analyst';

insert into public.posts (title, slug, excerpt, body, category, published_at, status) values
  ('YPF calls for inclusive urban planning policies', 'ypf-calls-for-inclusive-urban-planning-policies',
   'The Young Planners Forum calls for people-centred urban planning in Oyo State.',
   'The Young Planners Forum (YPF) has called for more inclusive and people-centred urban planning in Oyo State, emphasising the need to involve young professionals in decision-making processes.',
   'advocacy', now() - interval '5 days', 'published'),
  ('Strengthening youth voice in urban planning', 'strengthening-youth-voice-in-urban-planning',
   'Why young planners need a seat at the table.', 'Sample article body.', 'advocacy', now() - interval '12 days', 'published'),
  ('New chapter coordinators for 2026', 'new-chapter-coordinators-for-2026',
   'Meet the incoming coordinators.', 'Sample article body.', 'announcements', now() - interval '20 days', 'published'),
  ('Draft article (not public)', 'draft-article', 'Visible to editors only.', 'Draft.', 'announcements', null, 'draft');
