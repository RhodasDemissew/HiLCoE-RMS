import Container from "../../../shared/components/ui/Container.jsx";
import { about } from "../content.js";

export default function About() {
  return (
    <section id="about" className="section-y bg-[#F7FAFF]">
      <Container>
        <div className="grid gap-8 md:gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <span className="h-[3px] w-8 md:w-12 rounded-full bg-[color:var(--brand-600)]" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-black">
                {about.title}
              </span>
              <span className="h-[3px] w-8 md:w-12 rounded-full bg-[color:var(--brand-600)]" />
            </div>
            <div className="space-y-3 sm:space-y-4 md:space-y-5 text-base sm:text-lg md:text-xl text-[color:var(--neutral-700)] max-w-2xl mx-auto lg:mx-0">
              {about.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative max-w-md lg:max-w-lg">
              <div className="relative overflow-hidden rounded-[12px] bg-white shadow-[0_32px_90px_rgba(9,26,66,0.18)]">
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
        </div>
      </Container>
    </section>
  );
}


