"use client";

/** Last-resort page if the root layout itself fails. Must bring its own <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, color: "#14201a" }}>
        <main role="alert" style={{ maxWidth: 480, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#51605a" }}>The Young Planners Forum site hit an unexpected problem. Please try again.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "12px 20px", borderRadius: 8, border: 0, background: "#164c34", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
