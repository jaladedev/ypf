import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { requireEditor } from "@/lib/auth/session";
import { EventForm } from "../event-form";

export const metadata: Metadata = { title: "New event | Admin", robots: { index: false } };

export default async function NewEvent() {
  await requireEditor();
  return (
    <>
      <PageHeader title="New event" back={{ href: "/admin/events", label: "All events" }} />
      <EventForm
        initial={{ title: "", slug: "", summary: "", body: "", starts_at: "", ends_at: "", venue: "", city: "", cover_image: "", registration_deadline: "", capacity: "", features: "", status: "draft", speakers: [] }}
      />
    </>
  );
}
