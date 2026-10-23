/** Plain form POST to /auth/signout, so it works without JavaScript. */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={
          className ??
          "rounded-md border border-green-800 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-50"
        }
      >
        Sign out
      </button>
    </form>
  );
}
