import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { FormAlert } from "@/components/ui/form-alert";
import { getSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Sign in | Young Planners Forum",
  robots: { index: false },
};

const errors: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Please try again.",
  oauth: "We couldn't start Google sign-in. Please try again.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : undefined);
  const errorKey = typeof params.error === "string" ? params.error : undefined;

  const { user } = await getSession();
  if (user) redirect(next);

  return (
    <AuthCard title="Welcome back" description="Sign in to your YPF account.">
      <FormAlert error={errorKey ? errors[errorKey] : undefined} />
      {params.deleted ? (
        <FormAlert message="Your account and personal data have been deleted." />
      ) : null}
      {!errorKey && !params.deleted && typeof params.next === "string" ? (
        <FormAlert message="Please sign in to continue. If you were already signed in, your session may have expired." />
      ) : null}
      <LoginForm next={next} />
    </AuthCard>
  );
}
