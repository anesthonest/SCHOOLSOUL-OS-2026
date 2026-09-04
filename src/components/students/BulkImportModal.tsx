import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../db/indexedDB';
import { queueOfflineAction } from '../../services/api';
import { formatPersonName } from '../../utils/nameUtils';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const { user } = useAuth();
  const [csvText, setCsvText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const header = 'firstName,middleName,lastName,gender,dateOfBirth,classGrade,stream,residenceType,guardianName,guardianPhone,guardianRelationship\n';
    const row1 = 'John,Kasumba,Muwanga,Male,2013-05-10,Primary 6,East,Boarding,Muwanga David,+256772111222,Father\n';
    const row2 = 'Mary,Nansubuga,Nakate,Female,2014-08-22,Primary 5,Blue,Day,Nakate Sarah,+256701333444,Mother\n';
    const blob = new Blob([header + row1 + row2], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SchoolSoul_Student_Import_Template.csv';
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
        parseCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (rawCsv: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    const lines = rawCsv.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setErrorMsg('CSV file must contain at least a header row and 1 data row.');
      setParsedRecords([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < 3) continue;

      const rec: any = {};
      headers.forEach((h, idx) => {
        rec[h] = values[idx] || '';
      });

      if (rec.firstname && rec.lastname) {
        records.push({
          firstName: rec.firstname || rec['first name'],
          middleName: rec.middlename || rec['middle name'] || '',
          lastName: rec.lastname || rec['last name'],
          gender: rec.gender || 'Male',
          dateOfBirth: rec.dateofbirth || rec['date of birth'] || '2013-01-01',
          classGrade: rec.classgrade || rec['class'] || rec['grade'] || 'Primary 1',
          stream: rec.stream || 'A',
          residenceType: rec.residencetype || rec['residence'] || 'Day',
          guardianName: rec.guardianname || rec['guardian'] || '',
          guardianPhone: rec.guardianphone || rec['phone'] || '',
          guardianRelationship: rec.guardianrelationship || 'Parent',
        });
      }
    }

    if (records.length === 0) {
      setErrorMsg('No valid student records detected. Ensure headers contain firstName, lastName, etc.');
    } else {
      setParsedRecords(records);
    }
  };

  const handleImport = async () => {
    if (parsedRecords.length === 0) return;
    setParsing(true);
    setErrorMsg('');

    try {
      const year = new Date().getFullYear();
      let importedCount = 0;

      for (let i = 0; i < parsedRecords.length; i++) {
        const rec = parsedRecords[i];
        const count = (await db.students.count()) + 1;
        const studentId = `LIN-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
        const admissionNumber = `ADM-${year}-${String(count).padStart(4, '0')}`;
        const qrVerificationHash = `UGA-SCH-${year}-${studentId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        const fullName = formatPersonName(rec.firstName, rec.middleName, rec.lastName, 'Student');

        const newStudent = {
          id: 'stu-' + Date.now() + '-' + i,
          studentId,
          admissionNumber,
          firstName: rec.firstName,
          middleName: rec.middleName || '',
          lastName: rec.lastName,
          fullName,
          gender: rec.gender || 'Male',
          dateOfBirth: rec.dateOfBirth || '2013-01-01',
          nationality: 'Ugandan',
          nationalIdOrBirthCert: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
          classGrade: rec.classGrade || 'Primary 1',
          stream: rec.stream || 'A',
          residenceType: rec.residenceType || 'Day',
          enrolmentDate: new Date().toISOString().split('T')[0],
          status: 'Active' as const,
          qrVerificationHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.students.put(newStudent);
        await queueOfflineAction('student', 'CREATE', newStudent);

        if (rec.guardianName && rec.guardianPhone) {
          const gdn = {
            id: 'gdn-' + Date.now() + '-' + i,
            studentId: newStudent.id,
            fullName: rec.guardianName,
            relationship: rec.guardianRelationship || 'Parent',
            phoneNumber: rec.guardianPhone,
            nationalId: `CM-${Math.floor(10000000 + Math.random() * 90000000)}`,
            residentialAddress: 'Uganda',
            isPrimaryContact: true,
            isEmergencyContact: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.guardians.put(gdn);
          await queueOfflineAction('guardian', 'CREATE', gdn);
        }

        importedCount++;
      }

      setSuccessMsg(`Successfully imported ${importedCount} student passports into local database!`);
      setTimeout(() => {
        onImportComplete();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to import records');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Student CSV Import
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Batch import student passports and guardian details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Sample CSV Template
            </button>

            <label className="cursor-pointer px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload CSV File
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Text Area Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Or Paste CSV Content Directly:
            </label>
            <textarea
              rows={5}
              placeholder="firstName,middleName,lastName,gender,dateOfBirth,classGrade,stream,residenceType,guardianName,guardianPhone,guardianRelationship&#10;John,Kasumba,Muwanga,Male,2013-05-10,Primary 6,East,Boarding,Muwanga David,+256772111222,Father"
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseCSV(e.target.value);
              }}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Feedback */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRecords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Data Preview ({parsedRecords.length} records detected)</span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Gender</th>
                      <th className="p-2">Class</th>
                      <th className="p-2">Residence</th>
                      <th className="p-2">Guardian Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {parsedRecords.slice(0, 5).map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-medium">{r.firstName} {r.lastName}</td>
                        <td className="p-2">{r.gender}</td>
                        <td className="p-2">{r.classGrade} ({r.stream})</td>
                        <td className="p-2">{r.residenceType}</td>
                        <td className="p-2 font-mono">{r.guardianPhone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={parsing || parsedRecords.length === 0}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            {parsing ? 'Importing...' : `Confirm Import (${parsedRecords.length} Students)`}
          </button>
        </div>
      </div>
    </div>
  );
};
