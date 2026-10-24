/**
 * Database types for the Supabase schema in supabase/migrations.
 *
 * Hand-maintained to mirror the migrations. Once you have a running Supabase
 * (local or hosted) you can replace this file with the generated version:
 *   npx supabase gen types typescript --local > src/types/database.ts
 */

export type AppRole = "member" | "editor" | "admin";
export type MembershipStatus = "pending" | "approved" | "rejected" | "suspended";
export type PublishStatus = "draft" | "published" | "archived";
export type CareerStage = "student" | "graduate" | "early_career" | "professional";
export type JobType =
  "full_time" | "part_time" | "internship" | "nysc" | "volunteer" | "contract";
export type ExperienceLevel = "entry" | "entry_mid" | "mid" | "senior";
export type PostCategory = "advocacy" | "events" | "careers" | "announcements";
export type LeaderGroup = "national_executive" | "coordinator";
export type MessageStatus = "new" | "read" | "replied";
export type RegistrationStatus = "registered" | "cancelled";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  institution: string | null;
  career_stage: CareerStage | null;
  specialisation: string | null;
  bio: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  role: AppRole;
  membership_status: MembershipStatus;
  created_at: string;
  updated_at: string;
};

export type MembershipApplicationRow = {
  id: string;
  user_id: string;
  answers: Json;
  status: MembershipStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  city: string | null;
  cover_image: string | null;
  registration_deadline: string | null;
  capacity: number | null;
  features: string[];
  status: PublishStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventSpeakerRow = {
  id: string;
  event_id: string;
  name: string;
  title: string | null;
  photo_url: string | null;
  sort_order: number;
};

export type EventRegistrationRow = {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  email: string;
  status: RegistrationStatus;
  created_at: string;
};

export type JobRow = {
  id: string;
  title: string;
  slug: string;
  organisation: string;
  description: string;
  requirements: string[];
  location: string | null;
  job_type: JobType;
  experience_level: ExperienceLevel | null;
  specialisation: string | null;
  apply_url: string | null;
  apply_email: string | null;
  deadline: string | null;
  status: PublishStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: PostCategory;
  cover_image: string | null;
  author_id: string | null;
  published_at: string | null;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
};

export type LeaderRow = {
  id: string;
  name: string;
  role_title: string;
  group: LeaderGroup;
  photo_url: string | null;
  bio: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SiteSettingRow = {
  key: string;
  value: Json;
  updated_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
};

export type SavedJobRow = {
  user_id: string;
  job_id: string;
  created_at: string;
};

/** Insert = required columns must be given, the rest are optional. */
type TableDef<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, "id">;
      membership_applications: TableDef<MembershipApplicationRow, "user_id">;
      events: TableDef<EventRow, "title" | "slug" | "starts_at">;
      event_speakers: TableDef<EventSpeakerRow, "event_id" | "name">;
      event_registrations: TableDef<EventRegistrationRow, "event_id" | "name" | "email">;
      jobs: TableDef<
        JobRow,
        "title" | "slug" | "organisation" | "description" | "job_type"
      >;
      posts: TableDef<PostRow, "title" | "slug">;
      leaders: TableDef<LeaderRow, "name" | "role_title">;
      site_settings: TableDef<SiteSettingRow, "key" | "value">;
      contact_messages: TableDef<ContactMessageRow, "name" | "email" | "message">;
      saved_jobs: TableDef<SavedJobRow, "user_id" | "job_id">;
    };
    Views: Record<string, never>;
    Functions: {
      register_for_event: {
        Args: { p_event_id: string; p_name: string; p_email: string };
        Returns: RegistrationStatus;
      };
      user_role: { Args: Record<string, never>; Returns: AppRole | null };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_editor: { Args: Record<string, never>; Returns: boolean };
      is_approved_member: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      app_role: AppRole;
      membership_status: MembershipStatus;
      publish_status: PublishStatus;
      career_stage: CareerStage;
      job_type: JobType;
      experience_level: ExperienceLevel;
      post_category: PostCategory;
      leader_group: LeaderGroup;
      message_status: MessageStatus;
      registration_status: RegistrationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
