import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  RefreshCw,
  Layers,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  X,
} from 'lucide-react';
import {
  ImportCategory,
  ValidationSummary,
  ImportResult,
  getCsvTemplateString,
  parseCsvText,
  validateImportData,
  commitBulkImport,
} from '../../services/bulkImportService';
import { useAuth } from '../../context/AuthContext';

interface BulkDataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ImportCategory;
  onImportComplete?: (result: ImportResult) => void;
}

export const BulkDataImportModal: React.FC<BulkDataImportModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'students',
  onImportComplete,
}) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<ImportCategory>(defaultCategory);
  const [step, setStep] = useState<'upload' | 'validate' | 'preview' | 'complete'>('upload');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validation, setValidation] = useState<ValidationSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent = getCsvTemplateString(activeCategory);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `schoolsoul_template_${activeCategory}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      setFileContent(text);
      await runValidation(text);
    };
    reader.readAsText(file);
  };

  const runValidation = async (text: string) => {
    setIsProcessing(true);
    setStep('validate');
    const parsedRows = parseCsvText(text);
    const summary = await validateImportData(activeCategory, parsedRows);
    setValidation(summary);
    setIsProcessing(false);
    setStep('preview');
  };

  const handleCommit = async () => {
    if (!validation || !user) return;
    setIsProcessing(true);

    try {
      const validRows = validation.previewRows.filter((r) => r._validationStatus !== 'error');
      const result = await commitBulkImport(activeCategory, validRows, user);
      setImportResult(result);
      setStep('complete');
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setStep('upload');
    setFileContent('');
    setFileName('');
    setValidation(null);
    setImportResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Real School Data Bulk Importer
              </h2>
              <p className="text-xs text-slate-400">
                Upload → Validate → Preview → Confirm Authoritative Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        {step === 'upload' && (
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap gap-2">
            {[
              { id: 'students', label: 'Students', icon: GraduationCap },
              { id: 'guardians', label: 'Parents / Guardians', icon: Users },
              { id: 'staff', label: 'Teachers & Staff', icon: Users },
              { id: 'classes', label: 'Classes & Streams', icon: Layers },
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
              { id: 'fees', label: 'Fee Structures', icon: DollarSign },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as ImportCategory);
                    resetState();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Template Download Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Need the correct column format?</div>
                  <div className="text-xs text-slate-400">
                    Download the pre-structured CSV template formatted for {activeCategory}.
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  Download CSV Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-950/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-500/5 group">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  Click to choose CSV file or drag and drop
                </div>
                <div className="text-xs text-slate-400">
                  Standard CSV or Excel exported CSV files up to 20MB
                </div>
              </label>
            </div>
          )}

          {step === 'preview' && validation && (
            <div className="space-y-5">
              {/* Validation Summary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Rows</div>
                  <div className="text-xl font-bold text-white mt-1">{validation.totalRows}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Valid Records
                  </div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{validation.validCount}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30">
                  <div className="text-xs text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warnings / Dups
                  </div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    {validation.warningCount + validation.duplicateCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30">
                  <div className="text-xs text-red-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Invalid / Errors
                  </div>
                  <div className="text-xl font-bold text-red-400 mt-1">{validation.errorCount}</div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 font-semibold">Status</th>
                      <th className="p-2.5 font-semibold">Row Data</th>
                      <th className="p-2.5 font-semibold">Validation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {validation.previewRows.slice(0, 50).map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row._validationStatus === 'error'
                            ? 'bg-red-950/10 text-red-300'
                            : row._validationStatus === 'warning'
                            ? 'bg-amber-950/10 text-amber-300'
                            : 'hover:bg-slate-800/30'
                        }
                      >
                        <td className="p-2.5">
                          {row._validationStatus === 'valid' && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                              VALID
                            </span>
                          )}
                          {row._validationStatus === 'warning' && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                              WARNING
                            </span>
                          )}
                          {row._validationStatus === 'error' && (
                            <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold">
                              ERROR
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] truncate max-w-xs">
                          {row['FirstName'] || row['FullName'] || row['ClassName'] || row['SubjectName'] || 'Record'}{' '}
                          {row['LastName'] || ''}
                        </td>
                        <td className="p-2.5 text-slate-400">
                          {row._errors.length > 0 ? row._errors.join(', ') : 'All fields verified'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Import Committed Successfully!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Successfully inserted {importResult.successfullyImported} {importResult.category} into the authoritative SchoolSoul database.
              </p>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 inline-block">
                Audit Reference: {importResult.auditId}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          {step === 'preview' ? (
            <>
              <button
                onClick={resetState}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Upload Different File
              </button>
              <button
                onClick={handleCommit}
                disabled={isProcessing || validation?.validCount === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Committing to Database...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Confirm & Commit {validation?.validCount} Records
                  </>
                )}
              </button>
            </>
          ) : step === 'complete' ? (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold ml-auto"
            >
              Close & View Records
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold ml-auto"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
