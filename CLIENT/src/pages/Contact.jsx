import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Container from "../components/ui/Container";
import { contact } from "../content/landing";

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
      <main className="py-10">
        <Container className="max-w-5xl">
          <div className="m-3 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
            <div className="ml-70 text-left">
              <h1 className="text-4xl font-semibold text-[color:var(--neutral-900)]">
                {contact.title}{" "}
                <span className="underline decoration-[color:var(--brand-600)] decoration-[3px] underline-offset-[10px]">
                  {contact.highlight}
                </span>
              </h1>
              <p className="mt-6 max-w-[44ch] text-base text-[color:var(--neutral-600)]">
                {contact.intro}
              </p>

              {contact.sections.map((section) => (
                <ContactInfoSection key={section.label} {...section} />
              ))}
            </div>

            <div className="mr-40 mb-2.5 rounded-[28px] bg-white p-8 shadow-[0_28px_70px_rgba(13,30,64,0.12)] lg:p-9 xl:p-10">
              <form className="mr- space-y-6">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-[color:var(--neutral-700)]">
                    Full Name
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      className="mt-2 h-12 w-full rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
                    />
                  </label>
                  <label className="text-sm font-medium text-[color:var(--neutral-700)]">
                    Email
                    <input
                      type="email"
                      placeholder="Enter email"
                      className="mt-2 h-12 w-full rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
                    />
                  </label>
                  <label className="text-sm font-medium text-[color:var(--neutral-700)]">
                    How can we help you?
                    <textarea
                      rows={5}
                      placeholder="Enter message"
                      className="mt-2 w-full rounded-[14px] border border-[color:var(--neutral-200)] px-4 py-3 text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn w-full rounded-[14px] py-3 text-base font-semibold"
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
