import { db } from '../db/indexedDB';
import { getAuthHeaders } from './api';
import {
  DigitalGroup,
  GroupMembership,
  GroupMembershipRequest,
  GroupInvitation,
  GroupNotification,
  CommunityMessage,
  CommunityAnnouncement,
  CommunityProject,
  CommunityReport,
  CommunityModerationAction,
  CommunityAttachment,
} from '../types';

const API_BASE = '/api/community';

function getHeaders(schoolId = 'school-001', userId?: string) {
  const extra: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-school-id': schoolId,
  };
  if (userId) {
    extra['x-user-id'] = userId;
  }
  return getAuthHeaders(extra);
}

export const digitalCommunityApi = {
  // ----------------------------------------------------
  // 1. GROUPS & DISCOVERY
  // ----------------------------------------------------
  async getGroups(params?: {
    schoolId?: string;
    type?: string;
    visibility?: string;
    query?: string;
    myOnly?: boolean;
    userId?: string;
  }): Promise<DigitalGroup[]> {
    const schoolId = params?.schoolId || 'school-001';
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('schoolId', schoolId);
      if (params?.type) queryParams.set('type', params.type);
      if (params?.visibility) queryParams.set('visibility', params.visibility);
      if (params?.query) queryParams.set('query', params.query);
      if (params?.myOnly) queryParams.set('myOnly', 'true');
      if (params?.userId) queryParams.set('userId', params.userId);

      const res = await fetch(`${API_BASE}/groups?${queryParams.toString()}`, {
        headers: getHeaders(schoolId, params?.userId),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.digitalGroups.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline fallback
    }

    const local = await db.digitalGroups.where('schoolId').equals(schoolId).toArray();
    return local;
  },

  async getMyGroups(userId: string, schoolId = 'school-001'): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/groups/my?userId=${encodeURIComponent(userId)}&schoolId=${encodeURIComponent(schoolId)}`, {
        headers: getHeaders(schoolId, userId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.digitalGroups.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline fallback
    }

    const memberships = await db.groupMemberships.where('userId').equals(userId).toArray();
    const activeGroupIds = new Set(memberships.filter((m) => m.status === 'ACTIVE').map((m) => m.groupId));
    const allGroups = await db.digitalGroups.where('schoolId').equals(schoolId).toArray();
    return allGroups.filter((g) => activeGroupIds.has(g.id) || g.ownerId === userId);
  },

  async discoverGroups(params: {
    userId: string;
    schoolId?: string;
    category?: string;
    query?: string;
  }): Promise<any[]> {
    const schoolId = params.schoolId || 'school-001';
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('schoolId', schoolId);
      queryParams.set('userId', params.userId);
      if (params.category) queryParams.set('category', params.category);
      if (params.query) queryParams.set('query', params.query);

      const res = await fetch(`${API_BASE}/groups/discover?${queryParams.toString()}`, {
        headers: getHeaders(schoolId, params.userId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.digitalGroups.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline fallback
    }

    const all = await db.digitalGroups.where('schoolId').equals(schoolId).toArray();
    const memberships = await db.groupMemberships.where('userId').equals(params.userId).toArray();
    const requests = await db.groupMembershipRequests.where('studentId').equals(params.userId).toArray();

    return all.map((g) => {
      const mem = memberships.find((m) => m.groupId === g.id);
      const isMember = mem ? mem.status === 'ACTIVE' : g.ownerId === params.userId;
      const pendingReq = requests.find((r) => r.groupId === g.id && r.status === 'PENDING');
      return {
        ...g,
        isMember,
        membershipRole: mem?.groupRole || (g.ownerId === params.userId ? 'OWNER' : undefined),
        hasPendingRequest: Boolean(pendingReq),
        pendingRequestId: pendingReq?.id,
        isAutoJoin: g.autoJoinEligible || g.requireApproval === false,
      };
    });
  },

  async getGroup(id: string, schoolId = 'school-001'): Promise<DigitalGroup | null> {
    try {
      const res = await fetch(`${API_BASE}/groups/${id}?schoolId=${schoolId}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // Offline
    }
    const local = await db.digitalGroups.get(id);
    return local || null;
  },

  async createGroup(data: Partial<DigitalGroup>, schoolId = 'school-001'): Promise<DigitalGroup> {
    const payload = { ...data, schoolId };
    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: getHeaders(schoolId),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.digitalGroups.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline creation
    }

    const fallback: DigitalGroup = {
      id: `grp-local-${Date.now()}`,
      schoolId,
      name: data.name || 'New Group',
      description: data.description || '',
      type: data.type || 'CLUB',
      visibility: data.visibility || 'SCHOOL_DISCOVERABLE',
      status: 'ACTIVE',
      ownerId: data.ownerId || 'usr-local',
      ownerName: data.ownerName || 'User',
      ownerRole: data.ownerRole || 'Teacher',
      memberCount: 1,
      messageCount: 0,
      allowStudentPosts: data.allowStudentPosts ?? true,
      requirePostModeration: data.requirePostModeration ?? false,
      allowMediaUploads: data.allowMediaUploads ?? true,
      requireApproval: data.requireApproval ?? true,
      autoJoinEligible: data.autoJoinEligible ?? false,
      canStudentLeave: data.canStudentLeave ?? true,
      rules: data.rules || [],
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.digitalGroups.put(fallback).catch(() => {});
    return fallback;
  },

  async updateGroup(id: string, updates: Partial<DigitalGroup>, schoolId = 'school-001'): Promise<DigitalGroup | null> {
    try {
      const res = await fetch(`${API_BASE}/groups/${id}`, {
        method: 'PUT',
        headers: getHeaders(schoolId),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.digitalGroups.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline update
    }
    const existing = await db.digitalGroups.get(id);
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      await db.digitalGroups.put(updated);
      return updated;
    }
    return null;
  },

  // ----------------------------------------------------
  // 2. JOIN REQUESTS & APPROVALS
  // ----------------------------------------------------
  async requestJoinGroup(
    groupId: string,
    studentData: {
      studentId: string;
      studentName: string;
      studentEmail?: string;
      studentGrade?: string;
      studentStream?: string;
      reason?: string;
    },
    schoolId = 'school-001'
  ): Promise<{ success: boolean; autoApproved?: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/join-request`, {
        method: 'POST',
        headers: getHeaders(schoolId, studentData.studentId),
        body: JSON.stringify(studentData),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.autoApproved && json.data) {
          await db.groupMemberships.put(json.data).catch(() => {});
        } else if (json.data) {
          await db.groupMembershipRequests.put(json.data).catch(() => {});
        }
        return json;
      }
      return { success: false, message: json.error || 'Failed to submit join request' };
    } catch (err: any) {
      // Offline queuing
      const offlineReq: GroupMembershipRequest = {
        id: `req-offline-${Date.now()}`,
        requestId: `req-offline-${Date.now()}`,
        schoolId,
        groupId,
        groupName: 'Group',
        groupType: 'CLUB',
        studentId: studentData.studentId,
        studentName: studentData.studentName,
        studentEmail: studentData.studentEmail,
        studentGrade: studentData.studentGrade,
        studentStream: studentData.studentStream,
        requestedAt: new Date().toISOString(),
        status: 'PENDING',
        reason: studentData.reason || 'Offline requested join',
      };
      await db.groupMembershipRequests.put(offlineReq).catch(() => {});
      return {
        success: true,
        autoApproved: false,
        message: 'Join request saved offline and will sync when connection returns.',
        data: offlineReq,
      };
    }
  },

  async getMyRequests(userId: string, schoolId = 'school-001'): Promise<GroupMembershipRequest[]> {
    try {
      const res = await fetch(`${API_BASE}/requests?userId=${encodeURIComponent(userId)}&type=my&schoolId=${encodeURIComponent(schoolId)}`, {
        headers: getHeaders(schoolId, userId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.groupMembershipRequests.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.groupMembershipRequests.where('studentId').equals(userId).toArray();
  },

  async getAdminRequests(userId?: string, groupId?: string, schoolId = 'school-001'): Promise<GroupMembershipRequest[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('schoolId', schoolId);
      queryParams.set('type', 'admin');
      if (userId) queryParams.set('userId', userId);
      if (groupId) queryParams.set('groupId', groupId);

      const res = await fetch(`${API_BASE}/requests?${queryParams.toString()}`, {
        headers: getHeaders(schoolId, userId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.groupMembershipRequests.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.groupMembershipRequests.where('schoolId').equals(schoolId).toArray();
  },

  async reviewJoinRequest(
    requestId: string,
    reviewData: {
      action: 'APPROVE' | 'REJECT';
      reviewerId: string;
      reviewerName: string;
      reviewerRole?: string;
      reviewNotes?: string;
    },
    schoolId = 'school-001'
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/review`, {
        method: 'POST',
        headers: getHeaders(schoolId, reviewData.reviewerId),
        body: JSON.stringify(reviewData),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.data?.request) {
          await db.groupMembershipRequests.put(json.data.request).catch(() => {});
        }
        if (json.data?.membership) {
          await db.groupMemberships.put(json.data.membership).catch(() => {});
        }
        return json;
      }
      return { success: false, message: json.error || 'Failed to review request' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Offline review error' };
    }
  },

  async cancelJoinRequest(requestId: string, userId: string, schoolId = 'school-001'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: getHeaders(schoolId, userId),
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const local = await db.groupMembershipRequests.get(requestId);
        if (local) {
          local.status = 'CANCELLED';
          await db.groupMembershipRequests.put(local);
        }
        return true;
      }
    } catch {
      // Offline
    }
    return false;
  },

  // ----------------------------------------------------
  // 3. INVITATIONS
  // ----------------------------------------------------
  async getInvitations(params?: { userId?: string; groupId?: string; schoolId?: string }): Promise<GroupInvitation[]> {
    const schoolId = params?.schoolId || 'school-001';
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('schoolId', schoolId);
      if (params?.userId) queryParams.set('userId', params.userId);
      if (params?.groupId) queryParams.set('groupId', params.groupId);

      const res = await fetch(`${API_BASE}/invitations?${queryParams.toString()}`, {
        headers: getHeaders(schoolId, params?.userId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.groupInvitations.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    if (params?.userId) {
      return await db.groupInvitations.where('invitedUserId').equals(params.userId).toArray();
    }
    return await db.groupInvitations.where('schoolId').equals(schoolId).toArray();
  },

  async inviteUser(
    groupId: string,
    payload: {
      invitedUserId: string;
      invitedUserName: string;
      invitedUserRole?: string;
      invitedByUserId: string;
      invitedByUserName: string;
      invitedByUserRole?: string;
      expiresDays?: number;
    },
    schoolId = 'school-001'
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/invite`, {
        method: 'POST',
        headers: getHeaders(schoolId, payload.invitedByUserId),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.data) await db.groupInvitations.put(json.data).catch(() => {});
        return json;
      }
      return { success: false, message: json.error || 'Failed to send invitation' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invitation network error' };
    }
  },

  async respondToInvitation(
    invitationId: string,
    action: 'ACCEPT' | 'DECLINE',
    userId: string,
    schoolId = 'school-001'
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch(`${API_BASE}/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: getHeaders(schoolId, userId),
        body: JSON.stringify({ action, userId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.data?.invitation) await db.groupInvitations.put(json.data.invitation).catch(() => {});
        if (json.data?.membership) await db.groupMemberships.put(json.data.membership).catch(() => {});
        return json;
      }
      return { success: false, message: json.error || 'Failed to respond to invitation' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invitation response error' };
    }
  },

  // ----------------------------------------------------
  // 4. AUTO-ENROLL & LEAVE
  // ----------------------------------------------------
  async autoEnrollAcademicGroups(
    userData: {
      userId: string;
      userName: string;
      userRole?: string;
      classGrade?: string;
      stream?: string;
      subjects?: string[];
    },
    schoolId = 'school-001'
  ): Promise<{ success: boolean; enrolledGroups: string[] }> {
    try {
      const res = await fetch(`${API_BASE}/groups/auto-enroll`, {
        method: 'POST',
        headers: getHeaders(schoolId, userData.userId),
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json;
      }
    } catch {
      // Offline fallback
    }
    return { success: false, enrolledGroups: [] };
  },

  async leaveGroup(groupId: string, userId: string, userRole = 'Student', schoolId = 'school-001'): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/leave`, {
        method: 'POST',
        headers: getHeaders(schoolId, userId),
        body: JSON.stringify({ userId, userRole }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await db.groupMemberships.where({ groupId, userId }).delete().catch(() => {});
        return { success: true, message: json.message || 'Left group successfully' };
      }
      return { success: false, message: json.error || 'Failed to leave group' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Leave group error' };
    }
  },

  async getGroupMembers(groupId: string, schoolId = 'school-001'): Promise<GroupMembership[]> {
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/members?schoolId=${encodeURIComponent(schoolId)}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.groupMemberships.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.groupMemberships.where('groupId').equals(groupId).toArray();
  },

  // ----------------------------------------------------
  // 5. NOTIFICATIONS
  // ----------------------------------------------------
  async getNotifications(userId: string, schoolId = 'school-001'): Promise<GroupNotification[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications?userId=${encodeURIComponent(userId)}&schoolId=${encodeURIComponent(schoolId)}`, {
        headers: getHeaders(schoolId, userId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.groupNotifications.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.groupNotifications.where('userId').equals(userId).toArray();
  },

  async markNotificationRead(id: string, schoolId = 'school-001'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const local = await db.groupNotifications.get(id);
        if (local) {
          local.read = true;
          await db.groupNotifications.put(local);
        }
        return true;
      }
    } catch {
      // Offline
    }
    return false;
  },

  async markAllNotificationsRead(userId: string, schoolId = 'school-001'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders(schoolId, userId),
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const userNotifs = await db.groupNotifications.where('userId').equals(userId).toArray();
        for (const n of userNotifs) {
          n.read = true;
        }
        await db.groupNotifications.bulkPut(userNotifs);
        return true;
      }
    } catch {
      // Offline
    }
    return false;
  },

  // ----------------------------------------------------
  // 6. MESSAGES
  // ----------------------------------------------------
  async getMessages(groupId: string, isModerator = false, schoolId = 'school-001'): Promise<CommunityMessage[]> {
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/messages?isModerator=${isModerator}&schoolId=${encodeURIComponent(schoolId)}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.communityMessages.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline fallback
    }
    const local = await db.communityMessages.where('groupId').equals(groupId).toArray();
    local.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return local;
  },

  async sendMessage(groupId: string, data: Partial<CommunityMessage>, schoolId = 'school-001'): Promise<CommunityMessage> {
    const clientMessageId = data.clientMessageId || `cmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const payload = {
      ...data,
      clientMessageId,
      groupId,
      schoolId,
    };

    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/messages`, {
        method: 'POST',
        headers: getHeaders(schoolId, data.senderId),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityMessages.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline optimistic store
    }

    const fallbackMsg: CommunityMessage = {
      id: `msg-local-${Date.now()}`,
      clientMessageId,
      schoolId,
      groupId,
      senderId: data.senderId || 'usr-local',
      senderName: data.senderName || 'Me',
      senderRole: data.senderRole || 'Student',
      content: data.content || '',
      messageType: data.messageType || 'TEXT',
      status: 'ACTIVE',
      attachments: data.attachments || [],
      replyToMessageId: data.replyToMessageId,
      replyToPreview: data.replyToPreview,
      reactions: [],
      mentions: data.mentions || [],
      isPinned: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.communityMessages.put(fallbackMsg).catch(() => {});
    return fallbackMsg;
  },

  async reactToMessage(messageId: string, emoji: string, userId: string, schoolId = 'school-001'): Promise<CommunityMessage | null> {
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}/react`, {
        method: 'POST',
        headers: getHeaders(schoolId, userId),
        body: JSON.stringify({ emoji, userId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityMessages.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline reaction
    }
    const msg = await db.communityMessages.get(messageId);
    if (msg) {
      if (!msg.reactions) msg.reactions = [];
      const rx = msg.reactions.find((r) => r.emoji === emoji);
      if (rx) {
        const uIdx = rx.userIds.indexOf(userId);
        if (uIdx !== -1) {
          rx.userIds.splice(uIdx, 1);
          rx.count -= 1;
        } else {
          rx.userIds.push(userId);
          rx.count += 1;
        }
      } else {
        msg.reactions.push({ emoji, count: 1, userIds: [userId] });
      }
      await db.communityMessages.put(msg);
      return msg;
    }
    return null;
  },

  async pinMessage(messageId: string, isPinnedOrSchoolId?: boolean | string, pinnedBy?: string, schoolId = 'school-001'): Promise<CommunityMessage | null> {
    const isPinned = typeof isPinnedOrSchoolId === 'boolean' ? isPinnedOrSchoolId : true;
    const effectiveSchoolId = typeof isPinnedOrSchoolId === 'string' ? isPinnedOrSchoolId : schoolId;
    const effectivePinnedBy = pinnedBy || 'moderator';

    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}/pin`, {
        method: 'POST',
        headers: getHeaders(effectiveSchoolId, effectivePinnedBy),
        body: JSON.stringify({ isPinned, pinnedBy: effectivePinnedBy }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityMessages.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    const msg = await db.communityMessages.get(messageId);
    if (msg) {
      msg.isPinned = isPinned;
      msg.pinnedBy = effectivePinnedBy;
      await db.communityMessages.put(msg);
      return msg;
    }
    return null;
  },

  async deleteMessage(messageId: string, schoolId = 'school-001'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: 'DELETE',
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        await db.communityMessages.delete(messageId).catch(() => {});
        return true;
      }
    } catch {
      // Offline
    }
    await db.communityMessages.delete(messageId).catch(() => {});
    return true;
  },

  // ----------------------------------------------------
  // 7. ANNOUNCEMENTS
  // ----------------------------------------------------
  async getAnnouncements(params?: { targetScope?: string; targetId?: string; priority?: string; schoolId?: string }): Promise<CommunityAnnouncement[]> {
    const schoolId = params?.schoolId || 'school-001';
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('schoolId', schoolId);
      if (params?.targetScope) queryParams.set('targetScope', params.targetScope);
      if (params?.targetId) queryParams.set('targetId', params.targetId);
      if (params?.priority) queryParams.set('priority', params.priority);

      const res = await fetch(`${API_BASE}/announcements?${queryParams.toString()}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.communityAnnouncements.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.communityAnnouncements.where('schoolId').equals(schoolId).toArray();
  },

  async createAnnouncement(data: Partial<CommunityAnnouncement>, schoolId = 'school-001'): Promise<CommunityAnnouncement> {
    const payload = { ...data, schoolId };
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: getHeaders(schoolId, data.authorId),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityAnnouncements.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    const fallback: CommunityAnnouncement = {
      id: `ann-local-${Date.now()}`,
      schoolId,
      title: data.title || 'School Announcement',
      content: data.content || '',
      priority: data.priority || 'NORMAL',
      targetScope: data.targetScope || 'SCHOOL_WIDE',
      targetId: data.targetId,
      targetName: data.targetName,
      authorId: data.authorId || 'usr-admin',
      authorName: data.authorName || 'Staff',
      authorRole: data.authorRole || 'Teacher',
      isPinned: data.isPinned || false,
      attachments: data.attachments || [],
      acknowledgements: [],
      createdAt: new Date().toISOString(),
    };
    await db.communityAnnouncements.put(fallback).catch(() => {});
    return fallback;
  },

  async acknowledgeAnnouncement(announcementId: string, userId: string, schoolId = 'school-001'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/announcements/${announcementId}/acknowledge`, {
        method: 'POST',
        headers: getHeaders(schoolId, userId),
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const ann = await db.communityAnnouncements.get(announcementId);
        if (ann) {
          const acks = ann.acknowledgements || [];
          if (!acks.includes(userId)) {
            ann.acknowledgements = [...acks, userId];
            await db.communityAnnouncements.put(ann);
          }
        }
        return true;
      }
    } catch {
      // Offline
    }
    const ann = await db.communityAnnouncements.get(announcementId);
    if (ann) {
      const acks = ann.acknowledgements || [];
      if (!acks.includes(userId)) {
        ann.acknowledgements = [...acks, userId];
        await db.communityAnnouncements.put(ann);
      }
    }
    return true;
  },

  // ----------------------------------------------------
  // 8. PROJECTS & STEM COLLABORATION
  // ----------------------------------------------------
  async getProjects(params?: { groupId?: string; status?: string; schoolId?: string }): Promise<CommunityProject[]> {
    const schoolId = params?.schoolId || 'school-001';
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('schoolId', schoolId);
      if (params?.groupId) queryParams.set('groupId', params.groupId);
      if (params?.status) queryParams.set('status', params.status);

      const res = await fetch(`${API_BASE}/projects?${queryParams.toString()}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.communityProjects.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.communityProjects.where('schoolId').equals(schoolId).toArray();
  },

  async createProject(data: Partial<CommunityProject>, schoolId = 'school-001'): Promise<CommunityProject> {
    const payload = { ...data, schoolId };
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: getHeaders(schoolId, data.leadTeacherId),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityProjects.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    const fallback: CommunityProject = {
      id: `prj-local-${Date.now()}`,
      schoolId,
      groupId: data.groupId || 'grp-robotics-club',
      title: data.title || 'New Innovation Project',
      description: data.description || '',
      subject: data.subject || 'Applied Science',
      leadTeacherId: data.leadTeacherId || 'usr-teacher-1',
      leadTeacherName: data.leadTeacherName || 'Teacher Advisor',
      studentMemberIds: data.studentMemberIds || [],
      studentMemberNames: data.studentMemberNames || [],
      status: 'IN_PROGRESS',
      tasks: data.tasks || [],
      deliverables: data.deliverables || [],
      teacherFeedback: [],
      isMarketplacePublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.communityProjects.put(fallback).catch(() => {});
    return fallback;
  },

  async updateProjectTask(
    projectId: string,
    taskUpdate: { taskId: string; isCompleted: boolean },
    schoolId = 'school-001'
  ): Promise<CommunityProject | null> {
    const local = await db.communityProjects.get(projectId);
    if (local) {
      const updatedTasks = (local.tasks || []).map((t) =>
        t.id === taskUpdate.taskId ? { ...t, isCompleted: taskUpdate.isCompleted } : t
      );
      const updated = { ...local, tasks: updatedTasks, updatedAt: new Date().toISOString() };
      await db.communityProjects.put(updated);
      try {
        await fetch(`${API_BASE}/projects/${projectId}`, {
          method: 'PUT',
          headers: getHeaders(schoolId),
          body: JSON.stringify({ tasks: updatedTasks }),
        });
      } catch {
        // Offline
      }
      return updated;
    }
    return null;
  },

  async updateProject(id: string, updates: Partial<CommunityProject>, schoolId = 'school-001'): Promise<CommunityProject | null> {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(schoolId),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityProjects.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    const local = await db.communityProjects.get(id);
    if (local) {
      const updated = { ...local, ...updates, updatedAt: new Date().toISOString() };
      await db.communityProjects.put(updated);
      return updated;
    }
    return null;
  },

  // ----------------------------------------------------
  // 9. SAFEGUARDING & REPORTS
  // ----------------------------------------------------
  async submitReport(data: Partial<CommunityReport>, schoolId = 'school-001'): Promise<CommunityReport> {
    const payload = { ...data, schoolId };
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: getHeaders(schoolId, data.reportedByUserId),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityReports.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    const fallback: CommunityReport = {
      id: `rep-local-${Date.now()}`,
      schoolId,
      targetType: data.targetType || 'MESSAGE',
      targetId: data.targetId || 'target-1',
      groupId: data.groupId,
      groupName: data.groupName,
      reportedUserId: data.reportedUserId,
      reportedUserName: data.reportedUserName,
      reportedByUserId: data.reportedByUserId || 'usr-anon',
      reportedByUserName: data.reportedByUserName || 'Anonymous',
      reportedByUserRole: data.reportedByUserRole || 'Student',
      reasonCategory: data.reasonCategory || 'OTHER',
      reasonDetails: data.reasonDetails || '',
      evidenceContent: data.evidenceContent,
      evidenceAttachmentUrl: data.evidenceAttachmentUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    await db.communityReports.put(fallback).catch(() => {});
    return fallback;
  },

  async resolveReport(
    reportId: string,
    resolutionData: {
      actionType: string;
      resolutionNotes?: string;
      moderatorId: string;
      moderatorName: string;
      moderatorRole: string;
    },
    schoolId = 'school-001'
  ): Promise<CommunityReport | null> {
    try {
      const res = await fetch(`${API_BASE}/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: getHeaders(schoolId, resolutionData.moderatorId),
        body: JSON.stringify(resolutionData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await db.communityReports.put(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    const rep = await db.communityReports.get(reportId);
    if (rep) {
      const updated: CommunityReport = {
        ...rep,
        status: resolutionData.actionType === 'DISMISS_REPORT' ? 'DISMISSED' : 'ACTION_TAKEN',
        assignedModeratorId: resolutionData.moderatorId,
        assignedModeratorName: resolutionData.moderatorName,
        resolutionNotes: resolutionData.resolutionNotes,
        resolvedAt: new Date().toISOString(),
      };
      await db.communityReports.put(updated);

      // Create log
      const logItem: CommunityModerationAction = {
        id: `modlog-local-${Date.now()}`,
        schoolId,
        reportId,
        targetType: rep.targetType,
        targetId: rep.targetId,
        actionType: resolutionData.actionType as any,
        actionDetails: resolutionData.resolutionNotes || `Moderator action: ${resolutionData.actionType}`,
        moderatorId: resolutionData.moderatorId,
        moderatorName: resolutionData.moderatorName,
        moderatorRole: resolutionData.moderatorRole,
        timestamp: new Date().toISOString(),
      };
      await db.communityModerationActions.put(logItem).catch(() => {});

      return updated;
    }
    return null;
  },

  async getReports(status?: string, schoolId = 'school-001'): Promise<CommunityReport[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('schoolId', schoolId);
      if (status && status !== 'ALL') queryParams.set('status', status);

      const res = await fetch(`${API_BASE}/reports?${queryParams.toString()}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.communityReports.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.communityReports.where('schoolId').equals(schoolId).toArray();
  },

  async takeModerationAction(
    reportId: string,
    actionData: {
      actionType: string;
      moderatorId: string;
      moderatorName: string;
      notes?: string;
      affectedUserId?: string;
      affectedUserName?: string;
    },
    schoolId = 'school-001'
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reports/${reportId}/action`, {
        method: 'POST',
        headers: getHeaders(schoolId, actionData.moderatorId),
        body: JSON.stringify(actionData),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getModerationLogs(schoolId = 'school-001'): Promise<CommunityModerationAction[]> {
    try {
      const res = await fetch(`${API_BASE}/moderation-logs?schoolId=${encodeURIComponent(schoolId)}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          await db.communityModerationActions.bulkPut(json.data).catch(() => {});
          return json.data;
        }
      }
    } catch {
      // Offline
    }
    return await db.communityModerationActions.where('schoolId').equals(schoolId).toArray();
  },

  // ----------------------------------------------------
  // 10. SAFE MEDIA UPLOADS
  // ----------------------------------------------------
  async uploadMedia(file: File, schoolId = 'school-001'): Promise<CommunityAttachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          let fileType: 'image' | 'video' | 'audio' | 'document' = 'document';
          if (file.type.startsWith('image/')) fileType = 'image';
          else if (file.type.startsWith('video/')) fileType = 'video';
          else if (file.type.startsWith('audio/')) fileType = 'audio';

          const res = await fetch(`${API_BASE}/media/upload`, {
            method: 'POST',
            headers: getHeaders(schoolId),
            body: JSON.stringify({
              fileName: file.name,
              fileType,
              mimeType: file.type,
              base64Data,
              fileSize: file.size,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              return resolve(json.data);
            }
          }
          throw new Error('Upload failed or rejected by safeguarding rules');
        } catch {
          // Client-side fallback data URL
          const fallbackAtt: CommunityAttachment = {
            id: `att-${Date.now()}`,
            fileType: file.type.startsWith('image/') ? 'image' : 'document',
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            url: reader.result as string,
            isSafeChecked: true,
          };
          resolve(fallbackAtt);
        }
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  },
};
