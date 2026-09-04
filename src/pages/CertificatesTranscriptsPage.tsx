import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Printer,
  QrCode,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  Search,
} from 'lucide-react';
import {
  generateAcademicCertificate,
  getAcademicCertificates,
  getSchoolClasses,
} from '../services/academicsApi';
import type { AcademicCertificate, SchoolClass } from '../types';

export const CertificatesTranscriptsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<AcademicCertificate[]>([]);
  const [activeCert, setActiveCert] = useState<AcademicCertificate | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [certType, setCertType] = useState<'Academic Transcript' | 'School Leaving Certificate' | 'Certificate of Excellence' | 'Competency Certificate'>('Academic Transcript');
  const [studentName, setStudentName] = useState('Mugisha Emmanuel');
  const [admissionNumber, setAdmissionNumber] = useState('ADM-2026-001');
  const [classGrade, setClassGrade] = useState('Senior 4');
  const [academicYear, setAcademicYear] = useState('2026');
  const [summaryTitle, setSummaryTitle] = useState('Completion of Lower Secondary Education (UCE)');
  const [detailsText, setDetailsText] = useState('This is to certify that Mugisha Emmanuel has completed the Uganda Certificate of Education (UCE) curriculum with Distinction conduct and high academic competence.');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getAcademicCertificates();
      setCertificates(list);
      if (list.length > 0) {
        setActiveCert(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cert = await generateAcademicCertificate({
        certificateType: certType,
        studentId: `st-${Date.now()}`,
        studentName,
        admissionNumber,
        classGrade,
        academicYear,
        issuedBy: 'Headteacher - Vinexsah High School',
        summaryTitle,
        detailsText,
      });

      setIsModalOpen(false);
      await loadData();
      setActiveCert(cert);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Academic Transcripts & Verified Certificates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate official Academic Transcripts, School Leaving Certificates, and Testimonials with QR cryptographic security.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {activeCert && (
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Issue Certificate
          </button>
        </div>
      </div>

      {/* Main Grid: List + Certificate Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Issued Credentials ({certificates.length})
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => setActiveCert(cert)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeCert?.id === cert.id
                    ? 'bg-amber-950/40 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">{cert.studentName}</h4>
                  <p className="text-[10px] text-amber-400 font-semibold mt-0.5">{cert.certificateType}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-500">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-2">
          {activeCert ? (
            <div className="p-10 rounded-3xl bg-amber-50/95 text-slate-900 space-y-8 shadow-2xl border-4 border-amber-600/40 relative">
              {/* Header Banner */}
              <div className="text-center space-y-1 border-b-2 border-amber-900/30 pb-6">
                <h1 className="text-2xl font-black text-amber-950 tracking-wide uppercase font-serif">
                  Vinexsah High School
                </h1>
                <p className="text-xs font-semibold text-slate-700">Republic of Uganda • Ministry of Education & Sports Registered</p>
                <div className="pt-2">
                  <span className="px-4 py-1.5 rounded-full bg-amber-900 text-amber-100 font-serif text-sm font-bold tracking-wider uppercase shadow-md">
                    {activeCert.certificateType}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="text-center space-y-4 font-serif">
                <p className="text-sm text-slate-700 italic">This is to officially certify that</p>
                <h2 className="text-2xl font-extrabold text-amber-950 underline decoration-amber-600 decoration-2 underline-offset-8">
                  {activeCert.studentName}
                </h2>
                <p className="text-xs font-mono text-slate-600">Admission Number: {activeCert.admissionNumber}</p>

                <p className="text-xs text-slate-800 leading-relaxed max-w-lg mx-auto pt-2">
                  {activeCert.detailsText}
                </p>
              </div>

              {/* Signatures & QR */}
              <div className="pt-6 border-t-2 border-amber-900/30 flex items-center justify-between text-xs font-serif">
                <div className="text-left space-y-1">
                  <p className="font-bold text-amber-950">Issued By: {activeCert.issuedBy}</p>
                  <p className="text-[10px] text-slate-600">Date of Issue: {activeCert.issueDate}</p>
                </div>

                <div className="text-center">
                  <img src={activeCert.qrCodeUrl} alt="QR Verification" className="w-16 h-16 mx-auto border border-amber-800/40 p-0.5 rounded bg-white" />
                  <p className="text-[8px] font-mono text-slate-600 mt-1">Official Digital Hash Verification</p>
                </div>
              </div>

              <div className="text-center text-[8px] font-mono text-slate-500 pt-2 border-t border-amber-900/20">
                Verification Key: {activeCert.verificationHash}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
              Select a certificate from the left list to view preview.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Issue Certificate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Issue Official Document
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateCert} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Document Type</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Academic Transcript">Academic Transcript</option>
                  <option value="School Leaving Certificate">School Leaving Certificate</option>
                  <option value="Certificate of Excellence">Certificate of Excellence</option>
                  <option value="Competency Certificate">Competency Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Admission Number</label>
                <input
                  type="text"
                  required
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Certificate Text Details</label>
                <textarea
                  rows={3}
                  required
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/30 flex items-center gap-2"
                >
                  Issue & Sign Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
