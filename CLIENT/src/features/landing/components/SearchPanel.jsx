import { useState } from "react";
import Container from "../../../shared/components/ui/Container.jsx";

export default function SearchPanel() {
  const [q, setQ] = useState("");

  return (
    // Pull the panel up so it overlaps the hero edge
    <div className="relative -mt-10 mb-14">
      <Container variant="fluid">
        <div className="mx-auto max-w-[1200px] rounded-search bg-[color:var(--brand-900)] text-white shadow-card">
          <form
            className="flex items-center gap-3 p-4 lg:p-5"
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
              className="w-full rounded-search bg-white text-[color:var(--neutral-900)] placeholder:text-[color:var(--neutral-600)] px-4 py-3 text-[16px] focus:outline-none focus-ring"
            />
            <button className="btn rounded-search px-6" aria-label="Search">
              Search
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}

