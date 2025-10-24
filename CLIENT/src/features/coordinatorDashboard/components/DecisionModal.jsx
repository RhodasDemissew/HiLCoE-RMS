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
      <div className="bg-white rounded-lg shadow-lg border p-3 max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">
            {decisionInfo.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Notes input */}
        <div className="mb-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={decisionInfo.placeholder}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex gap-1 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : decisionInfo.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
