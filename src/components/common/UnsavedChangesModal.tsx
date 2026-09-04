import React from 'react';
import { AlertTriangle, Save, XCircle, ArrowRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export const UnsavedChangesModal: React.FC = () => {
  const {
    showUnsavedModal,
    unsavedConfig,
    confirmSaveAndLeave,
    confirmLeaveWithoutSaving,
    cancelLeave,
  } = useNavigation();

  if (!showUnsavedModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        id="unsaved-changes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-modal-title"
        aria-describedby="unsaved-modal-desc"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 id="unsaved-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Unsaved Changes Detected
            </h3>
            <p id="unsaved-modal-desc" className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {unsavedConfig?.message || 'You have modified form data or configuration changes that have not been saved yet. Navigating away now will cause your unsaved work to be lost.'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 font-medium">
          💡 Choose <span className="font-bold">Save & Leave</span> to store your updates safely before continuing, or <span className="font-bold">Leave Without Saving</span> to discard edits.
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <button
            id="unsaved-modal-cancel-btn"
            onClick={cancelLeave}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
          >
            Stay on Page
          </button>
          
          <button
            id="unsaved-modal-discard-btn"
            onClick={confirmLeaveWithoutSaving}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Leave Without Saving</span>
          </button>

          <button
            id="unsaved-modal-save-btn"
            onClick={confirmSaveAndLeave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
          >
            <Save className="w-4 h-4" />
            <span>Save & Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
};
