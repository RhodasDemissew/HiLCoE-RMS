import { useState, useEffect } from 'react';

export default function DecisionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  decision, 
  submission 
}) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(submission, decision, notes);
      onClose();
    } catch (error) {
      console.error('Error submitting decision:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const getDecisionInfo = () => {
    switch (decision) {
      case 'approve':
        return {
          title: 'Approve',
          description: 'Add notes (optional)',
          buttonText: 'Approve',
          placeholder: 'Approval notes...'
        };
      case 'needs_changes':
        return {
          title: 'Request Changes',
          description: 'Describe required changes',
          buttonText: 'Request Changes',
          placeholder: 'Describe required changes...'
        };
      case 'reject':
        return {
          title: 'Reject',
          description: 'Add reason (optional)',
          buttonText: 'Reject',
          placeholder: 'Rejection reason...'
        };
      default:
        return {
          title: 'Confirm',
          description: 'Add notes (optional)',
          buttonText: 'Confirm',
          placeholder: 'Notes...'
        };
    }
  };

  const decisionInfo = getDecisionInfo();

  return (
    <div className="absolute top-0 left-0 right-0 z-50">
      {/* Small inline popup */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-[color:var(--neutral-200)] p-3 sm:p-4 max-w-full sm:max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-semibold text-[color:var(--neutral-900)]">
            {decisionInfo.title}
          </h3>
          <button
            onClick={onClose}
            className="text-[color:var(--neutral-400)] hover:text-[color:var(--neutral-600)] text-base sm:text-lg p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Notes input */}
        <div className="mb-3 sm:mb-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={decisionInfo.placeholder}
            className="w-full rounded-lg sm:rounded-xl border border-[color:var(--neutral-200)] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[color:var(--neutral-800)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-500)] focus:border-[color:var(--brand-500)] resize-none"
            rows={3}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[color:var(--neutral-600)] bg-[color:var(--neutral-100)] rounded-lg sm:rounded-xl hover:bg-[color:var(--neutral-200)] transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[color:var(--brand-600)] rounded-lg sm:rounded-xl hover:bg-[color:var(--brand-500)] transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {isSubmitting ? 'Processing...' : decisionInfo.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
