import Container from "../ui/Container.jsx";
import { footer } from "../../../features/landing/content.js";

export default function Footer() {
  return (
    <footer className="bg-[color:var(--brand-900)] text-white">
      {/* top section with responsive grid */}
      <Container variant="bleed" className="py-6 md:py-8">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Col 1: logo + tagline + hours */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3">
                <img
                  src={footer.logo.src}
                  alt={footer.logo.alt}
                  className="h-10 w-10 rounded-full"
                  loading="lazy"
                  decoding="async"
                />
                <div className="leading-tight">
                  <div className="font-semibold">{footer.logo.name}</div>
                  <div className="small text-white/80">{footer.logo.tagline}</div>
                </div>
              </div>

              <div className="mt-4 md:mt-6 border-t border-white/15 pt-4 md:pt-6">
                <div className="font-semibold text-sm md:text-base">Opening Hours</div>
                <div className="mt-2 md:mt-3 space-y-1 text-white/85 small">
                  {footer.hours.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2: pages */}
            <div className="lg:col-span-1">
              <div className="font-semibold text-sm md:text-base">Pages</div>
              <nav className="mt-3 md:mt-4 grid gap-2 small">
                {footer.pages.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    className="text-white/85 hover:text-white transition-colors"
                  >
                    {p.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Col 3: contact */}
            <div className="lg:col-span-1">
              <div className="font-semibold text-sm md:text-base">Contact</div>
              <div className="mt-3 md:mt-4 small space-y-2 text-white/85">
                <div>{footer.contact.address}</div>
                <a href={`mailto:${footer.contact.email}`} className="underline hover:text-white transition-colors">
                  {footer.contact.email}
                </a>
                {footer.contact.phones.map((ph) => (
                  <div key={ph}>
                    <a href={`tel:${ph.replace(/\s+/g, "")}`} className="underline hover:text-white transition-colors">
                      {ph}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 4: Additional links */}
            <div className="lg:col-span-1">
              <div className="font-semibold text-sm md:text-base">Quick Links</div>
              <nav className="mt-3 md:mt-4 grid gap-2 small">
                <a href="/login" className="text-white/85 hover:text-white transition-colors">
                  Login
                </a>
                <a href="/signup" className="text-white/85 hover:text-white transition-colors">
                  Sign Up
                </a>
                <a href="/faq" className="text-white/85 hover:text-white transition-colors">
                  FAQ
                </a>
                <a href="/contact" className="text-white/85 hover:text-white transition-colors">
                  Contact Us
                </a>
              </nav>
            </div>
          </div>
        </div>
      </Container>

      {/* thin top border line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-white/10" aria-hidden />

      {/* bottom bar */}
      <div className="bg-black/10">
        <Container variant="bleed" className="py-3 md:py-4">
          <div className="mx-auto small text-white/70 max-w-7xl px-4 text-center">
            © {new Date().getFullYear()} HiLCoE — All rights reserved.
          </div>
        </Container>
      </div>
    </footer>
  );
}

  
