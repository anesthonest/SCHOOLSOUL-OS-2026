import React, { useState, useEffect } from 'react';
import {
  Activity,
  HeartPulse,
  Plus,
  Search,
  AlertTriangle,
  Pill,
  UserCheck,
  Clock,
  Shield,
  FileText,
  PhoneCall,
  CheckCircle,
} from 'lucide-react';
import { v7Api } from '../services/v7Api';
import type { StudentMedicalProfile, ClinicVisit } from '../types';

export const SchoolHealthCentrePage: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentMedicalProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<StudentMedicalProfile | null>(null);
  const [showVisitModal, setShowVisitModal] = useState<boolean>(false);

  // New Visit Form
  const [visitData, setVisitData] = useState({
    complaint: '',
    diagnosis: '',
    treatmentAdministered: '',
    administeredBy: 'Nurse Clara Atuhaire',
    parentNotified: true,
    restRequiredMinutes: 20,
    referredToHospital: false,
  });

  useEffect(() => {
    loadHealthProfiles();
  }, []);

  const loadHealthProfiles = async () => {
    setLoading(true);
    const data = await v7Api.getMedicalProfiles();
    setProfiles(data);
    if (data.length > 0 && !selectedProfile) {
      setSelectedProfile(data[0]);
    }
    setLoading(false);
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !visitData.complaint) return;

    const newVisit: ClinicVisit = {
      id: `cv-${Date.now()}`,
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...visitData,
    };

    const updatedProfile: StudentMedicalProfile = {
      ...selectedProfile,
      clinicVisits: [newVisit, ...selectedProfile.clinicVisits],
    };

    await v7Api.saveMedicalProfile(updatedProfile);
    setProfiles(profiles.map((p) => (p.studentId === updatedProfile.studentId ? updatedProfile : p)));
    setSelectedProfile(updatedProfile);
    setShowVisitModal(false);
    setVisitData({
      complaint: '',
      diagnosis: '',
      treatmentAdministered: '',
      administeredBy: 'Nurse Clara Atuhaire',
      parentNotified: true,
      restRequiredMinutes: 20,
      referredToHospital: false,
    });
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.classGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-red-950 p-6 rounded-2xl border border-rose-800/50 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4" />
            <span>SchoolSoul School Sickbay & Health Centre</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">School Health Centre</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Manage student medical records, chronic conditions, emergency contacts, clinic visit logs, dosage schedules, and critical emergency health alerts.
          </p>
        </div>

        {selectedProfile && (
          <button
            onClick={() => setShowVisitModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sickbay Visit</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Health Records</span>
          <p className="text-2xl font-black text-white mt-1">{profiles.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Chronic Conditions Tracked</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {profiles.filter((p) => p.chronicConditions.length > 0).length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Active Allergies Alert</span>
          <p className="text-2xl font-black text-rose-400 mt-1">
            {profiles.filter((p) => p.allergies.length > 0).length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Immunisation Up-To-Date</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {profiles.filter((p) => p.immunisationStatus === 'Up to Date').length}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student medical profile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredProfiles.map((p) => {
              const isSelected = selectedProfile?.studentId === p.studentId;
              return (
                <div
                  key={p.studentId}
                  onClick={() => setSelectedProfile(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-white">{p.studentName}</h3>
                      <p className="text-xs text-slate-400">{p.classGrade} • Blood Group: <span className="text-rose-400 font-bold">{p.bloodGroup}</span></p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {p.clinicVisits.length} Visits
                    </span>
                  </div>

                  {p.allergies.length > 0 && (
                    <div className="mt-2 text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Allergies: {p.allergies.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-7">
          {selectedProfile ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-white">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-rose-400">{selectedProfile.studentId}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                      {selectedProfile.immunisationStatus}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedProfile.studentName}</h2>
                  <p className="text-xs text-slate-400">{selectedProfile.classGrade}</p>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Emergency Phone</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" /> {selectedProfile.emergencyContactPhone}
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">({selectedProfile.emergencyContactName})</span>
                </div>
              </div>

              {/* Medical Alerts Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
                  <span className="text-[10px] font-bold uppercase text-rose-400 block mb-1">Allergies</span>
                  <p className="text-rose-200 font-medium">
                    {selectedProfile.allergies.length > 0 ? selectedProfile.allergies.join(', ') : 'None Reported'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">Chronic Conditions</span>
                  <p className="text-amber-200 font-medium">
                    {selectedProfile.chronicConditions.length > 0 ? selectedProfile.chronicConditions.join(', ') : 'None'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Special Nurse Notes</span>
                <p className="text-slate-300">{selectedProfile.specialMedicalNotes}</p>
              </div>

              {/* Visit Logs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sickbay Visit History ({selectedProfile.clinicVisits.length})</span>
                </h4>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedProfile.clinicVisits.map((v) => (
                    <div key={v.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-rose-400">{v.complaint}</span>
                        <span className="text-slate-500">{v.visitDate} at {v.visitTime}</span>
                      </div>
                      <p className="text-slate-300"><span className="text-slate-500 font-semibold">Diagnosis:</span> {v.diagnosis}</p>
                      <p className="text-emerald-300"><span className="text-slate-500 font-semibold">Treatment:</span> {v.treatmentAdministered}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
              <HeartPulse className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Select a student health profile to view clinic history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showVisitModal && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" />
                <span>Log Sickbay Visit for {selectedProfile.studentName}</span>
              </h3>
              <button onClick={() => setShowVisitModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddVisit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Chief Complaint / Symptom</label>
                <input
                  type="text"
                  value={visitData.complaint}
                  onChange={(e) => setVisitData({ ...visitData, complaint: e.target.value })}
                  placeholder="e.g., Severe headache, fever, sprained ankle"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={visitData.diagnosis}
                  onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
                  placeholder="e.g., Acute malaria symptoms, physical strain"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Treatment & Administered Medication</label>
                <textarea
                  rows={2}
                  value={visitData.treatmentAdministered}
                  onChange={(e) => setVisitData({ ...visitData, treatmentAdministered: e.target.value })}
                  placeholder="e.g., Administered Paracetamol 500mg, 30 mins sickbed rest"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Save Sickbay Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
