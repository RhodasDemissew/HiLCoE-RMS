import PropTypes from "prop-types";

export default function ScheduleTabs({ tabs = [], active, onChange }) {
  if (!tabs.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-[color:var(--neutral-200)] pb-3 text-sm font-semibold">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={`pb-2 transition ${
              isActive
                ? "border-b-2 border-[color:var(--brand-600)] text-[color:var(--brand-700)]"
                : "text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-700)]"
            }`}
            onClick={() => onChange?.(tab.key)}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

ScheduleTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  active: PropTypes.string,
  onChange: PropTypes.func,
};

