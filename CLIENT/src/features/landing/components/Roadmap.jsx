import Container from "../../../shared/components/ui/Container.jsx";
import { roadmap } from "../content.js";

function RoadmapCard({ index, title, copy }) {
  return (
    <div className="relative rounded-[20px] sm:rounded-[24px] border border-[color:var(--brand-600)]/20 bg-white p-4 sm:p-6 shadow-[0_18px_50px_rgba(9,26,66,0.08)]">
      <span className="absolute -top-3 sm:-top-4 left-4 sm:left-6 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[color:var(--brand-600)] text-white font-semibold text-sm sm:text-base">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-5 sm:mt-6 text-base sm:text-lg font-semibold text-[color:var(--neutral-900)]">{title}</h3>
      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[color:var(--neutral-600)]">{copy}</p>
    </div>
  );
}

export default function Roadmap() {
  return (
    <section id="roadmap" className="section-y">
      <Container>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[0.4em] text-[color:var(--brand-600)]/80">
            <span className="h-px w-8 sm:w-12 bg-[color:var(--brand-600)]" />
            {roadmap.title}
            <span className="h-px w-8 sm:w-12 bg-[color:var(--brand-600)]" />
          </span>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-lg text-[color:var(--neutral-600)]">{roadmap.intro}</p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[color:var(--brand-600)]/20 md:block" aria-hidden />
          <div className="grid gap-12 md:grid-cols-2">
            {roadmap.steps.map((step, index) => (
              <div key={step.title} className={`relative ${index % 2 === 0 ? "md:pr-10" : "md:pl-10"}`}>
                <RoadmapCard index={index} {...step} />
                {index < roadmap.steps.length - 1 && (
                  <span
                    className={`absolute top-1/2 hidden h-0.5 w-10 -translate-y-1/2 bg-[color:var(--brand-600)]/20 md:block ${
                      index % 2 === 0 ? "right-0" : "left-0"
                    }`}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}


