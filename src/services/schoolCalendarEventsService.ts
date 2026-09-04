import { db } from '../db/indexedDB';
import { dispatchSchoolEvent } from './eventBusService';
import type { SchoolEventItem, EventRsvpRecord } from '../types';

const INITIAL_EVENTS: SchoolEventItem[] = [
  {
    id: 'evt-2026-001',
    title: 'Term I Mid-Term CBC Assessments',
    eventType: 'Academic',
    startDate: '2026-03-02',
    endDate: '2026-03-06',
    startTime: '08:00',
    endTime: '16:30',
    location: 'All Main Examination Halls',
    description: 'NCDC Ugandan CBC continuous competency and skills evaluations for all classes.',
    organizer: 'Director of Studies (DOS)',
    targetAudience: 'All',
    rsvpCounts: { attending: 480, declined: 0, pending: 0 },
    isPublic: true,
  },
  {
    id: 'evt-2026-002',
    title: 'Annual Inter-House Sports Gala & Athletics',
    eventType: 'Sports',
    startDate: '2026-03-14',
    endDate: '2026-03-14',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Main Sports Complex & Track',
    description: 'Track and field championships across Lumumba, Africa, Nkrumah and Livingstone houses.',
    organizer: 'Games & Sports Master',
    targetAudience: 'All',
    rsvpCounts: { attending: 320, declined: 12, pending: 45 },
    isPublic: true,
  },
  {
    id: 'evt-2026-003',
    title: 'Parent-Teacher Consultative Meeting (PTM)',
    eventType: 'PTM',
    startDate: '2026-03-21',
    endDate: '2026-03-21',
    startTime: '10:00',
    endTime: '15:00',
    location: 'Main Assembly Hall & Classrooms',
    description: 'One-on-one parent conferences reviewing midterm report cards and student welfare.',
    organizer: 'Head Teacher & PTA Executive',
    targetAudience: 'Parents',
    rsvpCounts: { attending: 215, declined: 18, pending: 92 },
    isPublic: true,
  },
  {
    id: 'evt-2026-004',
    title: 'Second Instalment School Fees Deadline',
    eventType: 'General',
    startDate: '2026-03-25',
    endDate: '2026-03-25',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Bursar’s Office & Bank Accounts',
    description: 'Final clearance of Term I tuition and boarding balances before mock exams.',
    organizer: 'School Bursar',
    targetAudience: 'Parents',
    rsvpCounts: { attending: 0, declined: 0, pending: 0 },
    isPublic: false,
  },
  {
    id: 'evt-2026-005',
    title: 'Senior Four & Six Science Fair & Innovation Day',
    eventType: 'Academic',
    startDate: '2026-04-04',
    endDate: '2026-04-04',
    startTime: '09:30',
    endTime: '16:00',
    location: 'Science Complex & ICT Labs',
    description: 'Showcase of student solar irrigation models, robotics, and biology exhibitions.',
    organizer: 'Science Department & ICT Club',
    targetAudience: 'All',
    rsvpCounts: { attending: 180, declined: 4, pending: 30 },
    isPublic: true,
  },
];

export async function fetchUnifiedSchoolEvents(): Promise<SchoolEventItem[]> {
  try {
    const events = await db.schoolEvents.toArray();
    if (events && events.length > 0) {
      return events;
    }
  } catch (e) {
    console.warn('Error reading events from DB:', e);
  }

  // Seed default events if table is empty
  for (const ev of INITIAL_EVENTS) {
    await db.schoolEvents.put(ev).catch(() => {});
  }
  return INITIAL_EVENTS;
}

export async function createUnifiedSchoolEvent(event: Omit<SchoolEventItem, 'id' | 'rsvpCounts'>): Promise<SchoolEventItem> {
  const newEvent: SchoolEventItem = {
    ...event,
    id: 'evt-' + Date.now(),
    rsvpCounts: { attending: 0, declined: 0, pending: 0 },
  };

  await db.schoolEvents.put(newEvent);

  await dispatchSchoolEvent({
    type: 'ANNOUNCEMENT_PUBLISHED',
    entityId: newEvent.id,
    entityName: newEvent.title,
    title: `New School Event: ${newEvent.title}`,
    summary: `${newEvent.eventType} event scheduled for ${newEvent.startDate} at ${newEvent.location}`,
    targetRole: (newEvent.targetAudience as any) || 'All',
  });

  return newEvent;
}

export async function submitEventRsvp(
  eventId: string,
  user: { id: string; name: string; role: string; childName?: string },
  status: 'Attending' | 'Declined'
): Promise<void> {
  const event = await db.schoolEvents.get(eventId);
  if (!event) return;

  const rsvpRecord: EventRsvpRecord = {
    id: `rsvp-${eventId}-${user.id}`,
    eventId,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    childName: user.childName,
    status,
    updatedAt: new Date().toISOString(),
  };

  await db.eventRsvps.put(rsvpRecord);

  // Update counts
  if (status === 'Attending') {
    event.rsvpCounts.attending += 1;
  } else {
    event.rsvpCounts.declined += 1;
  }
  await db.schoolEvents.put(event);
}
