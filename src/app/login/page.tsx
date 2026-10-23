import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Sign in | Young Planners Forum" };

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
      {errorKey && errors[errorKey] ? (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {errors[errorKey]}
        </p>
      ) : null}
      <LoginForm next={next} />
    </AuthCard>
  );
}
