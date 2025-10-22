import Container from "../../../shared/components/ui/Container.jsx";
import { about } from "../content.js";

export default function About() {
  return (
    <section id="about" className="section-y bg-[#F7FAFF]">
      <Container className="grid mt-19 mb-40 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="absolute order-2 space-y-6 text-left lg:order-1">
          <div className="mb-5 ml-18 w-20 h-1 bg-blue-500"/>
          <span className="text-3xl ml-30 font-bold tracking-wider text-black">
            {about.title}
          </span>
          <div className="mt-5 ml-50 w-25 mb-5 h-1 bg-blue-500"/>
          <div className="space-y-5 w-200 ml-200 text-xl text-[color:var(--neutral-700)]">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative max-w-lg">
            <div className="relative left-0 top-20 overflow-hidden rounded-[12px] bg-white shadow-[0_32px_90px_rgba(9,26,66,0.18)]">
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


