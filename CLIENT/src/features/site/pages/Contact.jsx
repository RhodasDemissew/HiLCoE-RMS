import Header from "../../../shared/components/layout/Header.jsx";
import Footer from "../../../shared/components/layout/Footer.jsx";
import Container from "../../../shared/components/ui/Container.jsx";
import { contact } from "../../landing/content.js";

function ContactInfoSection({ label, lines }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--neutral-900)]">
        {label}:
      </h3>
      <ul className="mt-2 space-y-1 text-sm text-[color:var(--neutral-700)]">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-contact-gradient">
      <Header />
      <main className="py-6 sm:py-8 lg:py-10">
        <Container className="max-w-5xl px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[color:var(--neutral-900)]">
                {contact.title}{" "}
                <span className="underline decoration-[color:var(--brand-600)] decoration-[2px] sm:decoration-[3px] underline-offset-[6px] sm:underline-offset-[10px]">
                  {contact.highlight}
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-full lg:max-w-[44ch] text-sm sm:text-base text-[color:var(--neutral-600)]">
                {contact.intro}
              </p>

              {contact.sections.map((section) => (
                <ContactInfoSection key={section.label} {...section} />
              ))}
            </div>

            <div className="rounded-2xl sm:rounded-[28px] bg-white p-4 sm:p-6 lg:p-8 xl:p-10 shadow-[0_28px_70px_rgba(13,30,64,0.12)]">
              <form className="space-y-4 sm:space-y-6">
                <div className="grid gap-3 sm:gap-4">
                  <label className="text-xs sm:text-sm font-medium text-[color:var(--neutral-700)]">
                    Full Name
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      className="mt-2 h-10 sm:h-12 w-full rounded-xl sm:rounded-[14px] border border-[color:var(--neutral-200)] px-3 sm:px-4 text-xs sm:text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
                    />
                  </label>
                  <label className="text-xs sm:text-sm font-medium text-[color:var(--neutral-700)]">
                    Email
                    <input
                      type="email"
                      placeholder="Enter email"
                      className="mt-2 h-10 sm:h-12 w-full rounded-xl sm:rounded-[14px] border border-[color:var(--neutral-200)] px-3 sm:px-4 text-xs sm:text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
                    />
                  </label>
                  <label className="text-xs sm:text-sm font-medium text-[color:var(--neutral-700)]">
                    How can we help you?
                    <textarea
                      rows={4}
                      placeholder="Enter message"
                      className="mt-2 w-full rounded-xl sm:rounded-[14px] border border-[color:var(--neutral-200)] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)] resize-none"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn w-full rounded-xl sm:rounded-[14px] py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

