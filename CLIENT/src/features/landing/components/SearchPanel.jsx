import { useState } from "react";
import Container from "../../../shared/components/ui/Container.jsx";

export default function SearchPanel() {
  const [q, setQ] = useState("");

  return (
    // Pull the panel up so it overlaps the hero edge
    <div className="relative -mt-8 md:-mt-10 mb-8 md:mb-14">
      <Container variant="fluid">
        <div className="mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="h-20 md:h-24 lg:h-28 rounded-xl bg-[color:var(--brand-900)] text-white shadow-card">
            <form
              className="flex items-center gap-2 md:gap-3 p-3 md:p-4 lg:p-5 h-full"
              onSubmit={(e) => {
                e.preventDefault();
                console.log("search:", q); // hook to API later
              }}
            >
              <label htmlFor="search" className="sr-only">Find a Research</label>
              <input
                id="search"
                type="search"
                placeholder="Find a Research"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1 rounded-xl h-12 md:h-14 lg:h-16 bg-white text-[color:var(--neutral-900)] placeholder:text-[color:var(--neutral-600)] px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="btn rounded-xl px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 text-sm md:text-base whitespace-nowrap" aria-label="Search">
                Search
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}

