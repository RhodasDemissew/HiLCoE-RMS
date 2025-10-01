import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { LockClosedIcon, CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

export default function DocumentTypeSelect({ stages, value, onChange, disabled }) {
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-xl border border-[color:var(--neutral-200)] bg-white py-2 pl-4 pr-10 text-left text-sm shadow-sm focus:border-[color:var(--brand-600)] focus:outline-none">
          <span className="block truncate text-[color:var(--neutral-800)]">{value || "Select document type"}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[color:var(--neutral-400)]">
            <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-[color:var(--neutral-200)] bg-white py-1 text-sm shadow-lg focus:outline-none">
            {stages.map((stage) => {
              const locked = !stage.unlocked;
              return (
                <Listbox.Option
                  key={stage.name}
                  className={({ active }) =>
                    `relative cursor-default select-none px-4 py-3 ${
                      locked
                        ? 'cursor-not-allowed text-[color:var(--neutral-400)]'
                        : active
                        ? 'bg-[color:var(--brand-50)] text-[color:var(--brand-700)]'
                        : 'text-[color:var(--neutral-700)]'
                    }`
                  }
                  value={stage.unlocked ? stage.name : value}
                  disabled={locked}
                >
                  {({ selected, active }) => (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`block text-sm font-semibold ${selected ? 'text-[color:var(--brand-700)]' : ''}`}>
                          {stage.name}
                        </span>
                        <span className="block text-xs text-[color:var(--neutral-500)]">
                          {locked
                            ? 'Locked: Complete previous stage to unlock.'
                            : stage.status === 'current'
                            ? 'Ready for submission.'
                            : stage.status === 'resubmit'
                            ? `You have ${stage.daysLeft ?? 0} days left to re-submit.`
                            : 'Unlocked'}
                        </span>
                      </div>
                      {locked ? (
                        <LockClosedIcon className="h-4 w-4 text-[color:var(--neutral-400)]" aria-hidden />
                      ) : selected ? (
                        <CheckIcon className="h-4 w-4 text-[color:var(--brand-600)]" aria-hidden />
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
