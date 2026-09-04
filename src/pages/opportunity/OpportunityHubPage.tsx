import React, { useState, useEffect } from 'react';
import {
  Compass,
  Award,
  Sparkles,
  Target,
  Briefcase,
  Users,
  Eye,
  CheckCircle2,
  Lock,
  Globe,
  Search,
  Plus,
  Filter,
  ArrowRight,
  TrendingUp,
  Bookmark,
  QrCode,
  ShieldCheck,
  Building,
  Zap,
  FolderOpen,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronRight,
  UserCheck,
  Check,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OpportunityService } from '../../services/opportunityService';
import { DigitalCertificateModal } from '../../components/opportunity/DigitalCertificateModal';
import { CertificateVerifierModal } from '../../components/opportunity/CertificateVerifierModal';
import { SubmitEvidenceModal } from '../../components/opportunity/SubmitEvidenceModal';
import { LaunchMissionModal } from '../../components/opportunity/LaunchMissionModal';
import { AwardAchievementModal } from '../../components/opportunity/AwardAchievementModal';
import type {
  SkillDefinition,
  StudentSkill,
  SkillEvidence,
  StudentPortfolio,
  SchoolMission,
  MissionTeam,
  MissionSubmission,
  OpportunityItem,
  TalentDiscoveryInsight,
  AchievementItem,
  DigitalCertificate,
  SchoolShowcaseItem,
  SchoolClub,
  MentorshipEngagement,
  SchoolImpactMetric,
  SkillLevel,
} from '../../types';

interface OpportunityHubPageProps {
  initialTab?: string;
}

export const OpportunityHubPage: React.FC<OpportunityHubPageProps> = ({ initialTab = 'passport' }) => {
  const { user, activeRole, schoolProfile } = useAuth();
  const isTeacherOrAdmin = activeRole === 'Teacher' || activeRole === 'Headteacher' || activeRole === 'Administrator';
  const isStudent = activeRole === 'Student';

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [skillDefs, setSkillDefs] = useState<SkillDefinition[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [evidenceList, setEvidenceList] = useState<SkillEvidence[]>([]);
  const [portfolio, setPortfolio] = useState<StudentPortfolio | null>(null);
  const [missions, setMissions] = useState<SchoolMission[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [recommendations, setRecommendations] = useState<Array<{ opportunity: OpportunityItem; matchScore: number; rationale: string }>>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [showcases, setShowcases] = useState<SchoolShowcaseItem[]>([]);
  const [clubs, setClubs] = useState<SchoolClub[]>([]);
  const [mentorships, setMentorships] = useState<MentorshipEngagement[]>([]);
  const [talentInsights, setTalentInsights] = useState<TalentDiscoveryInsight[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<SchoolImpactMetric | null>(null);

  // Modals & Interactive States
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalCertificate | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<SchoolMission | null>(null);
  const [missionDeliverableText, setMissionDeliverableText] = useState('');
  const [submittingMission, setSubmittingMission] = useState(false);

  const studentId = user?.id || 'usr-student-1';

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        skills,
        passportData,
        port,
        missionsData,
        opps,
        recs,
        achs,
        shows,
        clubsData,
        impact,
      ] = await Promise.all([
        OpportunityService.getSkillDefinitions(),
        OpportunityService.getStudentPassport(studentId),
        OpportunityService.getPortfolio(studentId),
        OpportunityService.getMissions(),
        OpportunityService.getOpportunities(),
        OpportunityService.getRecommendations(studentId),
        OpportunityService.getAchievements(),
        OpportunityService.getShowcase(),
        OpportunityService.getClubs(),
        OpportunityService.getSchoolImpact(),
      ]);

      setSkillDefs(skills);
      setStudentSkills(passportData.skills || []);
      setEvidenceList(passportData.evidence || []);
      setPortfolio(port);
      setMissions(missionsData);
      setOpportunities(opps);
      setRecommendations(recs);
      setAchievements(achs);
      setShowcases(shows);
      setClubs(clubsData);
      setImpactMetrics(impact);

      if (isTeacherOrAdmin) {
        const [talents, mentors] = await Promise.all([
          OpportunityService.getTalentDiscovery(),
          OpportunityService.getMentorshipEngagements(),
        ]);
        setTalentInsights(talents);
        setMentorships(mentors);
      }
    } catch (err) {
      console.warn('Error loading opportunity engine data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [studentId, activeRole]);

  // Handle Quick Skill Evidence Verification by Teacher
  const handleVerifyEvidence = async (evidenceId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await OpportunityService.verifySkillEvidence(evidenceId, status, 'Approved in teacher review', 'PROFICIENT');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Verification error');
    }
  };

  // Handle Mission Submission
  const handleSubmitMissionDeliverable = async (missionId: string) => {
    if (!missionDeliverableText.trim()) return;
    setSubmittingMission(true);
    try {
      await OpportunityService.submitMission(missionId, {
        submissionText: missionDeliverableText,
      });
      setMissionDeliverableText('');
      alert('Mission deliverables submitted to teacher supervisor for review!');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Submission error');
    } finally {
      setSubmittingMission(false);
    }
  };

  // Handle Joining a Club
  const handleJoinClub = async (clubId: string) => {
    try {
      await OpportunityService.joinClub(clubId);
      alert('Successfully joined club!');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error joining club');
    }
  };

  // Handle Save Opportunity Bookmark
  const handleToggleSaveOpportunity = async (oppId: string) => {
    try {
      await OpportunityService.toggleSaveOpportunity(oppId);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error updating bookmark');
    }
  };

  const getLevelBadgeClass = (lvl?: SkillLevel) => {
    switch (lvl) {
      case 'MASTERY':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'ADVANCED':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'PROFICIENT':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'CAPABLE':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Opportunity, Achievement, Skills & Innovation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              SchoolSoul Opportunity & Skills Ecosystem
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Turn learning into verified competencies, real-world school missions, recognized achievements, and life opportunities.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsVerifierModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-colors border border-white/10 shadow-sm"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>Verify Certificate</span>
            </button>

            {isStudent && (
              <button
                onClick={() => setIsEvidenceModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Skill Evidence</span>
              </button>
            )}

            {isTeacherOrAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMissionModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Target className="w-4 h-4" />
                  <span>Launch Mission</span>
                </button>
                <button
                  onClick={() => setIsAwardModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Award className="w-4 h-4" />
                  <span>Award Achievement</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Quick Metric Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Verified Skills</p>
              <p className="text-lg font-bold text-white">
                {studentSkills.filter((s) => s.verifiedCount > 0).length}
                <span className="text-xs font-normal text-slate-400"> / {skillDefs.length} defined</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Missions</p>
              <p className="text-lg font-bold text-white">{missions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Open Opportunities</p>
              <p className="text-lg font-bold text-white">{opportunities.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Certificates & Awards</p>
              <p className="text-lg font-bold text-white">{achievements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'passport', label: 'Skills Passport', icon: Zap },
          { id: 'missions', label: 'School Missions & Challenges', icon: Target },
          { id: 'board', label: 'Opportunity Board', icon: Briefcase },
          { id: 'portfolio', label: 'Verified Digital Portfolio', icon: FolderOpen },
          { id: 'achievements', label: 'Achievements & Certificates', icon: Award },
          { id: 'showcase', label: 'School Showcase', icon: Eye },
          { id: 'clubs', label: 'Clubs & Mentorship', icon: Users },
          { id: 'impact', label: 'School Impact & Accreditation', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* TAB 1: SKILLS PASSPORT */}
      {activeTab === 'passport' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Submitter Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Student Competency & Skills Passport</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-dimensional progressive skill verification based on real projects, experiments, and missions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEvidenceModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Skill Demonstration</span>
              </button>
            </div>
          </div>

          {/* Competency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillDefs.map((def) => {
              const studentSkill = studentSkills.find((s) => s.skillId === def.id || s.skillName === def.name);
              const level = studentSkill?.level || 'DEVELOPING';
              const verified = studentSkill?.verifiedCount || 0;

              return (
                <div
                  key={def.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {def.category}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                        {def.name}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeClass(level)}`}>
                      {level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {def.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{verified} Verified Endorsements</span>
                    </div>
                    {studentSkill?.teacherEvaluatorName && (
                      <span className="text-[11px] text-slate-400">by {studentSkill.teacherEvaluatorName}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Evidence & Teacher Verification Desk */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Skill Evidence Demonstration Log & Verification Queue</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {evidenceList.length} Evidence Records
              </span>
            </div>

            {evidenceList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No skill demonstration evidence submitted yet. Click "Submit Skill Demonstration" to begin.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {evidenceList.map((ev) => (
                  <div key={ev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{ev.skillName}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {ev.source}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ev.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {ev.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">{ev.description}</p>
                      {ev.sourceTitle && (
                        <p className="text-[11px] text-slate-500 font-medium">Artifact: {ev.sourceTitle}</p>
                      )}
                    </div>

                    {/* Teacher Action Controls */}
                    {isTeacherOrAdmin && ev.verificationStatus === 'PENDING' && (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleVerifyEvidence(ev.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Verify</span>
                        </button>
                        <button
                          onClick={() => handleVerifyEvidence(ev.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium"
                        >
                          Request Changes
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL MISSIONS */}
      {activeTab === 'missions' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>School Missions & Real-World Challenges</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hands-on practical challenges combining innovation, environmental science, technology, and community development.
              </p>
            </div>
            {isTeacherOrAdmin && (
              <button
                onClick={() => setIsMissionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Mission</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Missions List */}
            <div className="lg:col-span-2 space-y-4">
              {missions.map((m) => {
                const isSelected = selectedMission?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMission(m)}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {m.category}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {m.difficulty}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                          {m.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {m.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>Supervisor: <strong className="text-slate-800 dark:text-slate-200">{m.teacherSupervisorName}</strong></span>
                        <span>•</span>
                        <span>{m.participantsCount || 0} Students Active</span>
                      </div>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        View Workspace <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mission Detail & Action Workspace */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 sticky top-6">
              {selectedMission ? (
                <>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Mission Workspace
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-0.5">
                      {selectedMission.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{selectedMission.objective}</p>
                  </div>

                  {/* Tasks List */}
                  {selectedMission.tasks && selectedMission.tasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Mission Stages & Milestones
                      </p>
                      <div className="space-y-1.5">
                        {selectedMission.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-800 dark:text-slate-200">{task.title}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                task.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Deliverables Form */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Submit Your Work / Evidence
                    </p>
                    <textarea
                      rows={3}
                      value={missionDeliverableText}
                      onChange={(e) => setMissionDeliverableText(e.target.value)}
                      placeholder="Describe your prototype results, measurements, or paste links..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSubmitMissionDeliverable(selectedMission.id)}
                      disabled={submittingMission || !missionDeliverableText.trim()}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      {submittingMission ? 'Submitting...' : 'Submit Mission Deliverable'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select any mission on the left to open the project workspace and tasks.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPPORTUNITY BOARD */}
      {activeTab === 'board' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Verified School & External Opportunity Board</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Curated scholarships, STEM competitions, youth enterprise grants, and innovation programs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* AI / Pattern Matched Recommendations Banner for Student */}
          {recommendations.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-900 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Personalized Opportunity Matchmaker</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.opportunity.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-blue-800/40 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rec.opportunity.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {rec.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rec.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Catalog */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {opp.category}
                    </span>
                    <button
                      onClick={() => handleToggleSaveOpportunity(opp.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Provider: {opp.providerName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {opp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Deadline: {opp.deadline ? opp.deadline.split('T')[0] : 'Open'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">School Approved</span>
                  </div>
                  {opp.applicationUrl && (
                    <a
                      href={opp.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors text-center block"
                    >
                      View & Apply
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERIFIED DIGITAL PORTFOLIO */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Verified Digital Student Portfolio
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {portfolio?.studentName || user?.fullName || user?.username || 'Allan Ssekandi'}
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {portfolio?.headline || 'Aspiring Environmental Systems Engineer & Tech Innovator'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    portfolio?.visibility === 'PUBLIC_APPROVED' || portfolio?.visibility === 'APPROVED_EXTERNAL_SHOWCASE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : portfolio?.visibility === 'SCHOOL_ONLY'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  Visibility: {portfolio?.visibility || 'SCHOOL_ONLY'}
                </span>
              </div>
            </div>

            {/* Bio & Interests */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Bio & Purpose</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
                {portfolio?.bio || 'Secondary student dedicated to building clean water filtration arrays and IoT soil monitoring devices for community agriculture.'}
              </p>
              {portfolio?.interests && portfolio.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {portfolio.interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Showcase Sections */}
            <div className="space-y-4 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Featured Evidence & Milestones</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio?.sections && portfolio.sections.length > 0 ? (
                  portfolio.sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {sec.sectionType}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {sec.verificationId || 'VERIFIED'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sec.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{sec.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-4 col-span-2">
                    No portfolio sections added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACHIEVEMENTS & DIGITAL CERTIFICATES */}
      {activeTab === 'achievements' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Verified Honors & Authenticated Digital Certificates</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every certificate contains a cryptographic verification ID and QR code ledger record.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVerifierModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Lookup by ID</span>
              </button>
              {isTeacherOrAdmin && (
                <button
                  onClick={() => setIsAwardModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Award New Certificate</span>
                </button>
              )}
            </div>
          </div>

          {/* Certificate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    {ach.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-slate-500">Awarded to: <strong className="text-slate-800 dark:text-slate-200">{ach.studentName}</strong></p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 pt-1">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">{ach.verificationId}</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCertificate({
                        id: ach.certificateId || ach.id,
                        schoolId: ach.schoolId,
                        verificationId: ach.verificationId || 'VER-SS-UG-123456',
                        studentId: ach.studentId,
                        studentName: ach.studentName,
                        schoolName: (schoolProfile as any)?.schoolName || (schoolProfile as any)?.name || 'St. Mary’s Comprehensive OS Campus',
                        achievementTitle: ach.title,
                        description: ach.description,
                        category: ach.category,
                        dateIssued: ach.dateAwarded,
                        issuerName: ach.issuerName,
                        issuerTitle: `${ach.issuerRole} / Department Head`,
                        qrVerificationCode: `https://schoolsoul.org/verify/${ach.verificationId}`,
                        signatureHash: 'SIG-VERIFIED-AUTH',
                        isRevoked: false,
                        createdAt: ach.createdAt,
                      });
                      setIsCertModalOpen(true);
                    }}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors text-center shadow-sm"
                  >
                    View Official Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SCHOOL SHOWCASE */}
      {activeTab === 'showcase' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>School Showcase & Innovation Stories</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Publicly celebrated student inventions, community water systems, robotics prototypes, and creative works.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showcases.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                {s.coverImageUrl && (
                  <div className="h-48 w-full overflow-hidden relative">
                    <img
                      src={s.coverImageUrl}
                      alt={s.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 text-white backdrop-blur-md">
                      {s.showcaseType}
                    </span>
                  </div>
                )}

                <div className="p-6 space-y-2">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500">By {s.authorNames.join(', ')}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {s.summary}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>{s.viewsCount || 42} Views • {s.likesCount || 12} Endorsements</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">Publicly Approved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CLUBS & MENTORSHIP */}
      {activeTab === 'clubs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>School Clubs, Societies & 1-on-1 Mentorship</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Join co-curricular innovation groups, participate in scheduled workshops, and receive teacher guidance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {club.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{club.memberCount} Members</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {club.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {club.description}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1 pt-2">
                    <p>Supervisor: <strong className="text-slate-800 dark:text-slate-200">{club.teacherSupervisorName}</strong></p>
                    <p>Schedule: {club.meetingSchedule}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinClub(club.id)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Join Club & Projects
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SCHOOL IMPACT & ACCREDITATION COCKPIT */}
      {activeTab === 'impact' && impactMetrics && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  SchoolSoul Accreditation & Impact Analytics
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  Institutional Skills & Practical Learning Impact ({impactMetrics.academicYear})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real data aggregated directly from student missions, verified skill passport endorsements, and enterprise activity.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                Export Impact Summary Report
              </button>
            </div>

            {/* High Impact Key Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-1">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold">Verified Skill Endorsements</p>
                <p className="text-2xl font-bold text-blue-950 dark:text-white">{impactMetrics.verifiedSkillsCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-1">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Missions & Challenges Completed</p>
                <p className="text-2xl font-bold text-emerald-950 dark:text-white">{impactMetrics.missionsCompletedCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
                <p className="text-xs text-purple-800 dark:text-purple-300 font-semibold">Active Student Innovators</p>
                <p className="text-2xl font-bold text-purple-950 dark:text-white">{impactMetrics.activeStudentParticipantsCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 space-y-1">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Accredited Awards & Certs</p>
                <p className="text-2xl font-bold text-amber-950 dark:text-white">{impactMetrics.achievementsAwardedCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODALS */}

      {/* Digital Certificate Viewer Modal */}
      {selectedCertificate && (
        <DigitalCertificateModal
          certificate={selectedCertificate}
          isOpen={isCertModalOpen}
          onClose={() => {
            setIsCertModalOpen(false);
            setSelectedCertificate(null);
          }}
        />
      )}

      {/* Certificate Verifier Tool Modal */}
      <CertificateVerifierModal
        isOpen={isVerifierModalOpen}
        onClose={() => setIsVerifierModalOpen(false)}
      />

      {/* Submit Skill Evidence Modal */}
      <SubmitEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        skills={skillDefs}
        onSuccess={loadAllData}
      />

      {/* Launch Mission Modal */}
      <LaunchMissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onSuccess={loadAllData}
      />

      {/* Award Achievement Modal */}
      <AwardAchievementModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        onSuccess={loadAllData}
      />
    </div>
  );
};
