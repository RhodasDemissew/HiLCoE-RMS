import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function DeleteStudentModal({ open, student, onCancel, onConfirm, loading = false }) {
  const fullName = student
    ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ") || student.student_id
    : "";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                <Dialog.Title className="text-xl font-semibold text-[color:var(--neutral-900)]">
                  Delete Student
                </Dialog.Title>
                <p className="mt-3 text-sm text-[color:var(--neutral-600)]">
                  Are you sure you want to delete this student?
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--neutral-800)]">{fullName}</p>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={onConfirm}
                  >
                    {loading ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}


