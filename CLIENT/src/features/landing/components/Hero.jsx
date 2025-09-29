import Container from "../../../shared/components/ui/Container.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { hero } from "../content.js";

function HeadingLine({ parts }) {
  // parts is an array like ["Text ", {bold:"Thing"}]
  return (
    <span className="block">
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <strong key={i} className="font-extrabold">
            {p.bold}
          </strong>
        )
      )}
    </span>
  );
}

export default function Hero({ onSignUp }) {
  const buttonProps = onSignUp
    ? {
        as: "button",
        type: "button",
        onClick: onSignUp,
      }
    : {
        as: "a",
        href: hero.primary.href,
      };

  return (
    <section id="home" className="hero-gradient">
      {/* Full-bleed bg, fluid inner content */}
      <Container variant="fluid" className="py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left copy */}
          <div className="text-white">
            <div className="eyebrow-bar mb-6" />
            <h1 className="h1">
              <HeadingLine parts={hero.line1} />
              <HeadingLine parts={hero.line2} />
            </h1>

            <p className="text-xl mt-5 text-white/80 max-w-[50ch]">
              {hero.subtitle}
            </p>

            <div className="mt-8">
              <Button className="btn rounded-btn px-7 py-4 text-base" {...buttonProps}>
                {hero.primary.label}
              </Button>
            </div>
          </div>

          {/* Right mockup card */}
          <div className="relative">
             {/* Screen image positioned inside */}
               <img
                src={hero.mockup.screen}   // <- this is your dashboard screenshot
                alt="Dashboard screen"
                className="absolute top-[14%] left-[14%] w-[72%] h-[59.5%] object-cover rounded-[6px]"
                loading="lazy"
                decoding="async"
                />
              {/* Monitor frame on top */}
              <img
                src={hero.mockup.src}
                alt={hero.mockup.alt}
                width={hero.mockup.width}
                height={hero.mockup.height}
                className="block w-full h-auto"
                loading="eager"
                decoding="async"
              />
          </div>
        </div>
      </Container>
    </section>
  );
}


