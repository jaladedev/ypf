"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormAlert } from "@/components/ui/form-alert";
import { Stepper } from "@/components/ui/stepper";
import { errorMessage, useZodForm } from "@/lib/forms";
import { nigerianStates } from "@/lib/nigeria";
import {
  applicationSchema,
  joinStepFields,
  type ApplicationInput,
} from "@/lib/validation";
import { submitApplication, type JoinState } from "./actions";

const steps = ["Personal", "Education", "Professional"];

// Pressing a button blurs the focused field, which can show or hide its error message and shift
// the button before the click finishes (the click is then lost). Keeping focus avoids that.
const keepFocus = { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };

type Account = { email: string; password: string; confirm: string; terms: boolean };

export function JoinForm({
  signedIn,
  defaultName,
}: {
  signedIn: boolean;
  defaultName?: string;
}) {
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState<Account>({
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [result, setResult] = useState<JoinState>({});
  const [pending, startTransition] = useTransition();
  const form = useZodForm(applicationSchema, {
    defaultValues: {
      full_name: defaultName ?? "",
      graduation_year: "",
      linkedin_url: "",
    },
  });
  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = form;
  const err = (n: keyof ApplicationInput) => errorMessage(errors, n);
  const last = step === steps.length - 1;

  if (result.verifyEmail) {
    return (
      <Card>
        <CardBody
          className="flex flex-col items-center gap-3 py-10 text-center"
          role="status"
        >
          <span className="bg-brand-50 text-brand-700 grid size-12 place-items-center rounded-full">
            <MailCheck className="size-6" aria-hidden />
          </span>
          <h2 className="text-h2 text-ink">Check your email</h2>
          <p className="text-ink-muted max-w-md">
            We sent a confirmation link to <strong>{result.verifyEmail}</strong>. Open it
            to finish your application. If you don&apos;t see it, check your spam folder.
          </p>
        </CardBody>
      </Card>
    );
  }

  async function next() {
    const ok = await trigger([...joinStepFields[step]]);
    if (ok) setStep(step + 1);
  }

  const onSubmit = handleSubmit((values) => {
    setResult({});
    startTransition(async () => {
      const r = await submitApplication(values, signedIn ? undefined : account);
      // On success for signed-in users the action redirects; we only get here with a message.
      setResult(r);
    });
  });

  const ae = result.fieldErrors ?? {};
  return (
    <Card>
      <CardBody className="space-y-8">
        <Stepper steps={steps} current={step} />
        <form
          onSubmit={(e) => {
            // Enter inside a field on an earlier step moves forward instead of submitting.
            if (!last) {
              e.preventDefault();
              void next();
              return;
            }
            void onSubmit(e);
          }}
          className="space-y-5"
          noValidate
        >
          <div hidden={step !== 0} className="space-y-5">
            <h2 className="text-h3 text-ink">Personal details</h2>
            <Input
              label="Full name"
              autoComplete="name"
              requiredMark
              error={err("full_name")}
              {...register("full_name")}
            />
            <Input
              label="Phone number"
              type="tel"
              autoComplete="tel"
              requiredMark
              placeholder="+234 801 234 5678"
              error={err("phone")}
              {...register("phone")}
            />
            <Select
              label="State of residence"
              requiredMark
              error={err("state")}
              defaultValue=""
              {...register("state")}
            >
              <option value="" disabled>
                Select your state
              </option>
              {nigerianStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div hidden={step !== 1} className="space-y-5">
            <h2 className="text-h3 text-ink">Education</h2>
            <Input
              label="Institution"
              requiredMark
              hint="University, polytechnic or other school"
              error={err("institution")}
              {...register("institution")}
            />
            <Select
              label="Current stage"
              requiredMark
              error={err("career_stage")}
              defaultValue=""
              {...register("career_stage")}
            >
              <option value="" disabled>
                Select
              </option>
              <option value="student">Student</option>
              <option value="graduate">Recent graduate</option>
              <option value="early_career">Early-career professional</option>
              <option value="professional">Professional</option>
            </Select>
            <Input
              label="Course or qualification"
              requiredMark
              placeholder="e.g. B.Sc. Urban and Regional Planning"
              error={err("qualification")}
              {...register("qualification")}
            />
            <Input
              label="Graduation year"
              inputMode="numeric"
              maxLength={4}
              hint="Optional. Expected year if you're still studying."
              error={err("graduation_year")}
              {...register("graduation_year")}
            />
          </div>

          <div hidden={step !== 2} className="space-y-5">
            <h2 className="text-h3 text-ink">Professional</h2>
            <Input
              label="Area of interest or specialisation"
              requiredMark
              placeholder="e.g. GIS, urban design, housing"
              error={err("specialisation")}
              {...register("specialisation")}
            />
            <Input
              label="Organisation"
              hint="Optional. Where you work or intern."
              error={err("organisation")}
              {...register("organisation")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="LinkedIn profile"
                type="url"
                inputMode="url"
                placeholder="https://linkedin.com/in/…"
                hint="Optional"
                error={err("linkedin_url")}
                {...register("linkedin_url")}
              />
              <Input
                label="NITP membership number"
                hint="Optional, if you have one"
                error={err("nitp_number")}
                {...register("nitp_number")}
              />
            </div>
            <Textarea
              label="Why do you want to join YPF?"
              requiredMark
              rows={4}
              error={err("motivation")}
              {...register("motivation")}
            />

            {signedIn ? null : (
              <fieldset className="border-line space-y-4 border-t pt-5">
                <legend className="text-h3 text-ink pr-2">Create your account</legend>
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  requiredMark
                  value={account.email}
                  onChange={(e) => setAccount({ ...account, email: e.target.value })}
                  error={ae.email}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    requiredMark
                    hint="At least 8 characters"
                    value={account.password}
                    onChange={(e) => setAccount({ ...account, password: e.target.value })}
                    error={ae.password}
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    requiredMark
                    value={account.confirm}
                    onChange={(e) => setAccount({ ...account, confirm: e.target.value })}
                    error={ae.confirm}
                  />
                </div>
                <Checkbox
                  checked={account.terms}
                  onChange={(e) => setAccount({ ...account, terms: e.target.checked })}
                  error={ae.terms}
                  label={
                    <>
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-brand-700 underline"
                        target="_blank"
                      >
                        Terms of Use<span className="sr-only"> (opens in a new tab)</span>
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-brand-700 underline"
                        target="_blank"
                      >
                        Privacy Policy
                        <span className="sr-only"> (opens in a new tab)</span>
                      </Link>
                      .
                    </>
                  }
                />
              </fieldset>
            )}
          </div>

          <FormAlert error={result.error} />
          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                {...keepFocus}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            ) : (
              <span />
            )}
            {last ? (
              <Button type="submit" loading={pending} {...keepFocus}>
                Submit application
              </Button>
            ) : (
              <Button type="button" {...keepFocus} onClick={next}>
                Continue
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
