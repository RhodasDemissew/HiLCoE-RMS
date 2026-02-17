import { useState } from "react";
import Header from "../../../shared/components/layout/Header.jsx";
import Footer from "../../../shared/components/layout/Footer.jsx";
import Container from "../../../shared/components/ui/Container.jsx";
import { faq } from "../../landing/content.js";

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div
      className={`rounded-[20px] border transition-all ${
        isOpen
          ? "border-[color:var(--brand-600)] bg-white shadow-[0_18px_45px_rgba(5,136,240,0.18)]"
          : "border-transparent bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-3 sm:py-4 lg:py-5 text-left"
      >
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-[color:var(--neutral-900)]">{item.question}</h3>
          {isOpen && (
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[color:var(--neutral-600)]">
              {item.answer}
            </p>
          )}
        </div>
        <span className="text-xl sm:text-2xl font-semibold text-[color:var(--brand-600)] flex-shrink-0">
          {isOpen ? "\u2303" : "\u2304"}
        </span>
      </button>
    </div>
  );
}

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-faq-gradient">
      <Header />
      <main className="py-8 sm:py-12 lg:py-16">
        <Container className="w-full max-w-4xl px-4 sm:px-6">
          <h1 className="text-center text-2xl sm:text-3xl lg:text-4xl font-semibold text-[color:var(--neutral-900)]">
            {faq.heroTitle}
          </h1>

          <div className="mt-6 sm:mt-8">
            <label htmlFor="faq-search" className="sr-only">
              {faq.placeholder}
            </label>
            <input
              id="faq-search"
              type="search"
              placeholder={faq.placeholder}
              className="w-full rounded-xl sm:rounded-[24px] border border-transparent bg-white/90 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-[0_12px_32px_rgba(93,112,255,0.18)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_4px_rgba(5,136,240,0.18)]"
            />
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-10 space-y-3 sm:space-y-4 lg:space-y-5">
            {faq.items.map((item, index) => (
              <FaqItem
                key={item.question}
                item={item}
                isOpen={activeIndex === index}
                onToggle={() =>
                  setActiveIndex((prev) => (prev === index ? -1 : index))
                }
              />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

