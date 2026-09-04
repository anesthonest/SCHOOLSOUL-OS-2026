import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Building2,
  ShieldCheck,
  Award,
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  FileText,
  UserCheck,
  MessageSquare,
  Lock,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import type {
  SponsorProfile,
  StudentOpportunityProfile,
  ProjectSupportRequest,
  SchoolProgramSponsorship,
  ScholarshipOpportunity,
  SponsorInterestRequest,
  OpportunityApplication,
  EquipmentSupportRecord,
  SponsorshipAuditLog,
  SafeguardingReport,
  OpportunityMatchResult,
  RoleType,
} from '../../types';
import { SponsorshipService } from '../../services/sponsorshipService';
import { SponsorRegistrationModal } from '../../components/sponsorship/SponsorRegistrationModal';
import { ProjectSupportRequestModal } from '../../components/sponsorship/ProjectSupportRequestModal';
import { ScholarshipApplicationModal } from '../../components/sponsorship/ScholarshipApplicationModal';
import { SponsorInterestModal } from '../../components/sponsorship/SponsorInterestModal';
import { SafeguardingReportModal } from '../../components/sponsorship/SafeguardingReportModal';
import { ControlledMessageThreadModal } from '../../components/sponsorship/ControlledMessageThreadModal';

interface Props {
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: RoleType | 'SPONSOR';
}

type TabType =
  | 'OVERVIEW'
  | 'CANDIDATES'
  | 'PROJECTS_PROGRAMS'
  | 'SCHOLARSHIPS'
  | 'SPONSOR_VERIFICATION'
  | 'EQUIPMENT'
  | 'MESSAGING';

export const SchoolSponsorshipPage: React.FC<Props> = ({
  currentUserId = 'usr-admin-1',
  currentUserName = 'Sister Beatrice (Administrator)',
  currentUserRole = 'Super Administrator',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // Core Data Collections
  const [sponsors, setSponsors] = useState<SponsorProfile[]>([]);
  const [candidates, setCandidates] = useState<Partial<StudentOpportunityProfile>[]>([]);
  const [projectRequests, setProjectRequests] = useState<ProjectSupportRequest[]>([]);
  const [schoolPrograms, setSchoolPrograms] = useState<SchoolProgramSponsorship[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipOpportunity[]>([]);
  const [interests, setInterests] = useState<SponsorInterestRequest[]>([]);
  const [applications, setApplications] = useState<OpportunityApplication[]>([]);
  const [equipmentRecords, setEquipmentRecords] = useState<EquipmentSupportRecord[]>([]);
  const [safeguardingReports, setSafeguardingReports] = useState<SafeguardingReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<SponsorshipAuditLog[]>([]);
  const [matchedOpps, setMatchedOpps] = useState<OpportunityMatchResult[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentOpportunityProfile | null>(null);

  // Filters
  const [candidateSkillFilter, setCandidateSkillFilter] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [scholarshipFilter, setScholarshipFilter] = useState('');

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedScholarshipForApply, setSelectedScholarshipForApply] = useState<ScholarshipOpportunity | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestTarget, setInterestTarget] = useState<{
    type: 'CANDIDATE_PROFILE' | 'PROJECT_REQUEST' | 'SCHOOL_PROGRAM';
    id: string;
    title: string;
  } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetSponsor, setReportTargetSponsor] = useState<{ id?: string; name?: string }>({});
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [activeThread, setActiveThread] = useState<{
    id: string;
    title: string;
    sponsorId: string;
    sponsorName: string;
  } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        sponsorsData,
        candidatesData,
        projectsData,
        programsData,
        scholarshipsData,
        interestsData,
        applicationsData,
        equipmentData,
        reportsData,
        logsData,
        studentOppData,
        matchedData,
      ] = await Promise.all([
        SponsorshipService.getSponsors(),
        SponsorshipService.getCandidates(),
        SponsorshipService.getProjectRequests(),
        SponsorshipService.getSchoolPrograms(),
        SponsorshipService.getScholarships(),
        SponsorshipService.getSponsorInterests(),
        SponsorshipService.getApplications(),
        SponsorshipService.getEquipmentRecords(),
        SponsorshipService.getSafeguardingReports(),
        SponsorshipService.getAuditLogs(),
        SponsorshipService.getStudentOpportunityProfile('usr-student-1'),
        SponsorshipService.getMatchedOpportunities('usr-student-1'),
      ]);

      setSponsors(sponsorsData);
      setCandidates(candidatesData);
      setProjectRequests(projectsData);
      setSchoolPrograms(programsData);
      setScholarships(scholarshipsData);
      setInterests(interestsData);
      setApplications(applicationsData);
      setEquipmentRecords(equipmentData);
      setSafeguardingReports(reportsData);
      setAuditLogs(logsData);
      setStudentProfile(studentOppData);
      setMatchedOpps(matchedData);
    } catch (err) {
      console.error('Error loading sponsorship ecosystem data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySponsor = async (sponsorId: string, status: string, notes?: string) => {
    try {
      await SponsorshipService.verifySponsor(sponsorId, status, notes);
      await loadAllData();
    } catch (err) {
      console.error('Error verifying sponsor:', err);
    }
  };

  const handleApproveProject = async (requestId: string, approved: boolean) => {
    try {
      await SponsorshipService.schoolApproveProjectRequest(requestId, approved);
      await loadAllData();
    } catch (err) {
      console.error('Error approving project request:', err);
    }
  };

  const handleReviewInterest = async (interestId: string, decision: 'APPROVE' | 'DECLINE' | 'REQUEST_PARENT') => {
    try {
      await SponsorshipService.reviewSponsorInterest(interestId, decision);
      await loadAllData();
    } catch (err) {
      console.error('Error reviewing interest:', err);
    }
  };

  const handleUpdateEquipment = async (eqId: string, status: string) => {
    try {
      await SponsorshipService.updateEquipmentStatus(eqId, status);
      await loadAllData();
    } catch (err) {
      console.error('Error updating equipment status:', err);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (!c) return false;
    const matchesSkill = candidateSkillFilter
      ? c.verifiedSkills?.some(s => s.category.toLowerCase().includes(candidateSkillFilter.toLowerCase()))
      : true;
    const matchesSearch = candidateSearch
      ? c.candidateId?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
        c.approvedInterests?.some(i => i.toLowerCase().includes(candidateSearch.toLowerCase()))
      : true;
    return matchesSkill && matchesSearch;
  });

  const filteredScholarships = scholarships.filter(s => {
    if (!scholarshipFilter) return true;
    return (
      s.title.toLowerCase().includes(scholarshipFilter.toLowerCase()) ||
      s.sponsorName.toLowerCase().includes(scholarshipFilter.toLowerCase()) ||
      s.targetSkillCategories.some(c => c.toLowerCase().includes(scholarshipFilter.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>School-Governed Opportunity Ecosystem</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sponsorship & Student Opportunity Bridge
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Safely connecting verified student innovations, skills passports, and school STEM initiatives with vetted foundations,
              corporate CSRs, and higher education partners under strict child safeguarding oversight.
            </p>
          </div>

          {/* Quick Action CTA buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Register Sponsor</span>
            </button>
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Request Project Grant</span>
            </button>
            <button
              onClick={() => {
                setReportTargetSponsor({});
                setShowReportModal(true);
              }}
              className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Safeguarding Report</span>
            </button>
          </div>
        </div>

        {/* Global Impact Metric Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{sponsors.filter(s => s.verificationStatus === 'VERIFIED').length}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Verified Sponsors</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{candidates.length}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Approved Candidates</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{projectRequests.length}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Project Grants Open</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{scholarships.length}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Scholarships</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{equipmentRecords.length}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Equipment Kits</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">$8,620</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Support Pledged</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Overview & Impact', icon: TrendingUp },
          { id: 'CANDIDATES', label: 'Anonymized Discovery', icon: UserCheck },
          { id: 'PROJECTS_PROGRAMS', label: 'Student Projects & Labs', icon: Sparkles },
          { id: 'SCHOLARSHIPS', label: 'Scholarship Board & AI Match', icon: Award },
          { id: 'SPONSOR_VERIFICATION', label: 'Sponsor Governance & Audit', icon: ShieldCheck },
          { id: 'EQUIPMENT', label: 'Equipment & Hardware', icon: Package },
          { id: 'MESSAGING', label: 'Moderated Channels', icon: MessageSquare },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading SchoolSoul opportunity ecosystem...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & IMPACT */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spotlight 1: AI Opportunity Match for Student */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">AI-Evidence Opportunity Matches</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Transparent recommendations based on verified skills & missions</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('SCHOLARSHIPS')}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <span>Explore all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {matchedOpps.slice(0, 2).map((opp, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                              {opp.matchScore}% Match
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{opp.providerName}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{opp.opportunityTitle}</h3>
                          <ul className="mt-2 space-y-1">
                            {opp.matchReasons.slice(0, 2).map((reason, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                <span className="line-clamp-1">{reason.replace('✓ ', '')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => {
                            const found = scholarships.find(s => s.id === opp.opportunityId);
                            if (found) {
                              setSelectedScholarshipForApply(found);
                              setShowScholarshipModal(true);
                            }
                          }}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition"
                        >
                          Apply with Skills Passport
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spotlight 2: Safeguarding & Compliance Architecture */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">Safeguarding Governance</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">4-Tier Protection Protocol</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block">Anonymized Discovery</strong>
                        Sponsors only see candidate IDs (e.g. SS-CANDIDATE-2048) and verified skills.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                      <UserCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block">Parental & School Consent</strong>
                        All connections require explicit double-sign off before contact.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                      <DollarSign className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block">School Bursary Routed Funds</strong>
                        No direct unsupervised cash transfers. All disbursements vetted by Bursar.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Sponsors Directory Showcase */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Verified Sponsor Partners</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Accredited organizations supporting educational equity & innovation</p>
                  </div>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register New Sponsor</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sponsors.map(sponsor => (
                    <div
                      key={sponsor.id}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {sponsor.organizationType.replace('_', ' ')}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {sponsor.verificationStatus}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sponsor.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{sponsor.purpose}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{sponsor.country}</span>
                        <button
                          onClick={() => {
                            setActiveThread({
                              id: `thread-${sponsor.id}`,
                              title: `Supervised Inquiry - ${sponsor.name}`,
                              sponsorId: sponsor.id,
                              sponsorName: sponsor.name,
                            });
                            setShowMessageModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Contact</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANONYMIZED CANDIDATE DISCOVERY */}
          {activeTab === 'CANDIDATES' && (
            <div className="space-y-6">
              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={candidateSearch}
                    onChange={e => setCandidateSearch(e.target.value)}
                    placeholder="Search candidate ID or interest..."
                    className="w-full pl-9.5 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Skill Category:</span>
                  <select
                    value={candidateSkillFilter}
                    onChange={e => setCandidateSkillFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Technical">Technical & Coding</option>
                    <option value="Research">Research & Science</option>
                    <option value="Leadership">Leadership & Teamwork</option>
                    <option value="Communication">Communication & Oratory</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                  </select>
                </div>
              </div>

              {/* Candidate Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                            SS
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{candidate.candidateId}</span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">{candidate.ageGradeBand}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Vetted Profile
                        </span>
                      </div>

                      {/* Verified Skills */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verified Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.verifiedSkills?.slice(0, 3).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {skill.skillName} ({skill.level})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Scorecard Bar */}
                      {candidate.scorecard && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            <span>Innovation: {candidate.scorecard.innovation}/10</span>
                            <span>Tech: {candidate.scorecard.technicalSkills}/10</span>
                            <span>Lead: {candidate.scorecard.leadership}/10</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${((candidate.scorecard.innovation + candidate.scorecard.technicalSkills) / 20) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Seeking Support */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Seeking Support</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.seekingSupportTypes?.map((sup, supIdx) => (
                            <span
                              key={supIdx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-800"
                            >
                              {sup.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{candidate.verifiedProjectsCount || 0} projects completed</span>
                      <button
                        onClick={() => {
                          setInterestTarget({
                            type: 'CANDIDATE_PROFILE',
                            id: candidate.candidateId || 'candidate',
                            title: `Candidate ${candidate.candidateId}`,
                          });
                          setShowInterestModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Offer Support</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS & SCHOOL LAB PROGRAMS */}
          {activeTab === 'PROJECTS_PROGRAMS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Student Innovation Projects & Grants</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vetted real-world community technology prototypes seeking funding</p>
                </div>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Project Request</span>
                </button>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectRequests.map(project => (
                  <div
                    key={project.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {project.projectCategory}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ${project.estimatedBudget} {project.currency}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{project.projectTitle}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{project.summary}</p>
                      </div>

                      {/* Materials needed */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Materials Needed</p>
                        <div className="flex flex-wrap gap-1.5">
                          {project.materialsNeeded.map((mat, mIdx) => (
                            <span
                              key={mIdx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Team: <strong className="text-slate-800 dark:text-slate-200">{project.teamName}</strong> ({project.memberCount} members)
                      </div>
                      <div className="flex items-center gap-2">
                        {project.schoolApprovalStatus === 'PENDING' && (
                          <button
                            onClick={() => handleApproveProject(project.id, true)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setInterestTarget({
                              type: 'PROJECT_REQUEST',
                              id: project.id,
                              title: project.projectTitle,
                            });
                            setShowInterestModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Pledge Grant</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* School Program Labs Showcase */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Institutional School Lab Programs</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Large-scale STEM, Robotics & Agricultural infrastructure sponsorships</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schoolPrograms.map(prog => (
                    <div
                      key={prog.id}
                      className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{prog.category} Program</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Target: ${prog.targetBudget} {prog.currency}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{prog.programName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{prog.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">{prog.targetStudentsCount} students impacted</span>
                        <button
                          onClick={() => {
                            setInterestTarget({
                              type: 'SCHOOL_PROGRAM',
                              id: prog.id,
                              title: prog.programName,
                            });
                            setShowInterestModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                          Sponsor Program Lab →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHOLARSHIPS & AI MATCH */}
          {activeTab === 'SCHOLARSHIPS' && (
            <div className="space-y-6">
              {/* Scholarship Board */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Scholarship & Grant Board</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verified educational scholarships and innovation awards</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={scholarshipFilter}
                    onChange={e => setScholarshipFilter(e.target.value)}
                    placeholder="Search scholarships..."
                    className="w-full pl-9.5 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredScholarships.map(sch => (
                  <div
                    key={sch.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 dark:hover:border-purple-700 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {sch.supportType.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                          ${sch.amountValue} {sch.currency}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{sch.title}</h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">By {sch.sponsorName}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{sch.description}</p>
                      </div>

                      {/* Criteria */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Eligibility Criteria</p>
                        <ul className="space-y-1">
                          {sch.eligibilityCriteria.map((crit, cIdx) => (
                            <li key={cIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              <span>{crit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Deadline: <strong>{new Date(sch.deadline).toLocaleDateString()}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedScholarshipForApply(sch);
                          setShowScholarshipModal(true);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>Apply for Grant</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SPONSOR VERIFICATION & AUDIT GOVERNANCE */}
          {activeTab === 'SPONSOR_VERIFICATION' && (
            <div className="space-y-6">
              {/* Sponsor Verification Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Sponsor Accreditation & Risk Review</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">School Admin vetting of external educational foundations and corporate CSRs</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Organization</th>
                        <th className="pb-3">Type & Country</th>
                        <th className="pb-3">Contact Email</th>
                        <th className="pb-3">Risk Score</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sponsors.map(sponsor => (
                        <tr key={sponsor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">{sponsor.name}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">
                            {sponsor.organizationType} • {sponsor.country}
                          </td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">{sponsor.officialContactEmail}</td>
                          <td className="py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sponsor.riskScore <= 10
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                  : sponsor.riskScore <= 30
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                              }`}
                            >
                              Risk: {sponsor.riskScore}/100
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                sponsor.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                  : sponsor.verificationStatus === 'SUSPENDED'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                              }`}
                            >
                              {sponsor.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            {sponsor.verificationStatus !== 'VERIFIED' && (
                              <button
                                onClick={() => handleVerifySponsor(sponsor.id, 'VERIFIED', 'Verified by Headteacher')}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            )}
                            {sponsor.verificationStatus !== 'SUSPENDED' && (
                              <button
                                onClick={() => handleVerifySponsor(sponsor.id, 'SUSPENDED', 'Safeguarding freeze')}
                                className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
                              >
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safeguarding Reports Resolution Vault */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Safeguarding & Safety Reports</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Strict disciplinary reviews and student protection records</p>
                  </div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{safeguardingReports.length} Open Inquiries</span>
                </div>

                {safeguardingReports.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400">
                    No open safeguarding tickets. All student opportunity channels are healthy and compliant.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {safeguardingReports.map(rep => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col md:flex-row justify-between md:items-center gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-rose-200/60 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 font-bold uppercase tracking-wider text-[10px]">
                              {rep.severity} SEVERITY
                            </span>
                            <span className="text-slate-500 font-medium">Reported by {rep.reportedByName}</span>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white">{rep.reasonCategory.replace('_', ' ')}</p>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{rep.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            SponsorshipService.resolveSafeguardingReport(rep.id, 'ACTION_TAKEN', 'Investigated and resolved');
                            loadAllData();
                          }}
                          className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 shrink-0"
                        >
                          Resolve & Close Ticket
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Immutable Sponsorship Audit Trail */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Immutable Sponsorship Audit Trail</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Timestamped record of all consent, disbursements, and clearances</p>
                </div>

                <div className="space-y-2">
                  {auditLogs.slice(0, 5).map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200 block">{log.action.replace('_', ' ')}</strong>
                          <span className="text-slate-500 dark:text-slate-400">{log.details}</span>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400 shrink-0">
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span className="block font-semibold text-slate-600 dark:text-slate-300">{log.performedByName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EQUIPMENT & HARDWARE */}
          {activeTab === 'EQUIPMENT' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Equipment & Hardware Logistics Registry</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tracking sponsored laptops, IoT sensor kits, and laboratory apparatus</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {equipmentRecords.map(item => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {item.itemCategory.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          ${item.estimatedValue} {item.currency}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.itemName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Sponsor: {item.sponsorName}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-1">
                          Serial/Batch: {item.serialNumberOrBatch || 'N/A'} (Qty: {item.quantity})
                        </p>
                      </div>

                      {/* Recipient info */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-400 block font-semibold uppercase text-[10px]">Allocated Recipient</span>
                        <strong className="text-slate-900 dark:text-white">
                          {item.recipientCandidateId ? `Candidate ${item.recipientCandidateId}` : item.recipientTeamOrLabName}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                        {item.status.replace('_', ' ')}
                      </span>

                      {/* Action to advance status */}
                      {item.status === 'DELIVERED_TO_SCHOOL' && (
                        <button
                          onClick={() => handleUpdateEquipment(item.id, 'INSPECTED_VERIFIED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                        >
                          Inspect & Verify Lab Kit
                        </button>
                      )}
                      {item.status === 'INSPECTED_VERIFIED' && (
                        <button
                          onClick={() => handleUpdateEquipment(item.id, 'ASSIGNED_TO_STUDENT')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                        >
                          Assign to Candidate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MODERATED MESSAGING */}
          {activeTab === 'MESSAGING' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Supervised Opportunity Channels</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">All student-sponsor communication is routed through school leadership moderation</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sponsors.map(sponsor => (
                    <div
                      key={sponsor.id}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sponsor.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Moderated thread for grant & project oversight</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveThread({
                            id: `thread-${sponsor.id}`,
                            title: `Supervised Thread - ${sponsor.name}`,
                            sponsorId: sponsor.id,
                            sponsorName: sponsor.name,
                          });
                          setShowMessageModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Thread</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <SponsorRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={loadAllData}
      />

      <ProjectSupportRequestModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSuccess={loadAllData}
      />

      <ScholarshipApplicationModal
        isOpen={showScholarshipModal}
        onClose={() => setShowScholarshipModal(false)}
        onSuccess={loadAllData}
        scholarship={selectedScholarshipForApply}
      />

      {interestTarget && (
        <SponsorInterestModal
          isOpen={showInterestModal}
          onClose={() => {
            setShowInterestModal(false);
            setInterestTarget(null);
          }}
          onSuccess={loadAllData}
          targetType={interestTarget.type}
          targetId={interestTarget.id}
          targetTitle={interestTarget.title}
        />
      )}

      <SafeguardingReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={loadAllData}
        sponsorId={reportTargetSponsor.id}
        sponsorName={reportTargetSponsor.name}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserRole={currentUserRole as RoleType}
      />

      {activeThread && (
        <ControlledMessageThreadModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setActiveThread(null);
          }}
          threadId={activeThread.id}
          threadTitle={activeThread.title}
          sponsorId={activeThread.sponsorId}
          sponsorName={activeThread.sponsorName}
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
};
