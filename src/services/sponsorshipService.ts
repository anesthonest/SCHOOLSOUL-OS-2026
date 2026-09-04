import type {
  SponsorProfile,
  StudentOpportunityProfile,
  ProjectSupportRequest,
  SchoolProgramSponsorship,
  ScholarshipOpportunity,
  SponsorInterestRequest,
  OpportunityApplication,
  EquipmentSupportRecord,
  ControlledOpportunityMessage,
  SponsorshipAuditLog,
  SafeguardingReport,
  OpportunityMatchResult,
  SponsorImpactReport,
} from '../types';
import { getAuthHeaders } from './api';

const API_BASE = '/api';

export class SponsorshipService {
  private static CACHE_PREFIX = 'schoolsoul_sponsorship_';

  private static async authFetch(url: string, init?: RequestInit): Promise<Response> {
    const defaultHeaders = init?.body && typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {};
    const mergedHeaders = getAuthHeaders({
      ...defaultHeaders,
      ...(init?.headers as Record<string, string> || {}),
    });
    return fetch(url, {
      ...init,
      headers: mergedHeaders,
    });
  }

  private static getCache<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static setCache(key: string, data: any): void {
    try {
      localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(data));
    } catch {
      // localStorage quota safeguard
    }
  }

  // ==========================================================================
  // 1. SPONSORS & VERIFICATION
  // ==========================================================================

  static async getSponsors(status?: string): Promise<SponsorProfile[]> {
    try {
      const url = status ? `${API_BASE}/sponsorship/sponsors?status=${encodeURIComponent(status)}` : `${API_BASE}/sponsorship/sponsors`;
      const res = await this.authFetch(url);
      if (res.ok) {
        const data = await res.json();
        this.setCache('sponsors_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching sponsors, returning cache:', err);
    }
    return this.getCache<SponsorProfile[]>('sponsors_list') || [];
  }

  static async registerSponsor(payload: Partial<SponsorProfile>): Promise<SponsorProfile> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/sponsors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to register sponsor organization');
    return res.json();
  }

  static async verifySponsor(sponsorId: string, status: string, notes?: string): Promise<SponsorProfile> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/sponsors/${sponsorId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, verificationNotes: notes }),
    });
    if (!res.ok) throw new Error('Failed to update sponsor verification');
    return res.json();
  }

  // ==========================================================================
  // 2. CANDIDATES & STUDENT OPPORTUNITY PROFILES
  // ==========================================================================

  static async getCandidates(filter?: { skill?: string; interest?: string; supportType?: string }): Promise<Partial<StudentOpportunityProfile>[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.skill) params.append('skill', filter.skill);
      if (filter?.interest) params.append('interest', filter.interest);
      if (filter?.supportType) params.append('supportType', filter.supportType);

      const res = await this.authFetch(`${API_BASE}/sponsorship/candidates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.setCache('candidates_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching candidates, returning cache:', err);
    }
    return this.getCache<Partial<StudentOpportunityProfile>[]>('candidates_list') || [];
  }

  static async getStudentOpportunityProfile(studentId: string): Promise<StudentOpportunityProfile> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/student-profile/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        this.setCache(`student_opp_profile_${studentId}`, data);
        return data;
      }
    } catch (err) {
      console.warn(`Network error fetching opportunity profile for ${studentId}:`, err);
    }
    return (
      this.getCache<StudentOpportunityProfile>(`student_opp_profile_${studentId}`) || {
        id: `opp-prof-${studentId}`,
        schoolId: 'school-001',
        studentId,
        candidateId: 'SS-CANDIDATE-2048',
        ageGradeBand: 'Senior Secondary (16-18)',
        visibility: 'APPROVED_SPONSOR_DISCOVERY',
        approvedInterests: ['Clean Water', 'STEM', 'Programming'],
        verifiedSkills: [],
        verifiedProjectsCount: 1,
        verifiedAchievementsCount: 1,
        missionsCompletedCount: 1,
        scorecard: {
          innovation: 8,
          technicalSkills: 8,
          leadership: 7,
          communication: 8,
          projectExperience: 8,
        },
        seekingSupportTypes: ['SCHOLARSHIP', 'EQUIPMENT'],
        goals: ['Attain engineering scholarship'],
        schoolApprovalStatus: 'APPROVED',
        parentConsentRequired: true,
        parentConsentStatus: 'APPROVED',
        updatedAt: new Date().toISOString(),
      }
    );
  }

  static async updateStudentOpportunityProfile(
    studentId: string,
    payload: Partial<StudentOpportunityProfile>
  ): Promise<StudentOpportunityProfile> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/student-profile/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update student opportunity profile');
    const data = await res.json();
    this.setCache(`student_opp_profile_${studentId}`, data);
    return data;
  }

  static async schoolApproveProfile(studentId: string, approved: boolean): Promise<StudentOpportunityProfile> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/student-profile/${studentId}/school-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) throw new Error('Failed to record school approval');
    return res.json();
  }

  static async parentConsentProfile(studentId: string, consentApproved: boolean, notes?: string): Promise<StudentOpportunityProfile> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/student-profile/${studentId}/parent-consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentApproved, notes }),
    });
    if (!res.ok) throw new Error('Failed to record parent consent');
    return res.json();
  }

  // ==========================================================================
  // 3. PROJECT & SCHOOL PROGRAM SUPPORT
  // ==========================================================================

  static async getProjectRequests(): Promise<ProjectSupportRequest[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/projects`);
      if (res.ok) {
        const data = await res.json();
        this.setCache('project_requests', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching project requests:', err);
    }
    return this.getCache<ProjectSupportRequest[]>('project_requests') || [];
  }

  static async createProjectRequest(payload: Partial<ProjectSupportRequest>): Promise<ProjectSupportRequest> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit project sponsorship request');
    return res.json();
  }

  static async schoolApproveProjectRequest(requestId: string, approved: boolean): Promise<ProjectSupportRequest> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/projects/${requestId}/school-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) throw new Error('Failed to approve project request');
    return res.json();
  }

  static async getSchoolPrograms(): Promise<SchoolProgramSponsorship[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/programs`);
      if (res.ok) {
        const data = await res.json();
        this.setCache('school_programs', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching school programs:', err);
    }
    return this.getCache<SchoolProgramSponsorship[]>('school_programs') || [];
  }

  static async createSchoolProgram(payload: Partial<SchoolProgramSponsorship>): Promise<SchoolProgramSponsorship> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create school program sponsorship');
    return res.json();
  }

  // ==========================================================================
  // 4. SCHOLARSHIPS & AI OPPORTUNITY MATCHING
  // ==========================================================================

  static async getScholarships(): Promise<ScholarshipOpportunity[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/scholarships`);
      if (res.ok) {
        const data = await res.json();
        this.setCache('scholarships_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching scholarships:', err);
    }
    return this.getCache<ScholarshipOpportunity[]>('scholarships_list') || [];
  }

  static async createScholarship(payload: Partial<ScholarshipOpportunity>): Promise<ScholarshipOpportunity> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/scholarships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to post scholarship');
    return res.json();
  }

  static async getMatchedOpportunities(studentId: string): Promise<OpportunityMatchResult[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/matching/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        this.setCache(`matched_opps_${studentId}`, data);
        return data;
      }
    } catch (err) {
      console.warn(`Network error fetching matched opportunities for ${studentId}:`, err);
    }
    return this.getCache<OpportunityMatchResult[]>(`matched_opps_${studentId}`) || [];
  }

  // ==========================================================================
  // 5. SPONSOR INTERESTS & APPLICATIONS
  // ==========================================================================

  static async getSponsorInterests(sponsorId?: string): Promise<SponsorInterestRequest[]> {
    try {
      const url = sponsorId
        ? `${API_BASE}/sponsorship/interests?sponsorId=${encodeURIComponent(sponsorId)}`
        : `${API_BASE}/sponsorship/interests`;
      const res = await this.authFetch(url);
      if (res.ok) {
        const data = await res.json();
        this.setCache('sponsor_interests', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching sponsor interests:', err);
    }
    return this.getCache<SponsorInterestRequest[]>('sponsor_interests') || [];
  }

  static async submitSponsorInterest(payload: Partial<SponsorInterestRequest>): Promise<SponsorInterestRequest> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit sponsor interest');
    return res.json();
  }

  static async reviewSponsorInterest(interestId: string, decision: 'APPROVE' | 'DECLINE' | 'REQUEST_PARENT', notes?: string): Promise<SponsorInterestRequest> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/interests/${interestId}/school-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, schoolReviewNotes: notes }),
    });
    if (!res.ok) throw new Error('Failed to record review decision');
    return res.json();
  }

  static async getApplications(studentId?: string, opportunityId?: string): Promise<OpportunityApplication[]> {
    try {
      const params = new URLSearchParams();
      if (studentId) params.append('studentId', studentId);
      if (opportunityId) params.append('opportunityId', opportunityId);

      const res = await this.authFetch(`${API_BASE}/sponsorship/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        this.setCache('applications_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching applications:', err);
    }
    return this.getCache<OpportunityApplication[]>('applications_list') || [];
  }

  static async submitApplication(payload: Partial<OpportunityApplication>): Promise<OpportunityApplication> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit opportunity application');
    return res.json();
  }

  static async decideSchoolApplication(appId: string, decision: 'APPROVED_FOR_SPONSOR' | 'REJECTED'): Promise<OpportunityApplication> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/applications/${appId}/school-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    if (!res.ok) throw new Error('Failed to record school application decision');
    return res.json();
  }

  static async decideSponsorApplication(
    appId: string,
    decision: 'AWARDED' | 'SHORTLISTED' | 'NOT_SELECTED',
    feedback?: string,
    awardedSupport?: string
  ): Promise<OpportunityApplication> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/applications/${appId}/sponsor-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, sponsorFeedback: feedback, awardedSupport }),
    });
    if (!res.ok) throw new Error('Failed to record sponsor application decision');
    return res.json();
  }

  // ==========================================================================
  // 6. EQUIPMENT SUPPORT & CONTROLLED MESSAGES
  // ==========================================================================

  static async getEquipmentRecords(): Promise<EquipmentSupportRecord[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/equipment`);
      if (res.ok) {
        const data = await res.json();
        this.setCache('equipment_records', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching equipment records:', err);
    }
    return this.getCache<EquipmentSupportRecord[]>('equipment_records') || [];
  }

  static async updateEquipmentStatus(eqId: string, status: string, notes?: string): Promise<EquipmentSupportRecord> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/equipment/${eqId}/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error('Failed to update equipment status');
    return res.json();
  }

  static async getThreadMessages(threadId: string): Promise<ControlledOpportunityMessage[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/messages/${threadId}`);
      if (res.ok) return res.json();
    } catch (err) {
      console.warn(`Network error fetching messages for thread ${threadId}:`, err);
    }
    return [];
  }

  static async sendMessage(payload: Partial<ControlledOpportunityMessage>): Promise<ControlledOpportunityMessage> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to send controlled message');
    return res.json();
  }

  // ==========================================================================
  // 7. IMPACT, SAFEGUARDING & AUDIT LOGS
  // ==========================================================================

  static async getSponsorImpact(sponsorId: string): Promise<SponsorImpactReport> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/impact/sponsor/${sponsorId}`);
      if (res.ok) return res.json();
    } catch (err) {
      console.warn(`Network error fetching sponsor impact for ${sponsorId}:`, err);
    }
    return {
      id: `imp-${sponsorId}`,
      sponsorId,
      sponsorName: 'Sponsor Partner',
      academicYear: '2026/2027',
      totalFinancialSupportUSD: 2450,
      totalStudentsBenefited: 42,
      totalProjectsFunded: 6,
      totalEquipmentKitsDelivered: 8,
      totalMissionsSupported: 4,
      totalClubsSupported: 2,
      programsSummary: [],
      generatedAt: new Date().toISOString(),
    };
  }

  static async getSchoolSponsorshipImpact(): Promise<any> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/impact/school`);
      if (res.ok) return res.json();
    } catch (err) {
      console.warn('Network error fetching school sponsorship impact:', err);
    }
    return {
      totalActiveSponsors: 2,
      totalCandidatesApproved: 2,
      totalProjectsFunded: 2,
      totalScholarshipsAwarded: 1,
      totalEquipmentPledges: 2,
      activeSupportValueUSD: 8620,
      safeguardingComplaintsCount: 0,
      calculatedAt: new Date().toISOString(),
    };
  }

  static async reportSafeguarding(payload: Partial<SafeguardingReport>): Promise<SafeguardingReport> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/safeguarding/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to lodge safeguarding report');
    return res.json();
  }

  static async getSafeguardingReports(): Promise<SafeguardingReport[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/safeguarding/reports`);
      if (res.ok) return res.json();
    } catch (err) {
      console.warn('Network error fetching safeguarding reports:', err);
    }
    return [];
  }

  static async resolveSafeguardingReport(reportId: string, status: string, actionNotes?: string): Promise<SafeguardingReport> {
    const res = await this.authFetch(`${API_BASE}/sponsorship/safeguarding/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actionTakenNotes: actionNotes }),
    });
    if (!res.ok) throw new Error('Failed to resolve safeguarding report');
    return res.json();
  }

  static async getAuditLogs(): Promise<SponsorshipAuditLog[]> {
    try {
      const res = await this.authFetch(`${API_BASE}/sponsorship/audit-logs`);
      if (res.ok) return res.json();
    } catch (err) {
      console.warn('Network error fetching audit logs:', err);
    }
    return [];
  }
}
