"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { MobileAuth } from "./header-auth";
import { NavLinks } from "./nav-links";

/** Hamburger menu shown below the `lg` breakpoint. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the menu and returns focus to the button.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="rounded-control text-ink hover:bg-surface -mr-2 grid size-11 place-items-center"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? (
          <X className="size-6" aria-hidden />
        ) : (
          <Menu className="size-6" aria-hidden />
        )}
      </button>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="border-line shadow-pop absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b bg-white px-4 pt-2 pb-5"
        >
          <NavLinks orientation="vertical" onNavigate={close} />
          <MobileAuth onNavigate={close} />
        </nav>
      ) : null}
    </div>
  );
}
