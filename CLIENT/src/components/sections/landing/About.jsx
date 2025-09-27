import Container from "../../ui/Container";
import { about } from "../../../content/landing";

export default function About() {
  return (
    <section id="about" className="section-y bg-[#F7FAFF]">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="order-2 space-y-6 text-left lg:order-1">
          <span className="text-2xl font-medium uppercase tracking-[0.4em] text-[color:var(--brand-600)]/80">
            {about.title}
          </span>
          <h2 className="p-2 text-4xl font-semibold text-[color:var(--neutral-900)]">
            {about.headline}
          </h2>
          <div className="space-y-5 text-lg text-[color:var(--neutral-700)]">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative max-w-md">
            <div className="absolute -inset-6 rounded-[32px] bg-[color:var(--brand-600)]/12 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_32px_90px_rgba(9,26,66,0.18)]">
              <img
                src={about.image.src}
                alt={about.image.alt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
