import { HeaderAuth } from "./header-auth";
import { Container } from "./container";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

/**
 * Site header. Deliberately static (no server session lookup; the sign-in buttons swap client-side) so public pages stay
 * cacheable; signed-in state is shown on the member pages instead.
 */
export function Header() {
  return (
    <header className="border-line sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-2">
          <HeaderAuth />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
