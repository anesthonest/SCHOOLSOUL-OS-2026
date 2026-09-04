import { db } from '../db/indexedDB';
import type {
  DirectMessage,
  MessageConversation,
  SmsLog,
  WhatsAppLog,
  Announcement,
  SchoolNewsArticle,
  SchoolEventItem,
  EventRsvpRecord,
  ParentTeacherMeetingSlot,
  DigitalConsentForm,
  ParentConsentSubmission,
  SchoolSurvey,
  SurveyResponseRecord,
  HelpDeskTicket,
  CommunityGroupItem,
  GroupPostItem,
  EmergencyAlertRecord,
  Student,
} from '../types';

// ==========================================
// SEED DEFAULT INITIAL COMMUNICATION DATA
// ==========================================
let isSeedingCommunicationPromise: Promise<void> | null = null;

export async function seedCommunicationDataIfNeeded(): Promise<void> {
  if (isSeedingCommunicationPromise) {
    return isSeedingCommunicationPromise;
  }

  isSeedingCommunicationPromise = (async () => {
    try {
      const convCount = await db.messageConversations.count();
      if (convCount === 0) {
        const defaultConversations: MessageConversation[] = [
      {
        id: 'conv-1',
        title: 'Senior 1 North Parent & Teacher Class Group',
        conversationType: 'ClassBroadcast',
        participantIds: ['usr-parent-1', 'usr-teacher-1', 'usr-parent-2'],
        participantNames: ['Mr. Mugisha David', 'Tr. Sarah Akello', 'Mrs. Namutebi Florence'],
        lastMessageText: 'Please remember that tomorrow is the mid-term Science practical project submission.',
        lastMessageTimestamp: '2026-07-28T08:30:00Z',
        unreadCount: 2,
        classGrade: 'Senior 1',
        stream: 'North',
        isGroup: true,
        createdBy: 'Tr. Sarah Akello',
      },
      {
        id: 'conv-2',
        title: 'Tr. Sarah Akello (Physics & Mathematics)',
        conversationType: 'Direct',
        participantIds: ['usr-parent-1', 'usr-teacher-1'],
        participantNames: ['Mr. Mugisha David', 'Tr. Sarah Akello'],
        lastMessageText: 'Emmanuel performed exceptionally well in the calculus continuous assessment test!',
        lastMessageTimestamp: '2026-07-27T16:15:00Z',
        unreadCount: 0,
        isGroup: false,
        createdBy: 'Tr. Sarah Akello',
      },
    ];
    await db.messageConversations.bulkPut(defaultConversations);

    const defaultMessages: DirectMessage[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-2',
        senderId: 'usr-teacher-1',
        senderName: 'Tr. Sarah Akello',
        senderRole: 'Teacher',
        messageText: 'Hello Mr. Mugisha David, Emmanuel performed exceptionally well in the calculus continuous assessment test!',
        createdAt: '2026-07-27T16:15:00Z',
        readByUsers: ['usr-parent-1'],
      },
    ];
    await db.directMessages.bulkPut(defaultMessages);

    // Initial SMS Logs
    const defaultSms: SmsLog[] = [
      {
        id: 'sms-1',
        recipientPhone: '+256772123456',
        recipientName: 'Mugisha David',
        recipientType: 'Parent',
        messageText: 'Vinexsah High School: Student Emmanuel Mugisha arrived safely at school today at 07:15 AM.',
        provider: 'AfricasTalking',
        status: 'Delivered',
        triggerType: 'Attendance Alert',
        costUGX: 35,
        sentAt: '2026-07-28T07:16:00Z',
      },
      {
        id: 'sms-2',
        recipientPhone: '+256701987654',
        recipientName: 'Namutebi Florence',
        recipientType: 'Parent',
        messageText: 'Vinexsah High School: Reminder for Term 1 Fee balance clearing before report card release.',
        provider: 'AirtelUganda',
        status: 'Delivered',
        triggerType: 'Fee Reminder',
        costUGX: 30,
        sentAt: '2026-07-27T10:00:00Z',
      },
    ];
    await db.smsLogs.bulkPut(defaultSms);

    // Initial WhatsApp Logs
    const defaultWhatsApp: WhatsAppLog[] = [
      {
        id: 'wa-1',
        recipientPhone: '+256772123456',
        recipientName: 'Mugisha David',
        templateName: 'report_card_ready_v1',
        messageContent: 'Dear Parent, Mugisha Emmanuel\'s Term 1 Report Card is ready on the SchoolSoul Parent Portal. Click link to download.',
        providerStatus: 'Read',
        interactiveButtons: ['View Report Card', 'Pay Fee Balance'],
        sentAt: '2026-07-26T14:20:00Z',
      },
    ];
    await db.whatsAppLogs.bulkPut(defaultWhatsApp);

    // Initial Announcements
    const defaultAnnouncements: Announcement[] = [
      {
        id: 'ann-1',
        title: 'Term 1 Parent-Teacher Consultative Meeting & Exhibition',
        category: 'Events',
        audienceScope: 'All',
        content: 'All parents and guardians are invited to the Term 1 PTM on Friday, August 5th, 2026. Student project displays will be open in the Main Hall.',
        authorName: 'Headteacher - Dr. Joseph Mukasa',
        authorRole: 'Headteacher',
        isPinned: true,
        expiryDate: '2026-08-10',
        pushTriggered: true,
        smsTriggered: true,
        createdAt: '2026-07-25T09:00:00Z',
      },
      {
        id: 'ann-2',
        title: 'Senior 4 UNEB Registration & Verification Deadline',
        category: 'Exams',
        audienceScope: 'SpecificClass',
        classGrade: 'Senior 4',
        content: 'Parents of Senior 4 candidates must verify LIN/NIN credentials and approve bio-data sheets before Friday.',
        authorName: 'Registrar - Mr. James Otim',
        authorRole: 'Registrar',
        isPinned: false,
        expiryDate: '2026-08-01',
        pushTriggered: true,
        smsTriggered: false,
        createdAt: '2026-07-24T11:30:00Z',
      },
    ];
    await db.announcements.bulkPut(defaultAnnouncements);

    // Initial News
    const defaultNews: SchoolNewsArticle[] = [
      {
        id: 'news-1',
        title: 'Vinexsah High School Triumphs in National Science & Robotics Fair',
        category: 'Academic Achievements',
        summary: 'Our Senior 3 and Senior 4 ICT & Engineering club won first place in Kampala Regional Robotics competition.',
        content: 'Students designed a solar-powered automated water filtration system tailored for rural schools. The team presented before the Ministry of Education panel.',
        featuredImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        authorName: 'Tr. Sarah Akello',
        authorRole: 'Teacher',
        status: 'Published',
        approvedBy: 'Dr. Joseph Mukasa',
        viewsCount: 142,
        publishDate: '2026-07-20',
      },
    ];
    await db.newsArticles.bulkPut(defaultNews);

    // Initial Events
    const defaultEvents: SchoolEventItem[] = [
      {
        id: 'evt-1',
        title: 'Annual Sports Day & Athletics Competition',
        eventType: 'Sports',
        startDate: '2026-08-15',
        endDate: '2026-08-15',
        startTime: '08:00',
        endTime: '17:00',
        location: 'School Main Sports Complex',
        description: 'Inter-house athletics, football, basketball and relay competitions between Red, Blue, Green, and Yellow houses.',
        organizer: 'Sports Department',
        targetAudience: 'All Parents, Students & Staff',
        rsvpCounts: { attending: 185, declined: 12, pending: 45 },
        isPublic: true,
      },
    ];
    await db.schoolEvents.bulkPut(defaultEvents);

    // Initial PTM Slots
    const defaultPtmSlots: ParentTeacherMeetingSlot[] = [
      {
        id: 'ptm-1',
        teacherId: 'usr-teacher-1',
        teacherName: 'Tr. Sarah Akello',
        subject: 'Physics & Mathematics',
        date: '2026-08-05',
        startTime: '09:00',
        endTime: '09:15',
        isBooked: false,
        meetingType: 'In-Person',
        status: 'Available',
      },
      {
        id: 'ptm-2',
        teacherId: 'usr-teacher-1',
        teacherName: 'Tr. Sarah Akello',
        subject: 'Physics & Mathematics',
        date: '2026-08-05',
        startTime: '09:15',
        endTime: '09:30',
        isBooked: true,
        bookedByParentId: 'usr-parent-1',
        parentName: 'Mr. Mugisha David',
        parentPhone: '+256772123456',
        studentId: 'st-1',
        studentName: 'Mugisha Emmanuel',
        classGrade: 'Senior 1',
        meetingType: 'In-Person',
        status: 'Scheduled',
      },
    ];
    await db.parentTeacherMeetings.bulkPut(defaultPtmSlots);

    // Initial Consent Forms
    const defaultConsent: DigitalConsentForm[] = [
      {
        id: 'cs-1',
        title: 'Uganda Wildlife Education Centre (Entebbe) Educational Trip',
        category: 'School Trip',
        description: 'Guided biology and conservation study trip for Senior 1 Biology students to Entebbe Zoo & Botanical Gardens.',
        classGrade: 'Senior 1',
        dueDate: '2026-08-10',
        createdBy: 'Tr. Sarah Akello',
        totalRequested: 60,
        totalSigned: 42,
        totalDeclined: 3,
        requiresFeeApproval: true,
        feeAmountUGX: 45000,
        status: 'Active',
        createdAt: '2026-07-22T10:00:00Z',
      },
    ];
    await db.consentForms.bulkPut(defaultConsent);

    // Initial Surveys
    const defaultSurveys: SchoolSurvey[] = [
      {
        id: 'surv-1',
        title: 'Parent Satisfaction & E-Learning Infrastructure Survey',
        targetAudience: 'Parents',
        description: 'Feedback on digital communication, school meal quality, homework volume, and transport safety.',
        expiryDate: '2026-08-20',
        isAnonymous: false,
        questions: [
          { id: 'q1', text: 'How satisfied are you with school-parent communication via SchoolSoul?', type: 'rating' },
          { id: 'q2', text: 'Is your child receiving adequate academic support for CBC continuous assessments?', type: 'choice', options: ['Yes, fully', 'Somewhat', 'No, needs improvement'] },
          { id: 'q3', text: 'Additional feedback or suggestions for school management:', type: 'text' },
        ],
        responsesCount: 38,
        status: 'Active',
        createdAt: '2026-07-15T09:00:00Z',
      },
    ];
    await db.surveys.bulkPut(defaultSurveys);

    // Initial Helpdesk Tickets
    const defaultTickets: HelpDeskTicket[] = [
      {
        id: 'tkt-1',
        ticketNumber: 'HD-2026-0089',
        requesterName: 'Mugisha David',
        requesterRole: 'Parent',
        requesterPhone: '+256772123456',
        category: 'Fee Inquiry',
        subject: 'Mobile Money Fee Payment Receipt Confirmation',
        description: 'I paid UGX 850,000 via Airtel Money yesterday. Please verify if statement reflects in Emmanuel\'s ledger.',
        priority: 'Medium',
        status: 'In Progress',
        assignedStaffId: 'usr-bursar-1',
        assignedStaffName: 'Mr. Kato Francis (Bursar)',
        replies: [
          {
            id: 'rep-1',
            senderName: 'Mr. Kato Francis (Bursar)',
            role: 'Bursar',
            message: 'Hello Mr. Mugisha, we have located the Airtel payment reference MB-991823. Receipt has been issued.',
            timestamp: '2026-07-28T08:15:00Z',
          },
        ],
        createdAt: '2026-07-27T14:00:00Z',
        updatedAt: '2026-07-28T08:15:00Z',
      },
    ];
    await db.helpDeskTickets.bulkPut(defaultTickets);

    // Initial Community Groups
    const defaultGroups: CommunityGroupItem[] = [
      {
        id: 'grp-1',
        groupName: 'Parent Teacher Association (PTA) General Forum',
        category: 'PTA Committee',
        description: 'Official consultative space for all parents, guardians, and teachers of Vinexsah High School.',
        moderatorId: 'usr-headteacher-1',
        moderatorName: 'Dr. Joseph Mukasa',
        memberCount: 420,
        isPrivate: false,
        createdAt: '2026-01-10T00:00:00Z',
      },
      {
        id: 'grp-2',
        groupName: 'Senior 1 Parents Club',
        category: 'Class Parents',
        description: 'Discussion and updates for parents with students in Senior 1 (North & South Streams).',
        moderatorId: 'usr-teacher-1',
        moderatorName: 'Tr. Sarah Akello',
        memberCount: 110,
        isPrivate: false,
        createdAt: '2026-01-15T00:00:00Z',
      },
    ];
    await db.communityGroups.bulkPut(defaultGroups);

    // Initial Posts
    const defaultPosts: GroupPostItem[] = [
      {
        id: 'post-1',
        groupId: 'grp-1',
        authorId: 'usr-headteacher-1',
        authorName: 'Dr. Joseph Mukasa',
        authorRole: 'Headteacher',
        content: 'Dear Parents, thank you for participating in the recent Science exhibition fundraising drive. We raised UGX 12.5 Million for new laboratory equipment!',
        likesCount: 54,
        commentsCount: 12,
        createdAt: '2026-07-26T12:00:00Z',
      },
    ];
    await db.groupPosts.bulkPut(defaultPosts);

    // Initial Emergency Alert
    const defaultAlerts: EmergencyAlertRecord[] = [
      {
        id: 'emg-1',
        alertTitle: 'Heavy Downpour & Severe Road Flooding Notice',
        emergencyType: 'Severe Weather',
        severity: 'High',
        messageContent: 'School buses may experience 30-minute delays on Jinja Road due to heavy morning downpour. All students are safe in school premises.',
        targetAudience: 'All Parents & Staff',
        broadcastChannels: ['SMS', 'WhatsApp', 'In-App Alert'],
        sentBy: 'Headteacher',
        totalRecipients: 450,
        deliveredCount: 442,
        timestamp: '2026-07-21T06:45:00Z',
      },
    ];
    await db.emergencyAlerts.bulkPut(defaultAlerts);
  }
} catch (err) {
  console.warn('seedCommunicationDataIfNeeded warning (handled):', err);
} finally {
  isSeedingCommunicationPromise = null;
}
})();

return isSeedingCommunicationPromise;
}

// ==========================================
// PARENT PORTAL API SERVICES
// ==========================================
export async function getLinkedChildrenForParent(parentId?: string): Promise<Student[]> {
  await seedCommunicationDataIfNeeded();
  // Fetch all students or filter by guardian if specified
  const students = await db.students.toArray();
  return students.length > 0
    ? students
    : [
        {
          id: 'st-1',
          studentId: 'STU-001',
          admissionNumber: 'ADM-2026-001',
          firstName: 'Emmanuel',
          lastName: 'Mugisha',
          fullName: 'Mugisha Emmanuel',
          gender: 'Male',
          dateOfBirth: '2012-05-14',
          nationality: 'Ugandan',
          nationalIdOrBirthCert: 'LIN-99018274',
          classGrade: 'Senior 1',
          stream: 'North',
          residenceType: 'Day',
          status: 'Active',
          enrolmentDate: '2026-01-10',
          qrVerificationHash: 'QR-STU-001-VERIFIED',
          createdAt: '2026-01-10T00:00:00Z',
          updatedAt: '2026-01-10T00:00:00Z',
        },
      ];
}

// ==========================================
// DIRECT & BROADCAST MESSAGING API
// ==========================================
export async function getConversations(): Promise<MessageConversation[]> {
  await seedCommunicationDataIfNeeded();
  return db.messageConversations.toArray();
}

export async function getMessagesByConversation(conversationId: string): Promise<DirectMessage[]> {
  await seedCommunicationDataIfNeeded();
  return db.directMessages.where('conversationId').equals(conversationId).sortBy('createdAt');
}

export async function sendDirectMessage(data: Partial<DirectMessage>): Promise<DirectMessage> {
  const newMsg: DirectMessage = {
    id: `msg-${Date.now()}`,
    conversationId: data.conversationId || 'conv-1',
    senderId: data.senderId || 'usr-current',
    senderName: data.senderName || 'Current User',
    senderRole: data.senderRole || 'Parent',
    messageText: data.messageText || '',
    attachments: data.attachments || [],
    isVoiceNote: data.isVoiceNote || false,
    voiceDurationSec: data.voiceDurationSec,
    readByUsers: [data.senderId || 'usr-current'],
    createdAt: new Date().toISOString(),
  };

  await db.directMessages.add(newMsg);

  // Update conversation last message
  const conv = await db.messageConversations.get(newMsg.conversationId);
  if (conv) {
    conv.lastMessageText = newMsg.messageText;
    conv.lastMessageTimestamp = newMsg.createdAt;
    await db.messageConversations.put(conv);
  }

  return newMsg;
}

export async function createConversation(data: Partial<MessageConversation>): Promise<MessageConversation> {
  const newConv: MessageConversation = {
    id: `conv-${Date.now()}`,
    title: data.title || 'New Group Conversation',
    conversationType: data.conversationType || 'Direct',
    participantIds: data.participantIds || ['usr-current'],
    participantNames: data.participantNames || ['Current User'],
    lastMessageText: 'Conversation started.',
    lastMessageTimestamp: new Date().toISOString(),
    unreadCount: 0,
    classGrade: data.classGrade,
    stream: data.stream,
    isGroup: data.isGroup ?? true,
    createdBy: data.createdBy || 'Current User',
  };

  await db.messageConversations.add(newConv);
  return newConv;
}

// ==========================================
// SMS ENGINE API
// ==========================================
export async function getSmsLogs(): Promise<SmsLog[]> {
  await seedCommunicationDataIfNeeded();
  return db.smsLogs.reverse().toArray();
}

export async function sendSingleSms(
  recipientPhone: string,
  recipientName: string,
  messageText: string,
  provider: 'AfricasTalking' | 'Twilio' | 'AirtelUganda' | 'MtnUganda' = 'AfricasTalking',
  triggerType: SmsLog['triggerType'] = 'Manual'
): Promise<SmsLog> {
  const cost = provider === 'AirtelUganda' || provider === 'MtnUganda' ? 30 : 35;
  const newSms: SmsLog = {
    id: `sms-${Date.now()}`,
    recipientPhone,
    recipientName,
    recipientType: 'Parent',
    messageText,
    provider,
    status: 'Delivered',
    triggerType,
    costUGX: cost,
    sentAt: new Date().toISOString(),
  };

  await db.smsLogs.add(newSms);
  return newSms;
}

export async function sendBatchSms(
  recipients: { phone: string; name: string }[],
  messageText: string,
  provider: 'AfricasTalking' | 'Twilio' | 'AirtelUganda' | 'MtnUganda' = 'AfricasTalking',
  triggerType: SmsLog['triggerType'] = 'Manual'
): Promise<number> {
  const now = new Date().toISOString();
  const cost = provider === 'AirtelUganda' || provider === 'MtnUganda' ? 30 : 35;

  const logs: SmsLog[] = recipients.map((r, idx) => ({
    id: `sms-${Date.now()}-${idx}`,
    recipientPhone: r.phone,
    recipientName: r.name,
    recipientType: 'Parent',
    messageText,
    provider,
    status: 'Delivered',
    triggerType,
    costUGX: cost,
    sentAt: now,
  }));

  await db.smsLogs.bulkPut(logs);
  return logs.length;
}

// ==========================================
// WHATSAPP INTEGRATION API
// ==========================================
export async function getWhatsAppLogs(): Promise<WhatsAppLog[]> {
  await seedCommunicationDataIfNeeded();
  return db.whatsAppLogs.reverse().toArray();
}

export async function sendWhatsAppNotification(
  recipientPhone: string,
  recipientName: string,
  templateName: string,
  messageContent: string,
  interactiveButtons: string[] = []
): Promise<WhatsAppLog> {
  const log: WhatsAppLog = {
    id: `wa-${Date.now()}`,
    recipientPhone,
    recipientName,
    templateName,
    messageContent,
    providerStatus: 'Sent',
    interactiveButtons,
    sentAt: new Date().toISOString(),
  };

  await db.whatsAppLogs.add(log);
  return log;
}

// ==========================================
// ANNOUNCEMENTS API
// ==========================================
export async function getAnnouncements(): Promise<Announcement[]> {
  await seedCommunicationDataIfNeeded();
  return db.announcements.reverse().toArray();
}

export async function createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  const item: Announcement = {
    id: `ann-${Date.now()}`,
    title: data.title || 'Untitled Announcement',
    category: data.category || 'General',
    audienceScope: data.audienceScope || 'All',
    classGrade: data.classGrade,
    content: data.content || '',
    authorName: data.authorName || 'School Administration',
    authorRole: data.authorRole || 'Administrator',
    isPinned: data.isPinned || false,
    expiryDate: data.expiryDate || '2026-12-31',
    pushTriggered: data.pushTriggered ?? true,
    smsTriggered: data.smsTriggered ?? false,
    createdAt: new Date().toISOString(),
  };

  await db.announcements.add(item);

  // If SMS trigger is enabled, log automatic SMS dispatch
  if (item.smsTriggered) {
    await sendSingleSms(
      '+256700000000',
      'School All Parents',
      `Vinexsah Notice: ${item.title}. Check portal for details.`,
      'AfricasTalking',
      'Manual'
    );
  }

  return item;
}

// ==========================================
// SCHOOL NEWS API
// ==========================================
export async function getNewsArticles(): Promise<SchoolNewsArticle[]> {
  await seedCommunicationDataIfNeeded();
  return db.newsArticles.reverse().toArray();
}

export async function createNewsArticle(data: Partial<SchoolNewsArticle>): Promise<SchoolNewsArticle> {
  const article: SchoolNewsArticle = {
    id: `news-${Date.now()}`,
    title: data.title || 'Untitled Article',
    category: data.category || 'Campus Life',
    summary: data.summary || '',
    content: data.content || '',
    featuredImageUrl: data.featuredImageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    authorName: data.authorName || 'School Journalist',
    authorRole: data.authorRole || 'Teacher',
    status: data.status || 'Draft',
    viewsCount: 0,
    publishDate: new Date().toISOString().split('T')[0],
  };

  await db.newsArticles.add(article);
  return article;
}

export async function approveAndPublishNews(id: string, approverName: string): Promise<void> {
  const art = await db.newsArticles.get(id);
  if (art) {
    art.status = 'Published';
    art.approvedBy = approverName;
    await db.newsArticles.put(art);
  }
}

// ==========================================
// SCHOOL EVENTS API
// ==========================================
export async function getSchoolEvents(): Promise<SchoolEventItem[]> {
  await seedCommunicationDataIfNeeded();
  return db.schoolEvents.toArray();
}

export async function createSchoolEvent(data: Partial<SchoolEventItem>): Promise<SchoolEventItem> {
  const evt: SchoolEventItem = {
    id: `evt-${Date.now()}`,
    title: data.title || 'School Event',
    eventType: data.eventType || 'General',
    startDate: data.startDate || '2026-08-15',
    endDate: data.endDate || data.startDate || '2026-08-15',
    startTime: data.startTime || '09:00',
    endTime: data.endTime || '12:00',
    location: data.location || 'School Grounds',
    description: data.description || '',
    organizer: data.organizer || 'Administration',
    targetAudience: data.targetAudience || 'All',
    rsvpCounts: { attending: 0, declined: 0, pending: 50 },
    isPublic: data.isPublic ?? true,
  };

  await db.schoolEvents.add(evt);
  return evt;
}

export async function submitEventRsvp(eventId: string, userId: string, userName: string, status: 'Attending' | 'Declined'): Promise<void> {
  const evt = await db.schoolEvents.get(eventId);
  if (evt) {
    if (status === 'Attending') {
      evt.rsvpCounts.attending += 1;
      if (evt.rsvpCounts.pending > 0) evt.rsvpCounts.pending -= 1;
    } else {
      evt.rsvpCounts.declined += 1;
      if (evt.rsvpCounts.pending > 0) evt.rsvpCounts.pending -= 1;
    }
    await db.schoolEvents.put(evt);
  }

  const record: EventRsvpRecord = {
    id: `rsvp-${Date.now()}`,
    eventId,
    userId,
    userName,
    userRole: 'Parent',
    status,
    updatedAt: new Date().toISOString(),
  };

  await db.eventRsvps.add(record);
}

// ==========================================
// PARENT-TEACHER MEETINGS API
// ==========================================
export async function getPtmSlots(): Promise<ParentTeacherMeetingSlot[]> {
  await seedCommunicationDataIfNeeded();
  return db.parentTeacherMeetings.toArray();
}

export async function createPtmSlot(data: Partial<ParentTeacherMeetingSlot>): Promise<ParentTeacherMeetingSlot> {
  const slot: ParentTeacherMeetingSlot = {
    id: `ptm-${Date.now()}`,
    teacherId: data.teacherId || 'usr-teacher-1',
    teacherName: data.teacherName || 'Tr. Sarah Akello',
    subject: data.subject || 'Physics',
    date: data.date || '2026-08-05',
    startTime: data.startTime || '10:00',
    endTime: data.endTime || '10:15',
    isBooked: false,
    meetingType: data.meetingType || 'In-Person',
    status: 'Available',
  };

  await db.parentTeacherMeetings.add(slot);
  return slot;
}

export async function bookPtmSlot(
  slotId: string,
  parentId: string,
  parentName: string,
  parentPhone: string,
  studentName: string
): Promise<ParentTeacherMeetingSlot> {
  const slot = await db.parentTeacherMeetings.get(slotId);
  if (!slot) throw new Error('Slot not found');

  slot.isBooked = true;
  slot.bookedByParentId = parentId;
  slot.parentName = parentName;
  slot.parentPhone = parentPhone;
  slot.studentName = studentName;
  slot.status = 'Scheduled';

  await db.parentTeacherMeetings.put(slot);

  // Send auto SMS confirmation
  await sendSingleSms(
    parentPhone,
    parentName,
    `PTM Booking Confirmed: Meeting with ${slot.teacherName} on ${slot.date} at ${slot.startTime} regarding ${studentName}.`,
    'AfricasTalking',
    'Parent Meetings' as any
  );

  return slot;
}

// ==========================================
// DIGITAL CONSENT FORMS API
// ==========================================
export async function getConsentForms(): Promise<DigitalConsentForm[]> {
  await seedCommunicationDataIfNeeded();
  return db.consentForms.reverse().toArray();
}

export async function createConsentForm(data: Partial<DigitalConsentForm>): Promise<DigitalConsentForm> {
  const form: DigitalConsentForm = {
    id: `cs-${Date.now()}`,
    title: data.title || 'Untitled Consent Form',
    category: data.category || 'School Trip',
    description: data.description || '',
    classGrade: data.classGrade || 'All Classes',
    dueDate: data.dueDate || '2026-08-31',
    createdBy: data.createdBy || 'Administration',
    totalRequested: data.totalRequested || 50,
    totalSigned: 0,
    totalDeclined: 0,
    requiresFeeApproval: data.requiresFeeApproval || false,
    feeAmountUGX: data.feeAmountUGX || 0,
    status: 'Active',
    createdAt: new Date().toISOString(),
  };

  await db.consentForms.add(form);
  return form;
}

export async function submitConsentApproval(
  consentFormId: string,
  studentId: string,
  studentName: string,
  parentId: string,
  parentName: string,
  parentPhone: string,
  status: 'Approved' | 'Declined',
  signatureToken: string
): Promise<ParentConsentSubmission> {
  const form = await db.consentForms.get(consentFormId);
  if (form) {
    if (status === 'Approved') form.totalSigned += 1;
    else form.totalDeclined += 1;
    await db.consentForms.put(form);
  }

  const sub: ParentConsentSubmission = {
    id: `sub-${Date.now()}`,
    consentFormId,
    studentId,
    studentName,
    parentId,
    parentName,
    parentPhone,
    status,
    digitalSignatureToken: signatureToken || `SIG-TOKEN-${Date.now()}`,
    signatureDate: new Date().toISOString(),
    parentIpAddress: '102.134.12.89',
  };

  await db.consentSubmissions.add(sub);
  return sub;
}

// ==========================================
// FEEDBACK & SURVEYS API
// ==========================================
export async function getSchoolSurveys(): Promise<SchoolSurvey[]> {
  await seedCommunicationDataIfNeeded();
  return db.surveys.reverse().toArray();
}

export async function createSchoolSurvey(data: Partial<SchoolSurvey>): Promise<SchoolSurvey> {
  const survey: SchoolSurvey = {
    id: `surv-${Date.now()}`,
    title: data.title || 'New Survey',
    targetAudience: data.targetAudience || 'Parents',
    description: data.description || '',
    expiryDate: data.expiryDate || '2026-08-30',
    isAnonymous: data.isAnonymous ?? false,
    questions: data.questions || [
      { id: 'q1', text: 'How satisfied are you with school services?', type: 'rating' },
    ],
    responsesCount: 0,
    status: 'Active',
    createdAt: new Date().toISOString(),
  };

  await db.surveys.add(survey);
  return survey;
}

export async function submitSurveyResponse(
  surveyId: string,
  respondentId: string,
  respondentRole: string,
  answers: { questionId: string; answerValue: string | number }[]
): Promise<void> {
  const survey = await db.surveys.get(surveyId);
  if (survey) {
    survey.responsesCount += 1;
    await db.surveys.put(survey);
  }

  const rec: SurveyResponseRecord = {
    id: `resp-${Date.now()}`,
    surveyId,
    respondentId,
    respondentRole,
    answers,
    submittedAt: new Date().toISOString(),
  };

  await db.surveyResponses.add(rec);
}

// ==========================================
// SCHOOL HELP CENTRE API
// ==========================================
export async function getHelpDeskTickets(): Promise<HelpDeskTicket[]> {
  await seedCommunicationDataIfNeeded();
  return db.helpDeskTickets.reverse().toArray();
}

export async function createHelpTicket(data: Partial<HelpDeskTicket>): Promise<HelpDeskTicket> {
  const count = (await db.helpDeskTickets.count()) + 1;
  const num = `HD-2026-${count.toString().padStart(4, '0')}`;

  const ticket: HelpDeskTicket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: num,
    requesterName: data.requesterName || 'Mugisha David',
    requesterRole: data.requesterRole || 'Parent',
    requesterPhone: data.requesterPhone || '+256772123456',
    category: data.category || 'General Request',
    subject: data.subject || 'Support Ticket',
    description: data.description || '',
    priority: data.priority || 'Medium',
    status: 'Open',
    replies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.helpDeskTickets.add(ticket);
  return ticket;
}

export async function replyHelpTicket(ticketId: string, senderName: string, role: string, message: string): Promise<HelpDeskTicket> {
  const ticket = await db.helpDeskTickets.get(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  ticket.replies.push({
    id: `rep-${Date.now()}`,
    senderName,
    role,
    message,
    timestamp: new Date().toISOString(),
  });
  ticket.status = 'In Progress';
  ticket.updatedAt = new Date().toISOString();

  await db.helpDeskTickets.put(ticket);
  return ticket;
}

export async function resolveHelpTicket(ticketId: string): Promise<void> {
  const ticket = await db.helpDeskTickets.get(ticketId);
  if (ticket) {
    ticket.status = 'Resolved';
    ticket.updatedAt = new Date().toISOString();
    await db.helpDeskTickets.put(ticket);
  }
}

// ==========================================
// COMMUNITY GROUPS API
// ==========================================
export async function getCommunityGroups(): Promise<CommunityGroupItem[]> {
  await seedCommunicationDataIfNeeded();
  return db.communityGroups.toArray();
}

export async function getGroupPosts(groupId: string): Promise<GroupPostItem[]> {
  await seedCommunicationDataIfNeeded();
  return db.groupPosts.where('groupId').equals(groupId).reverse().sortBy('createdAt');
}

export async function createGroupPost(groupId: string, authorId: string, authorName: string, authorRole: string, content: string): Promise<GroupPostItem> {
  const post: GroupPostItem = {
    id: `post-${Date.now()}`,
    groupId,
    authorId,
    authorName,
    authorRole,
    content,
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };

  await db.groupPosts.add(post);
  return post;
}

// ==========================================
// EMERGENCY ALERT API
// ==========================================
export async function getEmergencyAlerts(): Promise<EmergencyAlertRecord[]> {
  await seedCommunicationDataIfNeeded();
  return db.emergencyAlerts.reverse().toArray();
}

export async function dispatchEmergencyAlert(
  alertTitle: string,
  emergencyType: EmergencyAlertRecord['emergencyType'],
  severity: 'High' | 'Critical',
  messageContent: string,
  targetAudience: EmergencyAlertRecord['targetAudience'],
  broadcastChannels: ('SMS' | 'WhatsApp' | 'Push Notification' | 'In-App Alert')[]
): Promise<EmergencyAlertRecord> {
  const alert: EmergencyAlertRecord = {
    id: `emg-${Date.now()}`,
    alertTitle,
    emergencyType,
    severity,
    messageContent,
    targetAudience,
    broadcastChannels,
    sentBy: 'Headteacher - Dr. Joseph Mukasa',
    totalRecipients: 480,
    deliveredCount: 476,
    timestamp: new Date().toISOString(),
  };

  await db.emergencyAlerts.add(alert);

  // Auto-enqueue high priority SMS log
  if (broadcastChannels.includes('SMS')) {
    await sendSingleSms(
      '+256700000000',
      'All Emergency Contacts',
      `EMERGENCY ALERT: ${alertTitle} - ${messageContent}`,
      'AfricasTalking',
      'Emergency'
    );
  }

  return alert;
}

// ==========================================
// COMMUNICATION ANALYTICS API
// ==========================================
export async function getCommunicationAnalytics() {
  await seedCommunicationDataIfNeeded();

  const smsCount = await db.smsLogs.count();
  const waCount = await db.whatsAppLogs.count();
  const announcementsCount = await db.announcements.count();
  const ticketCount = await db.helpDeskTickets.count();
  const surveyCount = await db.surveys.count();

  return {
    totalSmsDispatched: smsCount || 240,
    smsDeliveryRatePercent: 98.4,
    totalWhatsAppMessages: waCount || 180,
    whatsAppReadRatePercent: 94.2,
    totalAnnouncementsPublished: announcementsCount || 12,
    parentPortalActiveRatePercent: 88.6,
    ptmAttendanceRatePercent: 91.0,
    helpdeskAvgResolutionHours: 2.4,
    totalHelpTickets: ticketCount || 15,
    surveyParticipationPercent: 76.5,
  };
}
