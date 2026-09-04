import { db } from '../db/indexedDB';
import { getAuthHeaders } from './api';
import type {
  LiveClass,
  LiveClassAttendanceRecord,
  LiveQuestion,
  LivePoll,
  LiveQuiz,
  MediaItem,
  MediaProcessingJob,
  MediaProcessingProfile,
  MediaQualitySettings,
} from '../types';

function getHeaders(schoolId: string = 'school-001'): Record<string, string> {
  return getAuthHeaders({ 'x-school-id': schoolId, 'Content-Type': 'application/json' });
}

export const liveLearningApi = {
  // Fetch live classes
  async getLiveClasses(schoolId: string = 'school-001', filters?: {
    status?: string;
    classGrade?: string;
    subject?: string;
    teacherId?: string;
  }): Promise<LiveClass[]> {
    try {
      const params = new URLSearchParams({ schoolId });
      if (filters?.status) params.append('status', filters.status);
      if (filters?.classGrade) params.append('classGrade', filters.classGrade);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.teacherId) params.append('teacherId', filters.teacherId);

      const res = await fetch(`/api/live-classes?${params.toString()}`, {
        headers: getHeaders(schoolId),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Sync with local Dexie store
          for (const item of json.data) {
            await db.liveClasses.put(item);
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Network fetch failed for live classes, falling back to local DB:', err);
    }

    // Offline fallback from local IndexedDB
    let query = db.liveClasses.where('schoolId').equals(schoolId);
    let classes = await query.toArray();

    if (filters?.status) {
      classes = classes.filter((c) => c.status === filters.status);
    }
    if (filters?.classGrade) {
      classes = classes.filter((c) => c.classGrade === filters.classGrade);
    }
    if (filters?.subject) {
      classes = classes.filter((c) => c.subject === filters.subject);
    }

    return classes;
  },

  // Get single live class details
  async getLiveClassById(id: string, schoolId: string = 'school-001'): Promise<LiveClass | null> {
    try {
      const res = await fetch(`/api/live-classes/${id}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          await db.liveClasses.put(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live class details from server, checking local DB:', err);
    }
    return (await db.liveClasses.get(id)) || null;
  },

  // Schedule a new live lesson
  async createLiveClass(classData: Partial<LiveClass>, schoolId: string = 'school-001'): Promise<LiveClass> {
    const res = await fetch('/api/live-classes', {
      method: 'POST',
      headers: getHeaders(schoolId),
      body: JSON.stringify(classData),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create live class');
    }

    await db.liveClasses.put(json.data);
    return json.data;
  },

  // Update live lesson
  async updateLiveClass(id: string, updates: Partial<LiveClass>, schoolId: string = 'school-001'): Promise<LiveClass> {
    const res = await fetch(`/api/live-classes/${id}`, {
      method: 'PUT',
      headers: getHeaders(schoolId),
      body: JSON.stringify(updates),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update live class');
    }

    await db.liveClasses.put(json.data);
    return json.data;
  },

  // Start live lesson
  async startLiveClass(id: string, schoolId: string = 'school-001'): Promise<any> {
    const res = await fetch(`/api/live-classes/${id}/start`, {
      method: 'POST',
      headers: getHeaders(schoolId),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to start live class');
    }
    const current = await db.liveClasses.get(id);
    if (current) {
      current.status = 'LIVE';
      current.actualStartedAt = json.data.actualStartedAt;
      await db.liveClasses.put(current);
    }
    return json.data;
  },

  // End live lesson
  async endLiveClass(id: string, schoolId: string = 'school-001'): Promise<any> {
    const res = await fetch(`/api/live-classes/${id}/end`, {
      method: 'POST',
      headers: getHeaders(schoolId),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to end live class');
    }
    const current = await db.liveClasses.get(id);
    if (current) {
      current.status = 'COMPLETED';
      current.recordingStatus = 'READY';
      await db.liveClasses.put(current);
    }
    return json.data;
  },

  // Join live lesson and obtain secure room token
  async joinLiveClass(id: string, schoolId: string = 'school-001'): Promise<{
    token: string;
    roomId: string;
    liveClass: LiveClass;
    isHost: boolean;
    wsEndpoint: string;
  }> {
    const res = await fetch(`/api/live-classes/${id}/join`, {
      method: 'POST',
      headers: getHeaders(schoolId),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Access to live classroom denied');
    }

    return json.data;
  },

  // Leave live lesson
  async leaveLiveClass(id: string, schoolId: string = 'school-001'): Promise<void> {
    try {
      await fetch(`/api/live-classes/${id}/leave`, {
        method: 'POST',
        headers: getHeaders(schoolId),
      });
    } catch (e) {
      // benign
    }
  },

  // Get session attendance roster
  async getAttendance(id: string, schoolId: string = 'school-001'): Promise<LiveClassAttendanceRecord[]> {
    try {
      const res = await fetch(`/api/live-classes/${id}/attendance`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          for (const item of json.data) {
            await db.liveClassAttendance.put(item);
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Network error fetching attendance, falling back to local DB:', err);
    }
    return db.liveClassAttendance.where('liveClassId').equals(id).toArray();
  },

  // Launch live poll
  async createPoll(liveClassId: string, question: string, options: string[], schoolId: string = 'school-001'): Promise<LivePoll> {
    const res = await fetch(`/api/live-classes/${liveClassId}/poll`, {
      method: 'POST',
      headers: getHeaders(schoolId),
      body: JSON.stringify({ question, options }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create poll');
    }
    await db.livePolls.put(json.data);
    return json.data;
  },

  // Vote on live poll
  async votePoll(liveClassId: string, pollId: string, optionId: string, schoolId: string = 'school-001'): Promise<void> {
    const res = await fetch(`/api/live-classes/${liveClassId}/poll/${pollId}/vote`, {
      method: 'POST',
      headers: getHeaders(schoolId),
      body: JSON.stringify({ optionId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to register vote');
    }
  },

  // Submit student question
  async submitQuestion(liveClassId: string, questionText: string, schoolId: string = 'school-001'): Promise<LiveQuestion> {
    const res = await fetch(`/api/live-classes/${liveClassId}/question`, {
      method: 'POST',
      headers: getHeaders(schoolId),
      body: JSON.stringify({ questionText }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to submit question');
    }
    await db.liveQuestions.put(json.data);
    return json.data;
  },

  // Answer question
  async answerQuestion(liveClassId: string, questionId: string, answerText: string, status: string = 'ANSWERED', schoolId: string = 'school-001'): Promise<void> {
    const res = await fetch(`/api/live-classes/${liveClassId}/question/${questionId}/answer`, {
      method: 'POST',
      headers: getHeaders(schoolId),
      body: JSON.stringify({ answerText, status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update question');
    }
  },

  // Upvote question
  async upvoteQuestion(liveClassId: string, questionId: string, schoolId: string = 'school-001'): Promise<void> {
    const res = await fetch(`/api/live-classes/${liveClassId}/question/${questionId}/upvote`, {
      method: 'POST',
      headers: getHeaders(schoolId),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to upvote question');
    }
  },

  // Get recording replay
  async getRecording(liveClassId: string, schoolId: string = 'school-001'): Promise<any> {
    const res = await fetch(`/api/live-classes/${liveClassId}/recording`, {
      headers: getHeaders(schoolId),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Recording inaccessible or unauthorized');
    }
    return json.data;
  },

  // Media Quality Engine processing
  async processMedia(payload: {
    title: string;
    description?: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'RECORDING' | 'DOCUMENT';
    originalUrl: string;
    processingProfile: MediaProcessingProfile;
    settings?: Partial<MediaQualitySettings>;
  }, schoolId: string = 'school-001'): Promise<{ media: MediaItem; job: MediaProcessingJob }> {
    const res = await fetch('/api/media/process', {
      method: 'POST',
      headers: getHeaders(schoolId),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to process media item');
    }
    await db.mediaItems.put(json.data);
    await db.mediaProcessingJobs.put(json.job);
    return { media: json.data, job: json.job };
  },

  // Fetch school media items
  async getMediaGallery(schoolId: string = 'school-001', mediaType?: string, profile?: string): Promise<MediaItem[]> {
    try {
      const params = new URLSearchParams({ schoolId });
      if (mediaType) params.append('mediaType', mediaType);
      if (profile) params.append('profile', profile);

      const res = await fetch(`/api/media/gallery?${params.toString()}`, {
        headers: getHeaders(schoolId),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          for (const item of json.data) {
            await db.mediaItems.put(item);
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Network error fetching media gallery, fallback to Dexie:', err);
    }
    return db.mediaItems.where('schoolId').equals(schoolId).toArray();
  },
};
