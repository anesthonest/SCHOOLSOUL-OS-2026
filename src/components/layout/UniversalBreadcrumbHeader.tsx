import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Home, History, AlertCircle } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export const UniversalBreadcrumbHeader: React.FC = () => {
  const {
    currentView,
    canGoBack,
    breadcrumbs,
    goBack,
    navigateTo,
    hasUnsavedChanges,
    historyStack,
    getPreviousViewLabel,
  } = useNavigation();

  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Keyboard shortcut listener for Back navigation (Alt + ArrowLeft)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowLeft' && canGoBack) {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, goBack]);

  // Don't render full bar if on dashboard and no sub-history, but still keep container clean
  if (currentView === 'dashboard') {
    return (
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-medium">
          <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Dashboard Main Operations</span>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unsaved Changes</span>
          </div>
        )}
      </div>
    );
  }

  const previousLabel = getPreviousViewLabel();

  return (
    <nav
      aria-label="Breadcrumb & Back Navigation"
      id="universal-breadcrumb-nav"
      className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
    >
      {/* Left Area: Back Button & Breadcrumb Trail */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
        {/* Universal Back Button */}
        {canGoBack && (
          <button
            id="universal-back-btn"
            onClick={goBack}
            title={`Return to ${previousLabel} (Alt + Left)`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 active:scale-95 group shrink-0 min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
            <span className="hidden md:inline text-[10px] font-normal text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-600 pl-2">
              to {previousLabel}
            </span>
          </button>
        )}

        {/* Separator Line */}
        <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Breadcrumb List */}
        <ol className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 flex-wrap min-w-0 overflow-x-auto py-0.5 no-scrollbar">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const isFirst = idx === 0;

            return (
              <li key={`${item.view}-${idx}`} className="flex items-center gap-1.5 shrink-0">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}

                {isLast ? (
                  <span className="font-bold text-slate-900 dark:text-slate-100 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/50">
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={() => navigateTo(item.view, { params: item.params })}
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isFirst && <Home className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                    <span>{item.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Right Area: Status & Recent History Stack */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {/* Unsaved Changes Warning Badge */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Unsaved Edits</span>
          </div>
        )}

        {/* Recent History Stack Dropdown */}
        {historyStack.length > 1 && (
          <div className="relative">
            <button
              id="navigation-history-stack-btn"
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              title="View recent page navigation history"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">History ({historyStack.length})</span>
            </button>

            {showHistoryDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-40 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 px-1">
                  Recent Visited Pages
                </div>
                <div className="mt-2 space-y-1 max-h-56 overflow-y-auto">
                  {historyStack.slice(-6).reverse().map((entry, index) => {
                    const isCurrent = entry.view === currentView;
                    return (
                      <button
                        key={`${entry.view}-${entry.timestamp}-${index}`}
                        onClick={() => {
                          setShowHistoryDropdown(false);
                          navigateTo(entry.view, { params: entry.params });
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/50 font-bold text-blue-600 dark:text-blue-400'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{entry.label}</span>
                        {isCurrent && <span className="text-[10px] text-blue-500 font-normal">Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
