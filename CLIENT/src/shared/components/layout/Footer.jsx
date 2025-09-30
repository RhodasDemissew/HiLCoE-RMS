import Container from "../ui/Container.jsx";
import { footer } from "../../../features/landing/content.js";

export default function Footer() {
  return (
    <footer className="bg-[color:var(--brand-900)] text-white">
      {/* top section with 3 cols */}
      <Container variant="bleed" className="py-5">
        <div className="mx-auto w-full" style={{ maxWidth: "min(92vw, 90rem)" }}>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-8">
            {/* Col 1: logo + tagline + hours (split by a thin line) */}
            <div className="col-span-1">
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

              <div className="mt-6 border-t border-white/15 pt-6">
                <div className="font-semibold">Opening Hours</div>
                <div className="mt-3 space-y-1 text-white/85 small">
                  {footer.hours.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vertical divider */}
            <div className="border-l border-white/15" />
            
            {/* Col 2: pages */}
            <div className="col-span-1">
              <div className="font-semibold">Pages</div>
              <nav className="mt-4 grid gap-2 small">
                {footer.pages.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    className="text-white/85 hover:text-white"
                  >
                    {p.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Vertical divider */}
            <div className="border-l border-white/15" />

            {/* Col 3: contact */}
            <div className="col-span-1">
              <div className="font-semibold">Contact</div>
              <div className="mt-4 small space-y-2 text-white/85">
                <div>{footer.contact.address}</div>
                <a href={`mailto:${footer.contact.email}`} className="underline hover:text-white">
                  {footer.contact.email}
                </a>
                {footer.contact.phones.map((ph) => (
                  <div key={ph}>
                    <a href={`tel:${ph.replace(/\s+/g, "")}`} className="underline hover:text-white">
                      {ph}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* thin top border line to match screenshot edge */}
      <div className="absolute left-0 right-0 top-0 h-px bg-white/10" aria-hidden />

      {/* bottom bar (optional) */}
      <div className="bg-black/10">
        <Container variant="bleed" className="py-4">
          <div className="mx-auto small text-white/70" style={{ maxWidth: "min(92vw, 90rem)" }}>
            © {new Date().getFullYear()} HiLCoE — All rights reserved.
          </div>
        </Container>
      </div>
    </footer>
  );
}

  
