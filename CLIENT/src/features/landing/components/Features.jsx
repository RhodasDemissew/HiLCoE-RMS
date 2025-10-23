import Container from "../../../shared/components/ui/Container.jsx";
import { features } from "../content.js";
import featureHero from "../../../assets/images/ai.png";
import featurePolygon1 from "../../../assets/svg/Polygon_1.svg";
import featurePolygon2 from "../../../assets/svg/Ellipse_1.svg";
import featurePolygon3 from "../../../assets/svg/Ellipse_2.svg";
import featurePolygon4 from "../../../assets/svg/Ellipse_3.svg";


function FeatureCard({ icon, title, copy }) {
  return (
    <article className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.28),transparent_65%)]" aria-hidden />
        <img
          src={icon}
          alt=""
          className="relative z-15 h-48 w-48 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3 className="mt-6 text-2xl font-bold text-[color:var(--neutral-900)]">{title}</h3>
      <p className="mt-2 max-w-[22ch] text-xl text-[color:var(--neutral-600)]">{copy}</p>
    </article>
  );
}

export default function Features() {
  return (
    <section id="features" className="section-y">
      <Container>
        <div className="grid items-center gap-8 md:gap-12 lg:gap-16 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="relative mx-auto max-w-sm md:max-w-md">
              <span className="absolute -left-8 top-4 hidden h-32 w-32 rounded-full bg-[color:var(--brand-600)]/10 blur-3xl md:block" aria-hidden />
              <img
                src={featureHero}
                alt="AI assistant"
                className="relative z-10 w-full h-auto"
                loading="lazy"
                decoding="async"
              />
              <img
                src={featurePolygon1}
                alt="AI assistant"
                className="absolute top-0 left-0 z-10 w-full h-auto opacity-60"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[color:var(--neutral-900)] leading-tight">
              {features.eyebrow}
            </h2>
            <p className="mt-4 md:mt-6 lg:mt-8 text-lg md:text-xl lg:text-2xl text-[color:var(--neutral-600)] max-w-2xl">
              {features.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-16 md:mt-20 text-center">
          <div className="inline-flex items-center gap-4 md:gap-6">
            <span className="h-[3px] w-8 md:w-12 rounded-full bg-[color:var(--brand-600)]" />
            <h3 className="text-xl md:text-2xl font-semibold text-[color:var(--neutral-900)]">Features</h3>
            <span className="h-[3px] w-8 md:w-12 rounded-full bg-[color:var(--brand-600)]" />
          </div>

          <div className="mt-8 md:mt-12 grid gap-8 md:gap-12 md:grid-cols-3 relative">
            {features.items.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
            
            {/* Decorative elements - positioned relatively to avoid layout issues */}
            <div className="hidden lg:block absolute -left-20 top-10 z-0">
              <img
                src={featurePolygon2}
                alt=""
                className="w-32 h-auto opacity-30"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="hidden lg:block absolute -right-20 top-20 z-0">
              <img
                src={featurePolygon3}
                alt=""
                className="w-40 h-auto opacity-30"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="hidden lg:block absolute left-1/2 top-40 z-0">
              <img
                src={featurePolygon4}
                alt=""
                className="w-36 h-auto opacity-30"
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


