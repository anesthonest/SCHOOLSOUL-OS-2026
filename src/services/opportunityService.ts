import { getAuthHeaders, API_BASE } from './api';
import type {
  SkillDefinition,
  StudentSkill,
  SkillEvidence,
  StudentPortfolio,
  SchoolMission,
  MissionTeam,
  MissionSubmission,
  InnovationChallenge,
  OpportunityItem,
  TalentDiscoveryInsight,
  AchievementItem,
  DigitalCertificate,
  SchoolShowcaseItem,
  SchoolClub,
  ClubMembership,
  MentorshipEngagement,
  SchoolImpactMetric,
  SkillLevel,
} from '../types';

export class OpportunityService {
  private static CACHE_PREFIX = 'schoolsoul_opp_';

  private static getCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private static setCache(key: string, data: any): void {
    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(data));
    } catch {
      // quota exceeded fallback
    }
  }

  // ==========================================
  // 1. SKILLS & SKILLS PASSPORT
  // ==========================================

  static async getSkillDefinitions(): Promise<SkillDefinition[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunity/skills/definitions`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache('skill_definitions', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching skill definitions, loading cache:', err);
    }
    return this.getCache<SkillDefinition[]>('skill_definitions') || [];
  }

  static async createSkillDefinition(payload: Partial<SkillDefinition>): Promise<SkillDefinition> {
    const res = await fetch(`${API_BASE}/opportunity/skills/definitions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create skill definition');
    }
    return res.json();
  }

  static async getStudentPassport(studentId: string): Promise<{
    studentId: string;
    skills: StudentSkill[];
    evidence: SkillEvidence[];
    totalSkillsCount: number;
    verifiedSkillsCount: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/opportunity/skills/passport/${studentId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache(`passport_${studentId}`, data);
        return data;
      }
    } catch (err) {
      console.warn(`Network error fetching passport for ${studentId}, loading cache:`, err);
    }
    return this.getCache(`passport_${studentId}`) || {
      studentId,
      skills: [],
      evidence: [],
      totalSkillsCount: 0,
      verifiedSkillsCount: 0,
    };
  }

  static async submitSkillEvidence(payload: Partial<SkillEvidence>): Promise<SkillEvidence> {
    const res = await fetch(`${API_BASE}/opportunity/skills/evidence`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit skill evidence');
    }
    return res.json();
  }

  static async verifySkillEvidence(
    evidenceId: string,
    status: 'VERIFIED' | 'CHANGES_REQUESTED' | 'REJECTED',
    comments?: string,
    evaluatedLevel?: SkillLevel
  ): Promise<SkillEvidence> {
    const res = await fetch(`${API_BASE}/opportunity/skills/evidence/${evidenceId}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, comments, evaluatedLevel }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to verify evidence');
    }
    return res.json();
  }

  // ==========================================
  // 2. VERIFIED DIGITAL PORTFOLIO
  // ==========================================

  static async getPortfolio(studentId: string): Promise<StudentPortfolio> {
    try {
      const res = await fetch(`${API_BASE}/opportunity/portfolios/${studentId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache(`portfolio_${studentId}`, data);
        return data;
      }
    } catch (err) {
      console.warn(`Error fetching portfolio for ${studentId}, loading cache:`, err);
    }
    return this.getCache<StudentPortfolio>(`portfolio_${studentId}`) || ({
      id: `port-${studentId}`,
      schoolId: 'school-001',
      studentId,
      studentName: 'Student',
      visibility: 'PRIVATE',
      isSafeguardApproved: false,
      sections: [],
      updatedAt: new Date().toISOString(),
    } as StudentPortfolio);
  }

  static async savePortfolio(studentId: string, payload: Partial<StudentPortfolio>): Promise<StudentPortfolio> {
    const res = await fetch(`${API_BASE}/opportunity/portfolios/${studentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update student portfolio');
    }
    return res.json();
  }

  static async safeguardPortfolio(studentId: string, isSafeguardApproved: boolean, visibility?: string): Promise<StudentPortfolio> {
    const res = await fetch(`${API_BASE}/opportunity/portfolios/${studentId}/safeguard`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isSafeguardApproved, visibility }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to safeguard portfolio');
    }
    return res.json();
  }

  // ==========================================
  // 3. SCHOOL MISSIONS & WORKSPACE
  // ==========================================

  static async getMissions(category?: string, status?: string): Promise<SchoolMission[]> {
    try {
      const query = new URLSearchParams();
      if (category) query.append('category', category);
      if (status) query.append('status', status);

      const res = await fetch(`${API_BASE}/opportunity/missions?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache('missions_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching missions, loading cache:', err);
    }
    return this.getCache<SchoolMission[]>('missions_list') || [];
  }

  static async getMissionDetails(missionId: string): Promise<{
    mission: SchoolMission;
    teams: MissionTeam[];
    submissions: MissionSubmission[];
  }> {
    const res = await fetch(`${API_BASE}/opportunity/missions/${missionId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to load mission details');
    }
    return res.json();
  }

  static async createMission(payload: Partial<SchoolMission>): Promise<SchoolMission> {
    const res = await fetch(`${API_BASE}/opportunity/missions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create school mission');
    }
    return res.json();
  }

  static async createMissionTeam(
    missionId: string,
    teamName: string,
    memberStudentIds: string[],
    memberStudentNames: string[]
  ): Promise<MissionTeam> {
    const res = await fetch(`${API_BASE}/opportunity/missions/${missionId}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teamName, memberStudentIds, memberStudentNames }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to register mission team');
    }
    return res.json();
  }

  static async submitMission(
    missionId: string,
    payload: {
      teamId?: string;
      submissionText: string;
      mediaUrls?: string[];
      externalLinks?: string[];
    }
  ): Promise<MissionSubmission> {
    const res = await fetch(`${API_BASE}/opportunity/missions/${missionId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit mission deliverables');
    }
    return res.json();
  }

  static async evaluateSubmission(
    submissionId: string,
    payload: {
      status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
      score?: number;
      maxScore?: number;
      teacherFeedback?: string;
      awardAchievementTitle?: string;
    }
  ): Promise<{ submission: MissionSubmission; achievement?: AchievementItem }> {
    const res = await fetch(`${API_BASE}/opportunity/missions/submissions/${submissionId}/evaluate`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to evaluate mission submission');
    }
    return res.json();
  }

  // ==========================================
  // 4. OPPORTUNITY BOARD & RECOMMENDATIONS
  // ==========================================

  static async getOpportunities(category?: string, scope?: string): Promise<OpportunityItem[]> {
    try {
      const query = new URLSearchParams();
      if (category) query.append('category', category);
      if (scope) query.append('scope', scope);

      const res = await fetch(`${API_BASE}/opportunity/board?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache('opportunities_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching opportunities, loading cache:', err);
    }
    return this.getCache<OpportunityItem[]>('opportunities_list') || [];
  }

  static async createOpportunity(payload: Partial<OpportunityItem>): Promise<OpportunityItem> {
    const res = await fetch(`${API_BASE}/opportunity/board`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to publish opportunity');
    }
    return res.json();
  }

  static async toggleSaveOpportunity(oppId: string): Promise<{ saved: boolean }> {
    const res = await fetch(`${API_BASE}/opportunity/board/${oppId}/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to save opportunity');
    }
    return res.json();
  }

  static async getRecommendations(studentId: string): Promise<
    Array<{ opportunity: OpportunityItem; matchScore: number; rationale: string }>
  > {
    try {
      const res = await fetch(`${API_BASE}/opportunity/recommendations/${studentId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`Error fetching recommendations for ${studentId}:`, err);
    }
    return [];
  }

  // ==========================================
  // 5. ACHIEVEMENTS & DIGITAL CERTIFICATES
  // ==========================================

  static async getAchievements(studentId?: string, category?: string): Promise<AchievementItem[]> {
    try {
      const query = new URLSearchParams();
      if (studentId) query.append('studentId', studentId);
      if (category) query.append('category', category);

      const res = await fetch(`${API_BASE}/opportunity/achievements?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache('achievements_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching achievements, loading cache:', err);
    }
    return this.getCache<AchievementItem[]>('achievements_list') || [];
  }

  static async awardAchievement(payload: Partial<AchievementItem> & { generateCertificate?: boolean }): Promise<{
    achievement: AchievementItem;
    certificate?: DigitalCertificate;
  }> {
    const res = await fetch(`${API_BASE}/opportunity/achievements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to award achievement');
    }
    return res.json();
  }

  static async verifyCertificatePublic(verificationId: string): Promise<{
    verified: boolean;
    isRevoked?: boolean;
    verificationId?: string;
    studentName?: string;
    schoolName?: string;
    achievementTitle?: string;
    category?: string;
    dateIssued?: string;
    issuerName?: string;
    issuerTitle?: string;
    signatureHash?: string;
    message?: string;
  }> {
    const res = await fetch(`${API_BASE}/opportunity/certificates/verify/${verificationId}`);
    return res.json();
  }

  // ==========================================
  // 6. SCHOOL SHOWCASE & PUBLIC STORIES
  // ==========================================

  static async getShowcase(type?: string, isPublic?: boolean): Promise<SchoolShowcaseItem[]> {
    try {
      const query = new URLSearchParams();
      if (type) query.append('type', type);
      if (isPublic !== undefined) query.append('isPublic', String(isPublic));

      const res = await fetch(`${API_BASE}/opportunity/showcase?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache('showcase_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching showcase, loading cache:', err);
    }
    return this.getCache<SchoolShowcaseItem[]>('showcase_list') || [];
  }

  static async createShowcase(payload: Partial<SchoolShowcaseItem>): Promise<SchoolShowcaseItem> {
    const res = await fetch(`${API_BASE}/opportunity/showcase`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit showcase entry');
    }
    return res.json();
  }

  static async approveShowcase(id: string, approvalStage: 'SCHOOL_APPROVED' | 'PUBLIC_APPROVED'): Promise<SchoolShowcaseItem> {
    const res = await fetch(`${API_BASE}/opportunity/showcase/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ approvalStage }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to approve showcase');
    }
    return res.json();
  }

  // ==========================================
  // 7. CLUBS & MENTORSHIP
  // ==========================================

  static async getClubs(): Promise<SchoolClub[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunity/clubs`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache('clubs_list', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching clubs, loading cache:', err);
    }
    return this.getCache<SchoolClub[]>('clubs_list') || [];
  }

  static async joinClub(clubId: string): Promise<ClubMembership> {
    const res = await fetch(`${API_BASE}/opportunity/clubs/${clubId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to join club');
    }
    const data = await res.json();
    return data.membership;
  }

  static async getMentorshipEngagements(): Promise<MentorshipEngagement[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunity/mentorship`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Network error fetching mentorships:', err);
    }
    return [];
  }

  static async createMentorship(payload: Partial<MentorshipEngagement>): Promise<MentorshipEngagement> {
    const res = await fetch(`${API_BASE}/opportunity/mentorship`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create mentorship engagement');
    }
    return res.json();
  }

  // ==========================================
  // 8. TALENT DISCOVERY & SCHOOL IMPACT
  // ==========================================

  static async getTalentDiscovery(): Promise<TalentDiscoveryInsight[]> {
    try {
      const res = await fetch(`${API_BASE}/opportunity/talent-discovery`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Network error fetching talent insights:', err);
    }
    return [];
  }

  static async getSchoolImpact(): Promise<SchoolImpactMetric> {
    try {
      const res = await fetch(`${API_BASE}/opportunity/impact`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        this.setCache('school_impact', data);
        return data;
      }
    } catch (err) {
      console.warn('Network error fetching school impact, loading cache:', err);
    }
    return (
      this.getCache<SchoolImpactMetric>('school_impact') || {
        id: 'impact-fallback',
        schoolId: 'school-001',
        academicYear: '2025/2026',
        projectsCompletedCount: 28,
        missionsCompletedCount: 14,
        activeStudentParticipantsCount: 146,
        activeTeacherMentorsCount: 12,
        verifiedSkillsCount: 310,
        competitionsEnteredCount: 6,
        achievementsAwardedCount: 84,
        innovationProjectsCount: 19,
        studentEnterpriseListingsCount: 11,
        communityProjectsCount: 8,
        calculatedAt: new Date().toISOString(),
      }
    );
  }
}
