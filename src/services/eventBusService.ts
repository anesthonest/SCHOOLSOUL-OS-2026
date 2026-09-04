import { db } from '../db/indexedDB';
import { logAuditEvent, queueOfflineAction } from './api';
import type { SystemNotification, User } from '../types';

export type SchoolEventType =
  | 'STUDENT_CREATED'
  | 'PARENT_LINKED'
  | 'ATTENDANCE_RECORDED'
  | 'ASSIGNMENT_CREATED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'ASSESSMENT_PUBLISHED'
  | 'PAYMENT_CONFIRMED'
  | 'PROJECT_APPROVED'
  | 'ORDER_CREATED'
  | 'MEDIA_APPROVED'
  | 'ANNOUNCEMENT_PUBLISHED';

export interface SchoolDomainEvent {
  id: string;
  type: SchoolEventType;
  entityId: string;
  entityName: string;
  targetRole?: 'All' | 'Teacher' | 'Parent' | 'Student' | 'Headteacher' | 'Bursar';
  recipientUserId?: string;
  title: string;
  summary: string;
  timestamp: string;
  channels: {
    inApp: boolean;
    smsPending: boolean;
    emailPending: boolean;
    whatsappPending: boolean;
  };
}

const EVENTS_LOG_KEY = 'schoolsoul_domain_events_log';

/**
 * Dispatch a domain event across the entire SchoolSoul ecosystem
 */
export async function dispatchSchoolEvent(
  event: Omit<SchoolDomainEvent, 'id' | 'timestamp' | 'channels'>,
  actor?: User | null
): Promise<SchoolDomainEvent> {
  const id = 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const timestamp = new Date().toISOString();

  const domainEvent: SchoolDomainEvent = {
    ...event,
    id,
    timestamp,
    channels: {
      inApp: true,
      smsPending: event.type === 'ATTENDANCE_RECORDED' || event.type === 'PAYMENT_CONFIRMED',
      emailPending: event.type === 'PARENT_LINKED' || event.type === 'ANNOUNCEMENT_PUBLISHED',
      whatsappPending: event.type === 'PAYMENT_CONFIRMED',
    },
  };

  // 1. Store in event log
  const raw = localStorage.getItem(EVENTS_LOG_KEY);
  const events: SchoolDomainEvent[] = raw ? JSON.parse(raw) : [];
  events.unshift(domainEvent);
  if (events.length > 500) events.pop();
  localStorage.setItem(EVENTS_LOG_KEY, JSON.stringify(events));

  // 2. Generate In-App Notification in IndexedDB
  const newNotification: SystemNotification = {
    id: 'notif-' + Date.now(),
    title: domainEvent.title,
    message: domainEvent.summary,
    type:
      domainEvent.type === 'PAYMENT_CONFIRMED'
        ? 'info'
        : domainEvent.type === 'ATTENDANCE_RECORDED'
        ? 'warning'
        : 'success',
    category: 'system',
    read: false,
    timestamp,
    link: '#',
  };

  await db.notifications.put(newNotification);

  // 3. Log Audit
  if (actor) {
    await logAuditEvent(
      actor.id,
      actor.username,
      actor.role,
      'NOTIFICATION_DISPATCH',
      `[${domainEvent.type}] ${domainEvent.title}: ${domainEvent.summary}`
    );
  }

  return domainEvent;
}

/**
 * Get domain event log history
 */
export function getDomainEventLog(): SchoolDomainEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
