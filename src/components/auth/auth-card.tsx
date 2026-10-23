import type { ReactNode } from "react";

/** Temporary centred card used by the auth pages until the Phase 2 design system lands. */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold tracking-wide text-green-800">YPF</p>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description ? <p className="text-sm text-gray-600">{description}</p> : null}
        </div>
        {children}
      </div>
    </main>
  );
}
