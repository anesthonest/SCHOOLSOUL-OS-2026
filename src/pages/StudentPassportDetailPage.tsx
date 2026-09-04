import React, { useState, useEffect } from 'react';
import {
  User,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Clock,
  QrCode,
  Users,
  FileUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Building2,
  GraduationCap,
  Plus,
  RefreshCw,
  XCircle,
  Eye,
  Printer,
  Sparkles,
  Lock,
  Tag,
  HeartPulse,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchStudent360Passport,
  updateStudentStatus,
  transferStudentClass,
  uploadStudentDocument,
  verifyStudentDocument,
  addStudentNote,
  generateDigitalIdCard,
  updateStudentBiodata,
} from '../services/studentApi';
import type {
  Student,
  Guardian,
  StudentDocument,
  StudentNote,
  StudentTimelineEvent,
  ClassAssignmentLog,
  DigitalIDCard,
  StudentStatus,
} from '../types';

interface StudentPassportDetailPageProps {
  studentId: string;
  onBack: () => void;
}

export const StudentPassportDetailPage: React.FC<StudentPassportDetailPageProps> = ({
  studentId,
  onBack,
}) => {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState<{
    student: Student;
    guardians: Guardian[];
    documents: StudentDocument[];
    notes: StudentNote[];
    timeline: StudentTimelineEvent[];
    classLogs: ClassAssignmentLog[];
    digitalId: DigitalIDCard | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'guardians' | 'academics' | 'documents' | 'timeline' | 'notes' | 'digitalId'
  >('profile');

  // Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEditBioModal, setShowEditBioModal] = useState(false);

  // Edit Biodata Form
  const [bioFirstName, setBioFirstName] = useState('');
  const [bioMiddleName, setBioMiddleName] = useState('');
  const [bioLastName, setBioLastName] = useState('');
  const [bioGender, setBioGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bioDob, setBioDob] = useState('2013-01-01');
  const [bioNationalId, setBioNationalId] = useState('');
  const [bioBloodGroup, setBioBloodGroup] = useState('');
  const [bioNationality, setBioNationality] = useState('Ugandan');
  const [bioPrimaryLanguage, setBioPrimaryLanguage] = useState('English');
  const [bioResidenceType, setBioResidenceType] = useState<any>('Day');
  const [bioAllergies, setBioAllergies] = useState('');
  const [bioSpecialNeeds, setBioSpecialNeeds] = useState('');

  // Status Change Form
  const [newStatus, setNewStatus] = useState<StudentStatus>('Active');
  const [statusReason, setStatusReason] = useState('');

  // Class Transfer Form
  const [transferClass, setTransferClass] = useState('');
  const [transferStream, setTransferStream] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Upload Document Form
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<StudentDocument['category']>('Birth Certificate');
  const [docFile, setDocFile] = useState<File | null>(null);

  // Note Form
  const [noteCategory, setNoteCategory] = useState<StudentNote['category']>('General');
  const [noteContent, setNoteContent] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load360Passport();
  }, [studentId]);

  const load360Passport = async () => {
    setLoading(true);
    try {
      const res = await fetchStudent360Passport(studentId);
      setData(res);
      setNewStatus(res.student.status);
      setTransferClass(res.student.classGrade);
      setTransferStream(res.student.stream || 'A');
    } catch (err) {
      console.error('Failed to load student passport:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading 360-degree Student Passport profile...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <p className="text-slate-500 text-sm">Student Passport record not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Student Directory
        </button>
      </div>
    );
  }

  const { student, guardians, documents, notes, timeline, classLogs, digitalId } = data;

  // Handlers
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateStudentStatus(student.id, newStatus, statusReason, user?.id, user?.fullName);
      setShowStatusModal(false);
      setStatusReason('');
      load360Passport();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transferStudentClass(
        student.id,
        transferClass,
        transferStream,
        transferReason,
        user?.id,
        user?.fullName
      );
      setShowTransferModal(false);
      setTransferReason('');
      load360Passport();
    } catch (err) {
      alert('Failed to reassign class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    setSubmitting(true);
    try {
      let fileData = '';
      if (docFile) {
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(docFile);
        });
      }

      await uploadStudentDocument(
        student.id,
        docTitle,
        docCategory,
        docFile?.name || `${docTitle}.pdf`,
        fileData,
        docFile?.size || 0,
        user?.id,
        user?.fullName
      );

      setShowDocModal(false);
      setDocTitle('');
      setDocFile(null);
      load360Passport();
    } catch (err) {
      alert('Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyDocument = async (docId: string, status: 'Verified' | 'Rejected') => {
    try {
      await verifyStudentDocument(student.id, docId, status, user?.id, user?.fullName);
      load360Passport();
    } catch (err) {
      alert('Failed to update document verification');
    }
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;

    setSubmitting(true);
    try {
      await addStudentNote(
        student.id,
        noteCategory,
        noteContent,
        isConfidential,
        user?.id || 'usr-1',
        user?.fullName || 'Staff Member'
      );
      setShowNoteModal(false);
      setNoteContent('');
      load360Passport();
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditBioModal = () => {
    setBioFirstName(student.firstName || '');
    setBioMiddleName(student.middleName || '');
    setBioLastName(student.lastName || '');
    setBioGender((student.gender as any) || 'Male');
    setBioDob(student.dateOfBirth || '2013-01-01');
    setBioNationalId(student.nationalIdOrBirthCert || '');
    setBioBloodGroup(student.bloodGroup || '');
    setBioNationality(student.nationality || 'Ugandan');
    setBioPrimaryLanguage(student.primaryLanguage || 'English');
    setBioResidenceType(student.residenceType || 'Day');
    setBioAllergies(student.medicalInfo?.allergies || '');
    setBioSpecialNeeds(student.specialNeeds || '');
    setShowEditBioModal(true);
  };

  const handleBioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioFirstName.trim() || !bioLastName.trim()) {
      alert('First Name and Last Name are required');
      return;
    }
    setSubmitting(true);
    try {
      await updateStudentBiodata(
        student.id,
        {
          firstName: bioFirstName.trim(),
          middleName: bioMiddleName.trim(),
          lastName: bioLastName.trim(),
          gender: bioGender,
          dateOfBirth: bioDob,
          nationalIdOrBirthCert: bioNationalId.trim(),
          bloodGroup: bioBloodGroup ? (bioBloodGroup as any) : undefined,
          nationality: bioNationality.trim(),
          primaryLanguage: bioPrimaryLanguage.trim(),
          residenceType: bioResidenceType,
          medicalInfo: {
            ...student.medicalInfo,
            allergies: bioAllergies.trim() || 'None',
          },
          specialNeeds: bioSpecialNeeds.trim(),
        },
        user?.id,
        user?.fullName
      );
      setShowEditBioModal(false);
      await load360Passport();
    } catch (err) {
      alert('Failed to update student profile information');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReissueDigitalID = async () => {
    setSubmitting(true);
    try {
      await generateDigitalIdCard(student.id, user?.id, user?.fullName);
      load360Passport();
      setActiveTab('digitalId');
    } catch (err) {
      alert('Failed to generate Digital ID Card');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={load360Passport}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Refresh Passport Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Core Identifier */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 uppercase">
              {(student.firstName?.[0] || student.fullName?.[0] || 'S')}
              {(student.lastName?.[0] || '')}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-mono font-bold text-xs">
                  LIN: {student.studentId}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Adm: {student.admissionNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    student.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}
                >
                  {student.status}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {student.fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  <strong>Grade:</strong> {student.classGrade} ({student.stream || 'A'})
                </span>
                <span>•</span>
                <span>
                  <strong>Residence:</strong> {student.residenceType}
                </span>
                <span>•</span>
                <span>
                  <strong>Enrolled:</strong> {student.enrolmentDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {hasPermission('Student Passport', 'Edit') && (
              <>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  Change Status
                </button>

                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  Class Transfer
                </button>
              </>
            )}

            <button
              onClick={handleReissueDigitalID}
              disabled={submitting}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <QrCode className="w-3.5 h-3.5" /> Digital ID Card
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pt-2">
          {[
            { id: 'profile', label: 'Biodata & Profile', icon: User },
            { id: 'guardians', label: `Guardians (${guardians.length})`, icon: Users },
            { id: 'academics', label: 'Class & Stream', icon: GraduationCap },
            { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
            { id: 'timeline', label: `Timeline (${timeline.length})`, icon: Clock },
            { id: 'notes', label: `Staff Notes (${notes.length})`, icon: Tag },
            { id: 'digitalId', label: 'Digital Student ID', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition border-b-2 flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Profile & Biodata */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Medical Alert Card if allergies or conditions exist */}
          {student.medicalInfo?.allergies && student.medicalInfo.allergies !== 'None' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <HeartPulse className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold">Medical Alert & Emergency Protocols</h4>
                <p>
                  <strong>Allergies:</strong> {student.medicalInfo.allergies}
                </p>
                {student.medicalInfo.chronicConditions && (
                  <p>
                    <strong>Chronic Conditions:</strong> {student.medicalInfo.chronicConditions}
                  </p>
                )}
                {student.medicalInfo.emergencyInstructions && (
                  <p>
                    <strong>Emergency Action:</strong> {student.medicalInfo.emergencyInstructions}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Biodata */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Primary Student Biodata
                </h3>
                {hasPermission('Student Passport', 'Edit') && (
                  <button
                    onClick={handleOpenEditBioModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Biodata
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">National ID / Birth Cert</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {student.nationalIdOrBirthCert || 'BC-UNREGISTERED'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gender</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {student.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {student.dateOfBirth}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Group</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {student.bloodGroup || 'Unspecified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nationality</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {student.nationality || 'Ugandan'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Primary Language</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {student.primaryLanguage || 'English'}
                  </span>
                </div>
              </div>
            </div>

            {/* Previous Academic Background */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" /> Previous School & Entry History
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Former School Attended</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {student.previousSchool?.name || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Last Grade Passed</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {student.previousSchool?.lastGradePassed || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Aggregate Score / Division</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {student.previousSchool?.aggregateScore || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Parent/Guardian Directory */}
      {activeTab === 'guardians' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Linked Parent / Guardian Contacts
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guardians.map((g) => (
              <div
                key={g.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {g.fullName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px]">
                    {g.relationship}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {g.phoneNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">National ID (NIN)</span>
                    <span className="font-mono font-semibold">{g.nationalId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span>{g.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Occupation</span>
                    <span>{g.occupation || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Residential Address</span>
                    <span>{g.residentialAddress || 'Kampala, Uganda'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Class & Stream History */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Current Academic Placement
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Class Grade</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {student.classGrade}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Stream</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {student.stream || 'A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">House / Dormitory</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {student.houseOrDorm || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Class Assignment & Promotion Log
            </h3>

            {classLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No previous class transfer logs recorded.</p>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Previous Class</th>
                      <th className="p-2.5">New Class</th>
                      <th className="p-2.5">Assigned By</th>
                      <th className="p-2.5">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {classLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="p-2.5 font-mono">{log.timestamp.split('T')[0]}</td>
                        <td className="p-2.5">{log.previousClass} ({log.previousStream || 'A'})</td>
                        <td className="p-2.5 font-bold text-blue-600">{log.newClass} ({log.newStream || 'A'})</td>
                        <td className="p-2.5">{log.assignedBy}</td>
                        <td className="p-2.5">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Documents Repository */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Student Document Repository
            </h3>

            {hasPermission('Documents', 'Create') && (
              <button
                onClick={() => setShowDocModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" /> Upload Document
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                No verified documents uploaded for this student yet.
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold text-[10px] block w-fit mb-1">
                        {doc.category}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {doc.title}
                      </h4>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.verificationStatus === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : doc.verificationStatus === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p>File: {doc.fileName}</p>
                    <p>Uploaded by {doc.uploadedBy} on {doc.uploadedAt.split('T')[0]}</p>
                  </div>

                  {hasPermission('Documents', 'Approve') && doc.verificationStatus === 'Pending' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleVerifyDocument(doc.id, 'Rejected')}
                        className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyDocument(doc.id, 'Verified')}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold"
                      >
                        Verify Document
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Timeline & Audit Trail */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Chronological Passport History
          </h3>

          <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
            {timeline.map((evt) => (
              <div key={evt.id} className="relative group space-y-1 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-600 absolute -left-[23px] top-1 border-2 border-white dark:border-slate-900" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{evt.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{evt.description}</p>
                <p className="text-[10px] text-slate-400">By {evt.performedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Notes & Behavioral Incidents */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Staff Notes & Records
            </h3>

            <button
              onClick={() => setShowNoteModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Staff Note
            </button>
          </div>

          <div className="space-y-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border ${
                  n.isConfidential
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                } space-y-2 text-xs`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">
                      {n.category}
                    </span>
                    {n.isConfidential && (
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Confidential
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{n.note}</p>
                <p className="text-[10px] text-slate-400">Author: {n.authorName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Digital ID Card Render */}
      {activeTab === 'digitalId' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto shadow-2xl space-y-4">
            {/* ID Card Front */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 border border-blue-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="font-black text-sm tracking-wider text-blue-400 uppercase">
                    SCHOOLSOUL ACADEMIA
                  </h4>
                  <p className="text-[9px] text-slate-300">OFFICIAL STUDENT DIGITAL PASSPORT</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center font-black text-xs text-blue-300">
                  SS
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-xl bg-slate-800 border-2 border-blue-500/40 flex items-center justify-center text-white font-black text-xl shrink-0">
                  {(student.firstName?.[0] || student.fullName?.[0] || 'S')}
                  {(student.lastName?.[0] || '')}
                </div>

                <div className="space-y-1 text-xs">
                  <h3 className="font-black text-sm text-white">{student.fullName}</h3>
                  <p className="text-blue-300 font-mono font-bold text-[11px]">
                    LIN: {student.studentId}
                  </p>
                  <p className="text-slate-300 text-[10px]">
                    Grade: <strong>{student.classGrade}</strong> ({student.stream || 'A'})
                  </p>
                  <p className="text-slate-300 text-[10px]">
                    Residence: <strong>{student.residenceType}</strong>
                  </p>
                </div>
              </div>

              {/* QR Verification Payload Matrix */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
                <div className="space-y-0.5">
                  <p className="text-slate-400">Card Serial No:</p>
                  <p className="font-mono font-bold text-white">
                    {digitalId?.cardSerialNumber || 'ID-2026-PENDING'}
                  </p>
                  <p className="text-emerald-400 font-bold mt-1">STATUS: VERIFIED ACTIVE</p>
                </div>

                <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Export Official ID Card
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Student Status</h3>
            <form onSubmit={handleStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StudentStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Expelled">Expelled</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason for Status Change</label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Class & Stream Transfer</h3>
            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Class Grade</label>
                <input
                  type="text"
                  required
                  value={transferClass}
                  onChange={(e) => setTransferClass(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Stream</label>
                <input
                  type="text"
                  required
                  value={transferStream}
                  onChange={(e) => setTransferStream(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Transfer Reason</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Student Document</h3>
            <form onSubmit={handleDocUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Document Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="PLE Slip">PLE Slip / UNEB Results</option>
                  <option value="Medical Record">Medical Record</option>
                  <option value="Conduct Letter">Conduct Letter</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Staff Record Note</h3>
            <form onSubmit={handleAddNoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="General">General</option>
                  <option value="Academic">Academic</option>
                  <option value="Disciplinary">Disciplinary</option>
                  <option value="Medical">Medical</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Note Content *</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="confidential" className="font-semibold text-slate-700 dark:text-slate-300">
                  Mark as Confidential (Restricted access)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Biodata Modal */}
      {showEditBioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Edit Student Biodata & Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowEditBioModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBioSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bioFirstName}
                    onChange={(e) => setBioFirstName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Middle / Third Name <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={bioMiddleName}
                    onChange={(e) => setBioMiddleName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Last / Surname *
                  </label>
                  <input
                    type="text"
                    required
                    value={bioLastName}
                    onChange={(e) => setBioLastName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Gender</label>
                  <select
                    value={bioGender}
                    onChange={(e) => setBioGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    value={bioDob}
                    onChange={(e) => setBioDob(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    NIN / Birth Cert No.
                  </label>
                  <input
                    type="text"
                    value={bioNationalId}
                    onChange={(e) => setBioNationalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Blood Group</label>
                  <select
                    value={bioBloodGroup}
                    onChange={(e) => setBioBloodGroup(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="">Unspecified</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Nationality</label>
                  <input
                    type="text"
                    value={bioNationality}
                    onChange={(e) => setBioNationality(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Primary Language</label>
                  <input
                    type="text"
                    value={bioPrimaryLanguage}
                    onChange={(e) => setBioPrimaryLanguage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Residence Type</label>
                  <select
                    value={bioResidenceType}
                    onChange={(e) => setBioResidenceType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Day">Day Scholar</option>
                    <option value="Boarding">Boarding Student</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Medical Allergies / Conditions <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={bioAllergies}
                    onChange={(e) => setBioAllergies(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    placeholder="e.g. Asthmatic, Penicillin allergy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Special Educational Needs & Accommodations <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={bioSpecialNeeds}
                  onChange={(e) => setBioSpecialNeeds(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  placeholder="e.g. Extra time in examinations, Front-row seating"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditBioModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Update Student Biodata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
