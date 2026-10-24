import { Button } from "@/components/ui/button";

/** Plain form POST to /auth/signout, so it works without JavaScript. */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post">
      <Button type="submit" variant="secondary" className={className}>
        Sign out
      </Button>
    </form>
  );
}
