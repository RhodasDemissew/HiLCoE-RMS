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
    <section id="home" className="hero-gradient min-h-screen overflow-hidden">
      {/* Full-bleed bg, fluid inner content */}
      <Container variant="fluid" className="py-8 md:py-16 lg:py-20">
        <div className="grid items-center gap-6 md:gap-8 lg:gap-12 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Left copy */}
          <div className="text-white order-2 lg:order-1 px-4 lg:px-0">
            <div className="hidden lg:block absolute left-8 top-12 bg-blue-500 w-60 h-1.5 rounded-2xl" />
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide leading-tight">
              <HeadingLine parts={hero.line1} />
              <HeadingLine parts={hero.line2} />
            </div>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-extralight tracking-wider mt-3 md:mt-4 lg:mt-5 text-white/80 max-w-[45ch]">
              {hero.subtitle}
            </p>

            <div className="mt-4 md:mt-6 lg:mt-8">
              <Button className="btn rounded-btn px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-5 text-sm md:text-base lg:text-lg w-full sm:w-auto" {...buttonProps}>
                {hero.primary.label}
              </Button>
            </div>
          </div>

          {/* Right mockup card */}
          <div className="relative order-1 lg:order-2 px-4 lg:px-0">
            {/* Screen image positioned inside */}
            <img
              src={hero.mockup.screen}
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
              className="block w-full h-auto max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}


