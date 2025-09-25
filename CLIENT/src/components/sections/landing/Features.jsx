import Container from "../../ui/Container";
import { features } from "../../../content/landing";
import featureHero from "../../../assets/images/ai.png";

function FeatureCard({ icon, title, copy }) {
  return (
    <article className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.28),transparent_65%)]" aria-hidden />
        <img
          src={icon}
          alt=""
          className="relative z-15 h-38 w-38 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3 className="mt-6 text-2xl font-bold text-[color:var(--neutral-900)]">{title}</h3>
      <p className="mt-2 max-w-[22ch] text-md text-[color:var(--neutral-600)]">{copy}</p>
    </article>
  );
}

export default function Features() {
  return (
    <section id="features" className="section-y">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-[min(320px,40%)_1fr] md:gap-16">
          <div className="mx-auto max-w-xs">
            <div className="relative ml-3.5">
              <span className="absolute -left-16 top-10 hidden h-40 w-40 rounded-full bg-[color:var(--brand-600)]/10 blur-3xl md:block" aria-hidden />
              <img
                src={featureHero}
                alt="AI assistant"
                className="relative z-10 w-full max-w-[260px]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold text-[color:var(--neutral-900)]">
              {features.eyebrow}
            </h2>
            <p className="mt-3 text-xl text-[color:var(--neutral-600)]">
              {features.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-6">
            <span className="h-[3px] w-12 rounded-full bg-[color:var(--brand-600)]" />
            <h3 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Features</h3>
            <span className="h-[3px] w-12 rounded-full bg-[color:var(--brand-600)]" />
          </div>

          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {features.items.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
