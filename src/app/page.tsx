import Link from "next/link";

// Temporary landing page. The real home page is built in Phase 3.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-green-950 px-4 text-center text-white">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Young Planners Forum
      </h1>
      <p className="max-w-xl text-green-100">
        Empowering young planners for a sustainable Nigeria. A forum of the Nigerian
        Institute of Town Planners.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-green-950 hover:bg-green-100"
      >
        Sign in
      </Link>
    </main>
  );
}
