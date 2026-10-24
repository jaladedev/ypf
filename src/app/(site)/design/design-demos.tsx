"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { errorMessage, useZodForm } from "@/lib/forms";

const demoSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  topic: z.string().min(1, "Choose a topic."),
  message: z.string().trim().min(10, "Write at least 10 characters."),
  agree: z.literal(true, { error: "Please accept to continue." }),
});

export function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        onClick={() => toast.success("Registration confirmed. See you there!")}
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.error("Something went wrong. Please try again.")}
      >
        Error toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.show("Your changes are saved as a draft.")}
      >
        Info toast
      </Button>
    </div>
  );
}

export function FormDemo() {
  const toast = useToast();
  const form = useZodForm(demoSchema, {
    defaultValues: { name: "", email: "", topic: "", message: "" },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit(async () => {
        await new Promise((r) => setTimeout(r, 600));
        toast.success("Form is valid. Nothing was sent: this is a demo.");
        form.reset();
      })}
    >
      <Input
        label="Full name"
        requiredMark
        autoComplete="name"
        error={errorMessage(errors, "name")}
        {...form.register("name")}
      />
      <Input
        label="Email address"
        type="email"
        requiredMark
        autoComplete="email"
        error={errorMessage(errors, "email")}
        {...form.register("email")}
      />
      <div className="sm:col-span-2">
        <Select
          label="Topic"
          requiredMark
          error={errorMessage(errors, "topic")}
          {...form.register("topic")}
        >
          <option value="">Select a topic</option>
          <option value="membership">Membership</option>
          <option value="events">Events</option>
          <option value="jobs">Jobs</option>
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Textarea
          label="Message"
          requiredMark
          hint="At least 10 characters."
          error={errorMessage(errors, "message")}
          {...form.register("message")}
        />
      </div>
      <div className="sm:col-span-2">
        <Checkbox
          label="I agree to the Privacy Policy"
          error={errorMessage(errors, "agree")}
          {...form.register("agree")}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" loading={isSubmitting}>
          Submit demo form
        </Button>
      </div>
    </form>
  );
}

export function TabsDemo() {
  return (
    <Tabs
      label="Leadership groups"
      tabs={[
        {
          id: "exec",
          label: "National Executives",
          content: <p className="text-ink-muted text-sm">Executives content.</p>,
        },
        {
          id: "coord",
          label: "Coordinators",
          content: <p className="text-ink-muted text-sm">Coordinators content.</p>,
        },
        {
          id: "alumni",
          label: "Past leaders",
          content: <p className="text-ink-muted text-sm">Past leaders content.</p>,
        },
      ]}
    />
  );
}
