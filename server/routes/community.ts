import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getServerDB, mutateServerDB } from '../db/store';

const uuidv4 = () => crypto.randomUUID();

export const communityRouter = Router();

// Helper to extract tenant school ID
function getSchoolId(req: Request): string {
  return (req.headers['x-school-id'] as string) || (req.query.schoolId as string) || 'school-001';
}

// Safety keyword dictionary for anti-bullying and content safeguarding
const FLAGGED_KEYWORDS = [
  'kill', 'die', 'threat', 'attack', 'weapon', 'suicide', 'bomb',
  'stupid idiot', 'hate you', 'worthless', 'loser', 'beat you',
  'leak', 'naked', 'expose', 'cheat', 'scam'
];

function checkContentSafety(content: string): { isFlagged: boolean; matchedKeyword?: string } {
  if (!content) return { isFlagged: false };
  const lower = content.toLowerCase();
  for (const kw of FLAGGED_KEYWORDS) {
    if (lower.includes(kw)) {
      return { isFlagged: true, matchedKeyword: kw };
    }
  }
  return { isFlagged: false };
}

// Seed initial default groups for a school if none exist
async function ensureDefaultGroups(schoolId: string) {
  const db = await getServerDB();
  if (!db.communityGroups) db.communityGroups = [];
  if (!db.groupMemberships) db.groupMemberships = [];
  if (!db.groupMembershipRequests) db.groupMembershipRequests = [];
  if (!db.groupInvitations) db.groupInvitations = [];
  if (!db.groupNotifications) db.groupNotifications = [];
  if (!db.communityMessages) db.communityMessages = [];
  if (!db.communityAnnouncements) db.communityAnnouncements = [];
  if (!db.communityProjects) db.communityProjects = [];
  if (!db.communityReports) db.communityReports = [];
  if (!db.communityModerationActions) db.communityModerationActions = [];

  const existingSchoolGroups = db.communityGroups.filter((g: any) => g.schoolId === schoolId);
  if (existingSchoolGroups.length === 0) {
    const now = new Date().toISOString();
    const seedGroups = [
      {
        id: 'grp-school-wide',
        schoolId,
        name: 'Official School Assembly & Community',
        description: 'School-wide announcements, pastoral notices, and institution updates.',
        type: 'SCHOOL',
        visibility: 'SCHOOL_VISIBLE',
        status: 'ACTIVE',
        ownerId: 'usr-admin-1',
        ownerName: 'Headteacher / Admin Desk',
        ownerRole: 'Headteacher',
        avatarUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150',
        memberCount: 420,
        messageCount: 15,
        allowStudentPosts: false,
        requirePostModeration: true,
        allowMediaUploads: true,
        requireApproval: false,
        autoJoinEligible: true,
        canStudentLeave: false,
        rules: ['Respectful language only', 'No commercial advertisements', 'Official school communications'],
        tags: ['Official', 'Campus', 'All'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-s4-class',
        schoolId,
        name: 'Senior 4A Official Class Group',
        description: 'Class council discussions, room rosters, timetable updates and teacher circulars.',
        type: 'CLASS',
        visibility: 'AUTO_ASSIGNED',
        status: 'ACTIVE',
        ownerId: 'usr-teacher-1',
        ownerName: 'Tr. Sarah Akello',
        ownerRole: 'Class Teacher',
        classGrade: 'Senior 4',
        stream: 'Stream A',
        memberCount: 45,
        messageCount: 18,
        allowStudentPosts: true,
        requirePostModeration: false,
        allowMediaUploads: true,
        requireApproval: false,
        autoJoinEligible: true,
        canStudentLeave: false,
        rules: ['Strict academic decorum', 'Report homework questions with clarity'],
        tags: ['Senior 4', 'Class 4A', 'Academic'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-s4-science',
        schoolId,
        name: 'Senior 4 Science & STEM Lab',
        description: 'Physics, Chemistry, and Biology collaboration for Senior 4 candidates.',
        type: 'SUBJECT',
        visibility: 'SCHOOL_VISIBLE',
        status: 'ACTIVE',
        ownerId: 'usr-teacher-1',
        ownerName: 'Tr. Sarah Akello',
        ownerRole: 'Teacher',
        classGrade: 'Senior 4',
        subjectCode: 'PHY401',
        memberCount: 48,
        messageCount: 32,
        allowStudentPosts: true,
        requirePostModeration: false,
        allowMediaUploads: true,
        requireApproval: false,
        autoJoinEligible: true,
        canStudentLeave: false,
        rules: ['Post homework queries with working', 'Share only verified science materials'],
        tags: ['S4', 'Physics', 'Chemistry', 'Lab'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-s4-math',
        schoolId,
        name: 'Senior 4 Pure Mathematics & Calculus',
        description: 'Problem solving sessions, past papers dissection, and weekly mathematics challenges.',
        type: 'SUBJECT',
        visibility: 'SCHOOL_VISIBLE',
        status: 'ACTIVE',
        ownerId: 'usr-teacher-2',
        ownerName: 'Tr. John Baptist',
        ownerRole: 'Teacher',
        classGrade: 'Senior 4',
        subjectCode: 'MTH401',
        memberCount: 52,
        messageCount: 26,
        allowStudentPosts: true,
        requirePostModeration: false,
        allowMediaUploads: true,
        requireApproval: false,
        autoJoinEligible: true,
        canStudentLeave: false,
        rules: ['Show mathematical working step-by-step', 'No offensive language'],
        tags: ['S4', 'Mathematics', 'Calculus'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-robotics-club',
        schoolId,
        name: 'School Robotics & AI Club',
        description: 'Innovations, coding projects, hardware kits, and national tech competitions.',
        type: 'CLUB',
        visibility: 'SCHOOL_DISCOVERABLE',
        status: 'ACTIVE',
        ownerId: 'usr-teacher-1',
        ownerName: 'Tr. Sarah Akello',
        ownerRole: 'Teacher',
        memberCount: 28,
        messageCount: 44,
        allowStudentPosts: true,
        requirePostModeration: false,
        allowMediaUploads: true,
        requireApproval: true,
        autoJoinEligible: false,
        canStudentLeave: true,
        rules: ['Showcase your prototypes with video clips', 'Respect peer designs', 'Attend Friday workshops'],
        tags: ['Robotics', 'Coding', 'Innovations', 'STEM'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-debate-society',
        schoolId,
        name: 'National Debate & Model UN Society',
        description: 'Parliamentary debate drills, public speaking workshops, and inter-school competitions.',
        type: 'CLUB',
        visibility: 'SCHOOL_DISCOVERABLE',
        status: 'ACTIVE',
        ownerId: 'usr-teacher-3',
        ownerName: 'Tr. Christine Nabirye',
        ownerRole: 'Patron',
        memberCount: 34,
        messageCount: 19,
        allowStudentPosts: true,
        requirePostModeration: false,
        allowMediaUploads: true,
        requireApproval: true,
        autoJoinEligible: false,
        canStudentLeave: true,
        rules: ['Polite discourse only', 'Prepare motions in advance'],
        tags: ['Debate', 'Model UN', 'Public Speaking'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-football-team',
        schoolId,
        name: 'Varsity Football & Athletics Squad',
        description: 'Official sports training schedule, fixture notices, and inter-school championship prep.',
        type: 'SPORT',
        visibility: 'SCHOOL_DISCOVERABLE',
        status: 'ACTIVE',
        ownerId: 'usr-coach-1',
        ownerName: 'Coach David Ouma',
        ownerRole: 'Sports Director',
        memberCount: 25,
        messageCount: 12,
        allowStudentPosts: true,
        requirePostModeration: false,
        allowMediaUploads: true,
        requireApproval: true,
        autoJoinEligible: false,
        canStudentLeave: true,
        rules: ['Commitment to training attendance', 'Sportsmanship on and off the pitch'],
        tags: ['Football', 'Sports', 'Athletics'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-peer-study',
        schoolId,
        name: 'Candidate Peer Study & Revision Circles',
        description: 'Student-led revision exchange, flashcard quizzes, and exam study buddy matching.',
        type: 'STUDY',
        visibility: 'SCHOOL_DISCOVERABLE',
        status: 'ACTIVE',
        ownerId: 'usr-teacher-1',
        ownerName: 'Tr. Sarah Akello',
        ownerRole: 'Teacher Facilitator',
        memberCount: 65,
        messageCount: 58,
        allowStudentPosts: true,
        requirePostModeration: false,
        allowMediaUploads: true,
        requireApproval: false,
        autoJoinEligible: true,
        canStudentLeave: true,
        rules: ['Peer support only', 'Constructive academic explanations'],
        tags: ['Study', 'Revision', 'Peer Tutoring'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'grp-pta-council',
        schoolId,
        name: 'PTA & Parent-Teacher Committee',
        description: 'Parent-teacher consultative forum and school development discussions.',
        type: 'OTHER',
        visibility: 'MEMBERS_ONLY',
        status: 'ACTIVE',
        ownerId: 'usr-admin-1',
        ownerName: 'Headteacher / Admin Desk',
        ownerRole: 'Headteacher',
        memberCount: 160,
        messageCount: 22,
        allowStudentPosts: false,
        requirePostModeration: true,
        allowMediaUploads: true,
        requireApproval: true,
        autoJoinEligible: false,
        canStudentLeave: false,
        rules: ['Constructive feedback', 'Respect privacy of all students'],
        tags: ['PTA', 'Parents', 'Governance'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    db.communityGroups.push(...seedGroups);

    // Seed initial memberships for student-1 and student-2 in default groups
    const seedMemberships = [
      {
        id: 'mem-1',
        schoolId,
        groupId: 'grp-school-wide',
        userId: 'usr-student-1',
        userName: 'Emmanuel Mugisha',
        userRole: 'Student',
        groupRole: 'STUDENT',
        status: 'ACTIVE',
        joinedAt: now,
        unreadCount: 0,
      },
      {
        id: 'mem-2',
        schoolId,
        groupId: 'grp-s4-class',
        userId: 'usr-student-1',
        userName: 'Emmanuel Mugisha',
        userRole: 'Student',
        groupRole: 'STUDENT',
        status: 'ACTIVE',
        joinedAt: now,
        unreadCount: 0,
      },
      {
        id: 'mem-3',
        schoolId,
        groupId: 'grp-s4-science',
        userId: 'usr-student-1',
        userName: 'Emmanuel Mugisha',
        userRole: 'Student',
        groupRole: 'STUDENT',
        status: 'ACTIVE',
        joinedAt: now,
        unreadCount: 0,
      },
      {
        id: 'mem-4',
        schoolId,
        groupId: 'grp-s4-math',
        userId: 'usr-student-1',
        userName: 'Emmanuel Mugisha',
        userRole: 'Student',
        groupRole: 'STUDENT',
        status: 'ACTIVE',
        joinedAt: now,
        unreadCount: 0,
      },
    ];
    db.groupMemberships.push(...seedMemberships);

    // Seed a pending join request for testing the teacher approval workflow
    const seedRequests = [
      {
        id: 'req-sample-1',
        requestId: 'req-sample-1',
        schoolId,
        groupId: 'grp-robotics-club',
        groupName: 'School Robotics & AI Club',
        groupType: 'CLUB',
        studentId: 'usr-student-1',
        studentName: 'Emmanuel Mugisha',
        studentEmail: 'emmanuel.mugisha@student.school.ug',
        studentGrade: 'Senior 4',
        studentStream: 'Stream A',
        requestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'PENDING',
        reason: 'I built an Arduino solar tracker prototype and want to join the national competition team.',
      },
    ];
    db.groupMembershipRequests.push(...seedRequests);

    // Seed an invitation for testing student accept/decline workflow
    const seedInvitations = [
      {
        id: 'inv-sample-1',
        schoolId,
        groupId: 'grp-debate-society',
        groupName: 'National Debate & Model UN Society',
        groupType: 'CLUB',
        groupDescription: 'Parliamentary debate drills and inter-school speaking competitions.',
        invitedUserId: 'usr-student-1',
        invitedUserName: 'Emmanuel Mugisha',
        invitedUserRole: 'Student',
        invitedByUserId: 'usr-teacher-3',
        invitedByUserName: 'Tr. Christine Nabirye',
        invitedByUserRole: 'Teacher',
        status: 'PENDING',
        invitedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      },
    ];
    db.groupInvitations.push(...seedInvitations);

    // Seed initial notifications
    const seedNotifications = [
      {
        id: 'notif-sample-1',
        schoolId,
        userId: 'usr-student-1',
        groupId: 'grp-debate-society',
        groupName: 'National Debate & Model UN Society',
        type: 'INVITED_TO_GROUP',
        title: 'Group Invitation Received',
        message: 'Tr. Christine Nabirye invited you to join the National Debate & Model UN Society.',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'notif-sample-2',
        schoolId,
        userId: 'usr-student-1',
        groupId: 'grp-s4-science',
        groupName: 'Senior 4 Science & STEM Lab',
        type: 'NEW_ANNOUNCEMENT',
        title: 'Physics Practical Notice',
        message: 'Tr. Sarah Akello posted: Bring your 30cm calibrated ruler for Snell\'s Law experiment.',
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
    db.groupNotifications.push(...seedNotifications);

    // Seed initial announcements
    const seedAnnouncements = [
      {
        id: 'ann-1',
        schoolId,
        title: 'Term 2 Final Examinations Timetable Released',
        content: 'The official Term 2 examination schedule has been published. All candidates are advised to verify their designated exam rooms.',
        priority: 'HIGH',
        targetScope: 'SCHOOL_WIDE',
        authorId: 'usr-admin-1',
        authorName: 'Academic Registrar',
        authorRole: 'Registrar',
        isPinned: true,
        createdAt: now,
      },
      {
        id: 'ann-2',
        schoolId,
        title: 'National Science Fair Project Deliverables Due Friday',
        content: 'All participating teams in the STEM & Robotics club must upload final project videos by 5:00 PM Friday.',
        priority: 'NORMAL',
        targetScope: 'CLUB',
        targetId: 'grp-robotics-club',
        targetName: 'School Robotics & AI Club',
        authorId: 'usr-teacher-1',
        authorName: 'Tr. Sarah Akello',
        authorRole: 'Teacher',
        isPinned: false,
        createdAt: now,
      },
    ];
    db.communityAnnouncements.push(...seedAnnouncements);

    // Seed initial sample messages
    const seedMessages = [
      {
        id: 'msg-s4-1',
        schoolId,
        groupId: 'grp-s4-science',
        senderId: 'usr-teacher-1',
        senderName: 'Tr. Sarah Akello',
        senderRole: 'Teacher',
        content: 'Welcome to the Senior 4 Science forum! Here you can ask questions about optics and electrolysis practicals.',
        messageType: 'TEXT',
        status: 'ACTIVE',
        attachments: [],
        reactions: [{ emoji: '👍', count: 12, userIds: ['usr-student-1', 'usr-student-2'] }],
        mentions: [],
        isPinned: true,
        isEdited: false,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'msg-s4-2',
        schoolId,
        groupId: 'grp-s4-science',
        senderId: 'usr-student-1',
        senderName: 'Emmanuel Mugisha',
        senderRole: 'Student',
        content: 'Teacher Sarah, could you clarify whether the refractive index experiment questions will require graph plotting?',
        messageType: 'TEXT',
        status: 'ACTIVE',
        attachments: [],
        reactions: [{ emoji: '💡', count: 4, userIds: ['usr-student-2'] }],
        mentions: ['usr-teacher-1'],
        isPinned: false,
        isEdited: false,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'msg-s4-3',
        schoolId,
        groupId: 'grp-s4-science',
        senderId: 'usr-teacher-1',
        senderName: 'Tr. Sarah Akello',
        senderRole: 'Teacher',
        content: 'Yes Emmanuel, graph plotting on Snell\'s Law is a standard practical requirement. Please bring your calibrated 30cm rulers and graph booklets.',
        messageType: 'TEXT',
        status: 'ACTIVE',
        replyToMessageId: 'msg-s4-2',
        replyToPreview: {
          id: 'msg-s4-2',
          senderName: 'Emmanuel Mugisha',
          content: 'Teacher Sarah, could you clarify whether the refractive index experiment questions will require graph plotting?'
        },
        attachments: [],
        reactions: [{ emoji: '🙏', count: 8, userIds: ['usr-student-1'] }],
        mentions: ['usr-student-1'],
        isPinned: false,
        isEdited: false,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];
    db.communityMessages.push(...seedMessages);

    // Seed initial project
    const seedProjects = [
      {
        id: 'prj-solar-tracker',
        schoolId,
        groupId: 'grp-robotics-club',
        title: 'Dual-Axis Solar Tracker Prototype',
        description: 'Building an automated dual-axis solar irradiance tracking mount using Arduino microcontroller and LDR sensors.',
        subject: 'Applied Physics & STEM',
        leadTeacherId: 'usr-teacher-1',
        leadTeacherName: 'Tr. Sarah Akello',
        studentMemberIds: ['usr-student-1', 'usr-student-2'],
        studentMemberNames: ['Emmanuel Mugisha', 'Grace Nakato'],
        status: 'IN_PROGRESS',
        tasks: [
          { id: 'tsk-1', title: 'Circuit Schematic & LDR Bridge Setup', isCompleted: true, assignedToUserName: 'Emmanuel Mugisha' },
          { id: 'tsk-2', title: 'Servo Motor Angle Calibration Code', isCompleted: true, assignedToUserName: 'Grace Nakato' },
          { id: 'tsk-3', title: 'Mounting Chassis 3D Print / Fabrication', isCompleted: false, assignedToUserName: 'Emmanuel Mugisha' },
          { id: 'tsk-4', title: 'Demonstration Video & Power Output Graph', isCompleted: false },
        ],
        deliverables: [
          { id: 'del-1', title: 'Circuit Diagram PDF', submittedByUserName: 'Emmanuel Mugisha', submittedAt: now },
        ],
        teacherFeedback: [
          {
            teacherId: 'usr-teacher-1',
            teacherName: 'Tr. Sarah Akello',
            comments: 'Excellent schematic layout. Ensure resistors prevent servo stall currents.',
            gradeScore: 92,
            timestamp: now,
          },
        ],
        isMarketplacePublished: false,
        createdAt: now,
        updatedAt: now,
      }
    ];
    db.communityProjects.push(...seedProjects);

    await mutateServerDB(() => db);
  }
}

// ----------------------------------------------------
// 1. GROUPS CRUD & DISCOVERY
// ----------------------------------------------------

// List groups (general)
communityRouter.get('/groups', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await ensureDefaultGroups(schoolId);

    const db = await getServerDB();
    let groups = (db.communityGroups || []).filter((g: any) => g.schoolId === schoolId);

    const { type, visibility, query, myOnly, userId } = req.query;

    if (type && type !== 'ALL') {
      groups = groups.filter((g: any) => g.type === type);
    }
    if (visibility) {
      groups = groups.filter((g: any) => g.visibility === visibility);
    }
    if (query) {
      const q = String(query).toLowerCase();
      groups = groups.filter((g: any) =>
        g.name.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q)) ||
        (g.tags && g.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }
    if (myOnly === 'true' && userId) {
      const userMemberships = (db.groupMemberships || []).filter(
        (m: any) => m.userId === userId && m.schoolId === schoolId && m.status === 'ACTIVE'
      );
      const memberGroupIds = new Set(userMemberships.map((m: any) => m.groupId));
      // Also include groups owned by user
      groups = groups.filter((g: any) => memberGroupIds.has(g.id) || g.ownerId === userId);
    }

    res.json({
      success: true,
      data: groups,
      total: groups.length,
      schoolId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Student / User "My Groups" endpoint with unread count and latest activity snippet
communityRouter.get('/groups/my', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await ensureDefaultGroups(schoolId);
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'usr-student-1';

    const db = await getServerDB();
    const memberships = (db.groupMemberships || []).filter(
      (m: any) => m.schoolId === schoolId && m.userId === userId && m.status === 'ACTIVE'
    );
    const memberGroupIds = new Set(memberships.map((m: any) => m.groupId));

    // Also include groups owned by this user
    const userGroups = (db.communityGroups || []).filter(
      (g: any) => g.schoolId === schoolId && (memberGroupIds.has(g.id) || g.ownerId === userId)
    );

    // Augment with last message snippet, unread count, and membership role
    const enriched = userGroups.map((group: any) => {
      const mem = memberships.find((m: any) => m.groupId === group.id);
      const groupMsgs = (db.communityMessages || []).filter(
        (msg: any) => msg.groupId === group.id && msg.schoolId === schoolId && msg.status !== 'DELETED' && msg.status !== 'HIDDEN'
      );
      groupMsgs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const latestMsg = groupMsgs[0] || null;

      return {
        ...group,
        membership: mem || {
          groupRole: group.ownerId === userId ? 'OWNER' : 'MEMBER',
          status: 'ACTIVE',
          joinedAt: group.createdAt,
          unreadCount: 0,
        },
        lastMessage: latestMsg
          ? {
              id: latestMsg.id,
              senderName: latestMsg.senderName,
              content: latestMsg.content || (latestMsg.attachments?.length ? 'Shared an attachment' : ''),
              createdAt: latestMsg.createdAt,
            }
          : null,
      };
    });

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Student "Discover Groups" endpoint with category filters, eligibility, and membership status
communityRouter.get('/groups/discover', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await ensureDefaultGroups(schoolId);
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'usr-student-1';
    const category = (req.query.category as string) || 'ALL';
    const searchQuery = (req.query.query as string) || '';

    const db = await getServerDB();

    // Only discover groups belonging strictly to this school tenant and that are discoverable
    let discoverable = (db.communityGroups || []).filter((g: any) => {
      if (g.schoolId !== schoolId) return false;
      if (g.status === 'ARCHIVED' || g.status === 'SUSPENDED') return false;
      // Private groups are hidden from general discovery unless user has an active membership or invitation
      if (g.visibility === 'PRIVATE' || g.visibility === 'MEMBERS_ONLY') {
        const isMem = (db.groupMemberships || []).some((m: any) => m.groupId === g.id && m.userId === userId && m.status === 'ACTIVE');
        const hasInv = (db.groupInvitations || []).some((inv: any) => inv.groupId === g.id && inv.invitedUserId === userId && inv.status === 'PENDING');
        return isMem || hasInv;
      }
      return true;
    });

    // Category filter
    if (category !== 'ALL') {
      discoverable = discoverable.filter((g: any) => g.type === category);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      discoverable = discoverable.filter((g: any) =>
        g.name.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q)) ||
        (g.subjectCode && g.subjectCode.toLowerCase().includes(q)) ||
        (g.classGrade && g.classGrade.toLowerCase().includes(q)) ||
        (g.tags && g.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // Map each group with student's membership status and pending request status
    const memberships = (db.groupMemberships || []).filter((m: any) => m.schoolId === schoolId && m.userId === userId);
    const requests = (db.groupMembershipRequests || []).filter((r: any) => r.schoolId === schoolId && r.studentId === userId);

    const enriched = discoverable.map((g: any) => {
      const mem = memberships.find((m: any) => m.groupId === g.id);
      const isMember = mem ? mem.status === 'ACTIVE' : g.ownerId === userId;
      const pendingReq = requests.find((r: any) => r.groupId === g.id && r.status === 'PENDING');

      return {
        ...g,
        isMember,
        membershipRole: mem?.groupRole || (g.ownerId === userId ? 'OWNER' : undefined),
        hasPendingRequest: Boolean(pendingReq),
        pendingRequestId: pendingReq?.id,
        isAutoJoin: g.autoJoinEligible || g.requireApproval === false,
      };
    });

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single group
communityRouter.get('/groups/:id', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const db = await getServerDB();
    const group = (db.communityGroups || []).find((g: any) => g.id === req.params.id && g.schoolId === schoolId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found in this school tenant' });
    }
    res.json({ success: true, data: group });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create group (Staff / Teacher / Administrator)
communityRouter.post('/groups', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      name,
      description,
      type,
      visibility = 'SCHOOL_DISCOVERABLE',
      ownerId,
      ownerName,
      ownerRole,
      classGrade,
      stream,
      subjectCode,
      allowStudentPosts = true,
      requirePostModeration = false,
      allowMediaUploads = true,
      requireApproval = true,
      autoJoinEligible = false,
      canStudentLeave = true,
      maxMembers,
      rules = [],
      tags = [],
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Group name and type are required' });
    }

    const newGroup = {
      id: `grp-${uuidv4().substring(0, 8)}`,
      schoolId,
      name,
      description: description || '',
      type,
      visibility,
      status: 'ACTIVE',
      ownerId: ownerId || 'usr-admin-1',
      ownerName: ownerName || 'Administrator',
      ownerRole: ownerRole || 'Administrator',
      classGrade: classGrade || undefined,
      stream: stream || undefined,
      subjectCode: subjectCode || undefined,
      memberCount: 1,
      messageCount: 0,
      allowStudentPosts,
      requirePostModeration,
      allowMediaUploads,
      requireApproval: autoJoinEligible ? false : requireApproval,
      autoJoinEligible,
      canStudentLeave,
      maxMembers: maxMembers || undefined,
      rules,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newMembership = {
      id: `mem-${uuidv4().substring(0, 8)}`,
      schoolId,
      groupId: newGroup.id,
      userId: newGroup.ownerId,
      userName: newGroup.ownerName,
      userRole: newGroup.ownerRole,
      groupRole: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      unreadCount: 0,
    };

    await mutateServerDB((db) => {
      if (!db.communityGroups) db.communityGroups = [];
      if (!db.groupMemberships) db.groupMemberships = [];
      if (!db.auditLogs) db.auditLogs = [];

      db.communityGroups.push(newGroup);
      db.groupMemberships.push(newMembership);

      db.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: newGroup.ownerId,
        username: newGroup.ownerName,
        userRole: newGroup.ownerRole,
        action: 'COMMUNITY_GROUP_CREATE',
        details: `Created new ${type} group: "${name}" (${newGroup.id}) with visibility ${visibility}`,
      });
    });

    res.status(201).json({ success: true, data: newGroup });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update group
communityRouter.put('/groups/:id', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    let updatedGroup: any = null;

    await mutateServerDB((db) => {
      if (!db.communityGroups) db.communityGroups = [];
      if (!db.auditLogs) db.auditLogs = [];

      const idx = db.communityGroups.findIndex((g: any) => g.id === req.params.id && g.schoolId === schoolId);
      if (idx !== -1) {
        db.communityGroups[idx] = {
          ...db.communityGroups[idx],
          ...req.body,
          updatedAt: new Date().toISOString(),
        };
        updatedGroup = db.communityGroups[idx];

        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: req.body.updatedByUserId || 'usr-admin',
          username: req.body.updatedByUserName || 'Staff',
          userRole: 'Staff',
          action: 'COMMUNITY_GROUP_UPDATE',
          details: `Updated settings for group "${updatedGroup.name}" (${updatedGroup.id})`,
        });
      }
    });

    if (!updatedGroup) {
      return res.status(404).json({ success: false, error: 'Group not found in this school tenant' });
    }
    res.json({ success: true, data: updatedGroup });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 2. JOIN REQUESTS & APPROVAL WORKFLOW
// ----------------------------------------------------

// Request to join a group (Student)
communityRouter.post('/groups/:id/join-request', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId, studentName, studentEmail, studentGrade, studentStream, reason } = req.body;

    if (!studentId || !studentName) {
      return res.status(400).json({ success: false, error: 'studentId and studentName are required' });
    }

    const db = await getServerDB();
    const group = (db.communityGroups || []).find((g: any) => g.id === req.params.id && g.schoolId === schoolId);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found in this school' });
    }

    // Cross-school tenant isolation: verify group belongs to school
    if (group.schoolId !== schoolId) {
      return res.status(403).json({ success: false, error: 'Cross-school access denied' });
    }

    // Check if already an active member
    const existingMembership = (db.groupMemberships || []).find(
      (m: any) => m.groupId === group.id && m.userId === studentId && m.schoolId === schoolId && m.status === 'ACTIVE'
    );
    if (existingMembership) {
      return res.status(400).json({ success: false, error: 'You are already an active member of this group' });
    }

    // Check if already banned
    const bannedMembership = (db.groupMemberships || []).find(
      (m: any) => m.groupId === group.id && m.userId === studentId && m.schoolId === schoolId && m.status === 'BANNED'
    );
    if (bannedMembership) {
      return res.status(403).json({ success: false, error: 'Access to this group is restricted for your account' });
    }

    // Check if pending request already exists
    const existingPending = (db.groupMembershipRequests || []).find(
      (r: any) => r.groupId === group.id && r.studentId === studentId && r.schoolId === schoolId && r.status === 'PENDING'
    );
    if (existingPending) {
      return res.status(400).json({ success: false, error: 'You already have a pending join request for this group', request: existingPending });
    }

    // AUTO-APPROVAL: If group is auto-join eligible or does not require approval
    if (group.autoJoinEligible || group.requireApproval === false || group.visibility === 'AUTO_ASSIGNED') {
      let createdMem: any = null;
      await mutateServerDB((dbState) => {
        if (!dbState.groupMemberships) dbState.groupMemberships = [];
        if (!dbState.groupNotifications) dbState.groupNotifications = [];
        if (!dbState.auditLogs) dbState.auditLogs = [];

        createdMem = {
          id: `mem-${uuidv4().substring(0, 8)}`,
          schoolId,
          groupId: group.id,
          userId: studentId,
          userName: studentName,
          userRole: 'Student',
          groupRole: 'STUDENT',
          status: 'ACTIVE',
          joinedAt: new Date().toISOString(),
          unreadCount: 0,
        };
        dbState.groupMemberships.push(createdMem);

        const grp = dbState.communityGroups.find((g: any) => g.id === group.id);
        if (grp) grp.memberCount = (grp.memberCount || 0) + 1;

        // Create welcome notification
        dbState.groupNotifications.unshift({
          id: `notif-${uuidv4().substring(0, 8)}`,
          schoolId,
          userId: studentId,
          groupId: group.id,
          groupName: group.name,
          type: 'JOIN_REQUEST_APPROVED',
          title: `Joined ${group.name}`,
          message: `You have successfully joined ${group.name}. Welcome to the group!`,
          read: false,
          createdAt: new Date().toISOString(),
        });

        // Audit Log
        dbState.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: studentId,
          username: studentName,
          userRole: 'Student',
          action: 'COMMUNITY_GROUP_JOIN',
          details: `Student ${studentName} auto-joined group "${group.name}" (${group.id})`,
        });
      });

      return res.json({
        success: true,
        autoApproved: true,
        message: `Welcome! You have been automatically added to ${group.name}`,
        data: createdMem,
      });
    }

    // REGULAR REQUEST CREATION
    const newRequest = {
      id: `req-${uuidv4().substring(0, 8)}`,
      requestId: `req-${uuidv4().substring(0, 8)}`,
      schoolId,
      groupId: group.id,
      groupName: group.name,
      groupType: group.type,
      studentId,
      studentName,
      studentEmail: studentEmail || undefined,
      studentGrade: studentGrade || undefined,
      studentStream: studentStream || undefined,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
      reason: reason || 'Student requested to join the group via discovery.',
    };

    await mutateServerDB((dbState) => {
      if (!dbState.groupMembershipRequests) dbState.groupMembershipRequests = [];
      if (!dbState.groupNotifications) dbState.groupNotifications = [];
      if (!dbState.auditLogs) dbState.auditLogs = [];

      dbState.groupMembershipRequests.push(newRequest);

      // Notify group owner / teachers
      dbState.groupNotifications.unshift({
        id: `notif-${uuidv4().substring(0, 8)}`,
        schoolId,
        userId: group.ownerId,
        groupId: group.id,
        groupName: group.name,
        type: 'NEW_MESSAGE',
        title: 'New Group Join Request',
        message: `${studentName} (${studentGrade || 'Student'}) requested to join "${group.name}".`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Audit Log
      dbState.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: studentId,
        username: studentName,
        userRole: 'Student',
        action: 'COMMUNITY_REQUEST_CREATE',
        details: `Student ${studentName} requested to join group "${group.name}" (${group.id})`,
      });
    });

    res.status(201).json({
      success: true,
      autoApproved: false,
      message: `Your request to join ${group.name} has been submitted for teacher approval.`,
      data: newRequest,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List membership requests (my submitted requests OR admin pending requests)
communityRouter.get('/requests', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await ensureDefaultGroups(schoolId);
    const { userId, type = 'my', groupId } = req.query;

    const db = await getServerDB();
    let requests = (db.groupMembershipRequests || []).filter((r: any) => r.schoolId === schoolId);

    if (type === 'my' && userId) {
      requests = requests.filter((r: any) => r.studentId === userId);
    } else if (type === 'admin' || type === 'review') {
      // Return pending requests for groups managed by this teacher/admin
      if (groupId) {
        requests = requests.filter((r: any) => r.groupId === groupId);
      } else if (userId) {
        const managedGroupIds = new Set(
          (db.communityGroups || [])
            .filter((g: any) => g.schoolId === schoolId && (g.ownerId === userId || (db.groupMemberships || []).some((m: any) => m.groupId === g.id && m.userId === userId && ['OWNER', 'ADMIN', 'TEACHER'].includes(m.groupRole))))
            .map((g: any) => g.id)
        );
        requests = requests.filter((r: any) => managedGroupIds.has(r.groupId) || r.status === 'PENDING');
      }
    }

    requests.sort((a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    res.json({ success: true, data: requests, total: requests.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Review membership request (Approve or Reject by Teacher / Group Admin)
communityRouter.post('/requests/:id/review', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { action, reviewerId = 'usr-teacher-1', reviewerName = 'Teacher Reviewer', reviewerRole = 'Teacher', reviewNotes } = req.body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, error: 'action must be APPROVE or REJECT' });
    }

    let updatedReq: any = null;
    let createdMem: any = null;

    await mutateServerDB((db) => {
      if (!db.groupMembershipRequests) db.groupMembershipRequests = [];
      if (!db.groupMemberships) db.groupMemberships = [];
      if (!db.groupNotifications) db.groupNotifications = [];
      if (!db.auditLogs) db.auditLogs = [];

      const reqIndex = db.groupMembershipRequests.findIndex(
        (r: any) => r.id === req.params.id && r.schoolId === schoolId
      );

      if (reqIndex === -1) {
        throw new Error('Membership request not found in this school');
      }

      const request = db.groupMembershipRequests[reqIndex];
      if (request.status !== 'PENDING') {
        throw new Error(`Request has already been ${request.status.toLowerCase()}`);
      }

      const now = new Date().toISOString();
      const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

      request.status = newStatus;
      request.reviewedBy = reviewerId;
      request.reviewedByName = reviewerName;
      request.reviewedAt = now;
      request.reviewNotes = reviewNotes || undefined;
      updatedReq = request;

      const group = (db.communityGroups || []).find((g: any) => g.id === request.groupId && g.schoolId === schoolId);
      const groupTitle = group?.name || request.groupName || 'Community Group';

      if (action === 'APPROVE') {
        // Add to active group memberships if not already present
        const existing = db.groupMemberships.find(
          (m: any) => m.groupId === request.groupId && m.userId === request.studentId && m.schoolId === schoolId
        );
        if (existing) {
          existing.status = 'ACTIVE';
          createdMem = existing;
        } else {
          createdMem = {
            id: `mem-${uuidv4().substring(0, 8)}`,
            schoolId,
            groupId: request.groupId,
            userId: request.studentId,
            userName: request.studentName,
            userRole: 'Student',
            groupRole: 'STUDENT',
            status: 'ACTIVE',
            joinedAt: now,
            unreadCount: 0,
          };
          db.groupMemberships.push(createdMem);
          if (group) {
            group.memberCount = (group.memberCount || 0) + 1;
          }
        }

        // Notify student of approval
        db.groupNotifications.unshift({
          id: `notif-${uuidv4().substring(0, 8)}`,
          schoolId,
          userId: request.studentId,
          groupId: request.groupId,
          groupName: groupTitle,
          type: 'JOIN_REQUEST_APPROVED',
          title: 'Join Request Approved! 🎉',
          message: `${reviewerName} approved your request to join "${groupTitle}".`,
          read: false,
          createdAt: now,
        });

        // Audit Log
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: reviewerId,
          username: reviewerName,
          userRole: reviewerRole,
          action: 'COMMUNITY_REQUEST_APPROVE',
          details: `Approved join request for ${request.studentName} to join group "${groupTitle}" (${request.groupId})`,
        });
      } else {
        // Notify student of rejection
        db.groupNotifications.unshift({
          id: `notif-${uuidv4().substring(0, 8)}`,
          schoolId,
          userId: request.studentId,
          groupId: request.groupId,
          groupName: groupTitle,
          type: 'JOIN_REQUEST_REJECTED',
          title: 'Join Request Update',
          message: `Your request to join "${groupTitle}" was not approved${reviewNotes ? ': ' + reviewNotes : '.'}`,
          read: false,
          createdAt: now,
        });

        // Audit Log
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: reviewerId,
          username: reviewerName,
          userRole: reviewerRole,
          action: 'COMMUNITY_REQUEST_REJECT',
          details: `Rejected join request for ${request.studentName} in group "${groupTitle}" (${request.groupId}). Notes: ${reviewNotes || 'None'}`,
        });
      }
    });

    res.json({
      success: true,
      message: action === 'APPROVE' ? 'Join request approved successfully' : 'Join request rejected',
      data: { request: updatedReq, membership: createdMem },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Cancel a pending request by the student
communityRouter.post('/requests/:id/cancel', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { userId } = req.body;

    let cancelledReq: any = null;
    await mutateServerDB((db) => {
      if (!db.groupMembershipRequests) return;
      const reqIdx = db.groupMembershipRequests.findIndex(
        (r: any) => r.id === req.params.id && r.schoolId === schoolId
      );
      if (reqIdx !== -1) {
        const r = db.groupMembershipRequests[reqIdx];
        if (userId && r.studentId !== userId) {
          throw new Error('You are not authorized to cancel this request');
        }
        r.status = 'CANCELLED';
        cancelledReq = r;

        if (db.auditLogs) {
          db.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: userId || r.studentId,
            username: r.studentName,
            userRole: 'Student',
            action: 'COMMUNITY_REQUEST_CANCEL',
            details: `Cancelled join request for group "${r.groupName}" (${r.groupId})`,
          });
        }
      }
    });

    if (!cancelledReq) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, message: 'Request cancelled successfully', data: cancelledReq });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 3. INVITATIONS WORKFLOW
// ----------------------------------------------------

// List invitations (received by user or sent by group)
communityRouter.get('/invitations', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await ensureDefaultGroups(schoolId);
    const { userId, groupId } = req.query;

    const db = await getServerDB();
    let invitations = (db.groupInvitations || []).filter((inv: any) => inv.schoolId === schoolId);

    if (userId) {
      invitations = invitations.filter((inv: any) => inv.invitedUserId === userId);
    }
    if (groupId) {
      invitations = invitations.filter((inv: any) => inv.groupId === groupId);
    }

    // Mark expired invitations
    const nowTime = Date.now();
    invitations.forEach((inv: any) => {
      if (inv.status === 'PENDING' && inv.expiresAt && new Date(inv.expiresAt).getTime() < nowTime) {
        inv.status = 'EXPIRED';
      }
    });

    invitations.sort((a: any, b: any) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());

    res.json({ success: true, data: invitations, total: invitations.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send an invitation to a student / user (Teacher / Group Admin)
communityRouter.post('/groups/:id/invite', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      invitedUserId,
      invitedUserName,
      invitedUserRole = 'Student',
      invitedByUserId = 'usr-teacher-1',
      invitedByUserName = 'Teacher',
      invitedByUserRole = 'Teacher',
      expiresDays = 7,
    } = req.body;

    if (!invitedUserId || !invitedUserName) {
      return res.status(400).json({ success: false, error: 'invitedUserId and invitedUserName are required' });
    }

    const db = await getServerDB();
    const group = (db.communityGroups || []).find((g: any) => g.id === req.params.id && g.schoolId === schoolId);
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Check if user is already a member
    const existingMembership = (db.groupMemberships || []).find(
      (m: any) => m.groupId === group.id && m.userId === invitedUserId && m.schoolId === schoolId && m.status === 'ACTIVE'
    );
    if (existingMembership) {
      return res.status(400).json({ success: false, error: `${invitedUserName} is already an active member of this group` });
    }

    // Check for duplicate pending invitation
    const existingInv = (db.groupInvitations || []).find(
      (inv: any) => inv.groupId === group.id && inv.invitedUserId === invitedUserId && inv.status === 'PENDING'
    );
    if (existingInv) {
      return res.status(400).json({ success: false, error: `An invitation has already been sent to ${invitedUserName}` });
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + expiresDays * 86400000).toISOString();

    const newInvitation = {
      id: `inv-${uuidv4().substring(0, 8)}`,
      schoolId,
      groupId: group.id,
      groupName: group.name,
      groupType: group.type,
      groupDescription: group.description,
      invitedUserId,
      invitedUserName,
      invitedUserRole,
      invitedByUserId,
      invitedByUserName,
      invitedByUserRole,
      status: 'PENDING',
      invitedAt: now,
      expiresAt,
    };

    await mutateServerDB((dbState) => {
      if (!dbState.groupInvitations) dbState.groupInvitations = [];
      if (!dbState.groupNotifications) dbState.groupNotifications = [];
      if (!dbState.auditLogs) dbState.auditLogs = [];

      dbState.groupInvitations.push(newInvitation);

      // Create notification for invited student
      dbState.groupNotifications.unshift({
        id: `notif-${uuidv4().substring(0, 8)}`,
        schoolId,
        userId: invitedUserId,
        groupId: group.id,
        groupName: group.name,
        type: 'INVITED_TO_GROUP',
        title: 'New Group Invitation',
        message: `${invitedByUserName} invited you to join "${group.name}".`,
        read: false,
        createdAt: now,
      });

      // Audit Log
      dbState.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: now,
        userId: invitedByUserId,
        username: invitedByUserName,
        userRole: invitedByUserRole,
        action: 'COMMUNITY_INVITE_CREATE',
        details: `Invited ${invitedUserName} (${invitedUserId}) to group "${group.name}" (${group.id})`,
      });
    });

    res.status(201).json({ success: true, message: `Invitation sent to ${invitedUserName}`, data: newInvitation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Respond to an invitation (Accept or Decline by Student)
communityRouter.post('/invitations/:id/respond', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { action, userId } = req.body;

    if (!action || !['ACCEPT', 'DECLINE'].includes(action)) {
      return res.status(400).json({ success: false, error: 'action must be ACCEPT or DECLINE' });
    }

    let updatedInv: any = null;
    let newMembership: any = null;

    await mutateServerDB((db) => {
      if (!db.groupInvitations) db.groupInvitations = [];
      if (!db.groupMemberships) db.groupMemberships = [];
      if (!db.groupNotifications) db.groupNotifications = [];
      if (!db.auditLogs) db.auditLogs = [];

      const invIndex = db.groupInvitations.findIndex(
        (i: any) => i.id === req.params.id && i.schoolId === schoolId
      );

      if (invIndex === -1) {
        throw new Error('Invitation not found');
      }

      const inv = db.groupInvitations[invIndex];
      if (userId && inv.invitedUserId !== userId) {
        throw new Error('You are not authorized to respond to this invitation');
      }

      const now = new Date().toISOString();
      inv.status = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
      inv.respondedAt = now;
      updatedInv = inv;

      const group = (db.communityGroups || []).find((g: any) => g.id === inv.groupId && g.schoolId === schoolId);

      if (action === 'ACCEPT') {
        const existing = db.groupMemberships.find(
          (m: any) => m.groupId === inv.groupId && m.userId === inv.invitedUserId && m.schoolId === schoolId
        );
        if (existing) {
          existing.status = 'ACTIVE';
          newMembership = existing;
        } else {
          newMembership = {
            id: `mem-${uuidv4().substring(0, 8)}`,
            schoolId,
            groupId: inv.groupId,
            userId: inv.invitedUserId,
            userName: inv.invitedUserName,
            userRole: inv.invitedUserRole || 'Student',
            groupRole: inv.invitedUserRole === 'Teacher' ? 'TEACHER' : 'STUDENT',
            status: 'ACTIVE',
            joinedAt: now,
            unreadCount: 0,
          };
          db.groupMemberships.push(newMembership);
          if (group) group.memberCount = (group.memberCount || 0) + 1;
        }

        // Notify inviter
        db.groupNotifications.unshift({
          id: `notif-${uuidv4().substring(0, 8)}`,
          schoolId,
          userId: inv.invitedByUserId,
          groupId: inv.groupId,
          groupName: inv.groupName,
          type: 'NEW_MESSAGE',
          title: 'Invitation Accepted',
          message: `${inv.invitedUserName} accepted your invitation to "${inv.groupName}".`,
          read: false,
          createdAt: now,
        });

        // Audit Log
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: inv.invitedUserId,
          username: inv.invitedUserName,
          userRole: inv.invitedUserRole,
          action: 'COMMUNITY_INVITE_ACCEPT',
          details: `Accepted invitation to group "${inv.groupName}" (${inv.groupId})`,
        });
      } else {
        // Audit Log
        db.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: inv.invitedUserId,
          username: inv.invitedUserName,
          userRole: inv.invitedUserRole,
          action: 'COMMUNITY_INVITE_DECLINE',
          details: `Declined invitation to group "${inv.groupName}" (${inv.groupId})`,
        });
      }
    });

    res.json({
      success: true,
      message: action === 'ACCEPT' ? 'Invitation accepted! You are now a member.' : 'Invitation declined',
      data: { invitation: updatedInv, membership: newMembership },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 4. AUTOMATIC ACADEMIC GROUP MEMBERSHIP & SYNC
// ----------------------------------------------------

communityRouter.post('/groups/auto-enroll', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { userId, userName, userRole = 'Student', classGrade, stream, subjects = [] } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ success: false, error: 'userId and userName are required' });
    }

    const db = await getServerDB();
    const enrolledGroups: string[] = [];

    await mutateServerDB((dbState) => {
      if (!dbState.communityGroups) dbState.communityGroups = [];
      if (!dbState.groupMemberships) dbState.groupMemberships = [];
      if (!dbState.auditLogs) dbState.auditLogs = [];

      // 1. Check School-Wide Group
      const schoolWide = dbState.communityGroups.find(
        (g: any) => g.schoolId === schoolId && (g.type === 'SCHOOL' || g.id === 'grp-school-wide')
      );
      if (schoolWide) {
        const hasMem = dbState.groupMemberships.some(
          (m: any) => m.groupId === schoolWide.id && m.userId === userId && m.schoolId === schoolId
        );
        if (!hasMem) {
          dbState.groupMemberships.push({
            id: `mem-${uuidv4().substring(0, 8)}`,
            schoolId,
            groupId: schoolWide.id,
            userId,
            userName,
            userRole,
            groupRole: 'STUDENT',
            status: 'ACTIVE',
            joinedAt: new Date().toISOString(),
            unreadCount: 0,
          });
          schoolWide.memberCount = (schoolWide.memberCount || 0) + 1;
          enrolledGroups.push(schoolWide.name);
        }
      }

      // 2. Check Class Group (e.g. "Senior 4")
      if (classGrade) {
        const classGroups = dbState.communityGroups.filter(
          (g: any) => g.schoolId === schoolId && g.type === 'CLASS' && g.classGrade?.toLowerCase() === classGrade.toLowerCase()
        );
        for (const cg of classGroups) {
          const hasMem = dbState.groupMemberships.some(
            (m: any) => m.groupId === cg.id && m.userId === userId && m.schoolId === schoolId
          );
          if (!hasMem) {
            dbState.groupMemberships.push({
              id: `mem-${uuidv4().substring(0, 8)}`,
              schoolId,
              groupId: cg.id,
              userId,
              userName,
              userRole,
              groupRole: 'STUDENT',
              status: 'ACTIVE',
              joinedAt: new Date().toISOString(),
              unreadCount: 0,
            });
            cg.memberCount = (cg.memberCount || 0) + 1;
            enrolledGroups.push(cg.name);
          }
        }
      }

      // 3. Check Subject Groups
      const subjectList = Array.isArray(subjects) ? subjects : [];
      if (subjectList.length > 0 || classGrade) {
        const subjectGroups = dbState.communityGroups.filter(
          (g: any) => g.schoolId === schoolId && g.type === 'SUBJECT' && (
            (classGrade && g.classGrade?.toLowerCase() === classGrade.toLowerCase()) ||
            subjectList.some((s: string) => g.name.toLowerCase().includes(s.toLowerCase()) || g.subjectCode?.toLowerCase() === s.toLowerCase())
          )
        );
        for (const sg of subjectGroups) {
          const hasMem = dbState.groupMemberships.some(
            (m: any) => m.groupId === sg.id && m.userId === userId && m.schoolId === schoolId
          );
          if (!hasMem) {
            dbState.groupMemberships.push({
              id: `mem-${uuidv4().substring(0, 8)}`,
              schoolId,
              groupId: sg.id,
              userId,
              userName,
              userRole,
              groupRole: 'STUDENT',
              status: 'ACTIVE',
              joinedAt: new Date().toISOString(),
              unreadCount: 0,
            });
            sg.memberCount = (sg.memberCount || 0) + 1;
            enrolledGroups.push(sg.name);
          }
        }
      }

      if (enrolledGroups.length > 0) {
        dbState.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId,
          username: userName,
          userRole,
          action: 'COMMUNITY_AUTO_ENROLL',
          details: `Auto-enrolled student ${userName} into academic groups: ${enrolledGroups.join(', ')}`,
        });
      }
    });

    res.json({
      success: true,
      message: `Enrolled in ${enrolledGroups.length} academic groups`,
      enrolledGroups,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leave Group
communityRouter.post('/groups/:id/leave', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { userId, userRole = 'Student' } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const db = await getServerDB();
    const group = (db.communityGroups || []).find((g: any) => g.id === req.params.id && g.schoolId === schoolId);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Enforce non-leaving of mandatory academic groups for students
    if (userRole === 'Student' && (group.canStudentLeave === false || group.type === 'CLASS' || group.visibility === 'AUTO_ASSIGNED')) {
      return res.status(403).json({
        success: false,
        error: 'Mandatory academic group. Membership is managed by school curriculum records and cannot be left manually.',
      });
    }

    await mutateServerDB((dbState) => {
      if (!dbState.groupMemberships) return;
      const idx = dbState.groupMemberships.findIndex(
        (m: any) => m.groupId === req.params.id && m.userId === userId && m.schoolId === schoolId
      );
      if (idx !== -1) {
        const mem = dbState.groupMemberships[idx];
        dbState.groupMemberships.splice(idx, 1);

        const grp = (dbState.communityGroups || []).find((g: any) => g.id === req.params.id);
        if (grp && grp.memberCount > 0) {
          grp.memberCount -= 1;
        }

        if (dbState.auditLogs) {
          dbState.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId,
            username: mem.userName || 'Member',
            userRole,
            action: 'COMMUNITY_GROUP_LEAVE',
            details: `Left group "${group.name}" (${group.id})`,
          });
        }
      }
    });

    res.json({ success: true, message: `Successfully left ${group.name}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List Members for a Group
communityRouter.get('/groups/:id/members', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const db = await getServerDB();
    const members = (db.groupMemberships || []).filter(
      (m: any) => m.groupId === req.params.id && m.schoolId === schoolId
    );
    res.json({ success: true, data: members, total: members.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 5. NOTIFICATIONS
// ----------------------------------------------------

communityRouter.get('/notifications', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { userId } = req.query;

    const db = await getServerDB();
    let notifs = (db.groupNotifications || []).filter((n: any) => n.schoolId === schoolId);

    if (userId) {
      notifs = notifs.filter((n: any) => n.userId === userId);
    }

    notifs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: notifs, total: notifs.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

communityRouter.post('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await mutateServerDB((db) => {
      if (!db.groupNotifications) return;
      const notif = db.groupNotifications.find((n: any) => n.id === req.params.id && n.schoolId === schoolId);
      if (notif) notif.read = true;
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

communityRouter.post('/notifications/read-all', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { userId } = req.body;
    await mutateServerDB((db) => {
      if (!db.groupNotifications) return;
      db.groupNotifications.forEach((n: any) => {
        if (n.schoolId === schoolId && (!userId || n.userId === userId)) {
          n.read = true;
        }
      });
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 6. MESSAGES & REAL-TIME THREADING
// ----------------------------------------------------

// List Messages for a Group
communityRouter.get('/groups/:id/messages', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const db = await getServerDB();
    const { limit = 100, isModerator = 'false' } = req.query;

    let messages = (db.communityMessages || []).filter(
      (m: any) => m.groupId === req.params.id && m.schoolId === schoolId
    );

    // If not a moderator, filter out deleted and hidden messages
    if (isModerator !== 'true') {
      messages = messages.filter((m: any) => m.status !== 'DELETED' && m.status !== 'HIDDEN');
    }

    // Sort chronologically ascending for chat view
    messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (messages.length > Number(limit)) {
      messages = messages.slice(-Number(limit));
    }

    res.json({ success: true, data: messages, total: messages.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Post Message
communityRouter.post('/groups/:id/messages', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      senderId,
      senderName,
      senderRole,
      senderAvatar,
      content,
      messageType = 'TEXT',
      attachments = [],
      replyToMessageId,
      mentions = [],
      clientMessageId,
    } = req.body;

    if (!senderId || (!content && attachments.length === 0)) {
      return res.status(400).json({ success: false, error: 'senderId and message content/attachment are required' });
    }

    const db = await getServerDB();
    const group = (db.communityGroups || []).find((g: any) => g.id === req.params.id && g.schoolId === schoolId);

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    // Check student posting permissions
    if (senderRole === 'Student' && group.allowStudentPosts === false) {
      return res.status(403).json({ success: false, error: 'Only teachers and administrators can broadcast in this channel' });
    }

    // Safeguarding safety keyword scan
    const safetyCheck = checkContentSafety(content || '');
    let initialStatus: any = 'ACTIVE';

    if (safetyCheck.isFlagged) {
      initialStatus = 'FLAGGED';
    } else if (group.requirePostModeration && senderRole === 'Student') {
      initialStatus = 'UNDER_REVIEW';
    }

    let replyToPreview = undefined;
    if (replyToMessageId) {
      const origMsg = (db.communityMessages || []).find((m: any) => m.id === replyToMessageId);
      if (origMsg) {
        replyToPreview = {
          id: origMsg.id,
          senderName: origMsg.senderName,
          content: origMsg.content ? origMsg.content.substring(0, 80) : 'Attachment',
        };
      }
    }

    const newMessage = {
      id: `msg-${uuidv4().substring(0, 10)}`,
      clientMessageId: clientMessageId || `cmsg-${Date.now()}`,
      schoolId,
      groupId: req.params.id,
      senderId,
      senderName: senderName || 'User',
      senderRole: senderRole || 'Student',
      senderAvatar: senderAvatar || undefined,
      content: content || '',
      messageType,
      status: initialStatus,
      attachments,
      replyToMessageId: replyToMessageId || undefined,
      replyToPreview,
      reactions: [],
      mentions,
      isPinned: false,
      isEdited: false,
      flaggedCount: safetyCheck.isFlagged ? 1 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mutateServerDB((dbState) => {
      if (!dbState.communityMessages) dbState.communityMessages = [];
      if (!dbState.communityReports) dbState.communityReports = [];
      if (!dbState.groupNotifications) dbState.groupNotifications = [];

      dbState.communityMessages.push(newMessage);

      const grp = dbState.communityGroups.find((g: any) => g.id === req.params.id);
      if (grp) {
        grp.messageCount = (grp.messageCount || 0) + 1;
      }

      // If flagged, automatically create a moderation report
      if (safetyCheck.isFlagged) {
        dbState.communityReports.push({
          id: `rep-${uuidv4().substring(0, 8)}`,
          schoolId,
          targetType: 'MESSAGE',
          targetId: newMessage.id,
          groupId: group.id,
          groupName: group.name,
          reportedByUserId: 'system-ai-safeguard',
          reportedByUserName: 'Automated Safeguarding Engine',
          reportedUserRole: 'System',
          reasonCategory: 'HARASSMENT',
          description: `Automated safety trigger: message contained flagged expression "${safetyCheck.matchedKeyword}"`,
          evidenceText: content,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        });
      }
    });

    res.status(201).json({
      success: true,
      data: newMessage,
      isFlagged: safetyCheck.isFlagged,
      message: safetyCheck.isFlagged ? 'Message flagged by automated safeguarding monitor for teacher review' : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// React to Message (Toggle Emoji)
communityRouter.post('/messages/:id/react', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { emoji, userId } = req.body;

    if (!emoji || !userId) {
      return res.status(400).json({ success: false, error: 'emoji and userId are required' });
    }

    let updatedMsg: any = null;

    await mutateServerDB((db) => {
      if (!db.communityMessages) return;
      const msg = db.communityMessages.find((m: any) => m.id === req.params.id && m.schoolId === schoolId);
      if (!msg) throw new Error('Message not found');

      if (!msg.reactions) msg.reactions = [];

      const existingReactionIndex = msg.reactions.findIndex((r: any) => r.emoji === emoji);
      if (existingReactionIndex !== -1) {
        const r = msg.reactions[existingReactionIndex];
        const userIdx = r.userIds.indexOf(userId);
        if (userIdx !== -1) {
          // Toggle off
          r.userIds.splice(userIdx, 1);
          r.count -= 1;
          if (r.count <= 0) {
            msg.reactions.splice(existingReactionIndex, 1);
          }
        } else {
          // Add user
          r.userIds.push(userId);
          r.count += 1;
        }
      } else {
        // Create new reaction entry
        msg.reactions.push({
          emoji,
          count: 1,
          userIds: [userId],
        });
      }

      msg.updatedAt = new Date().toISOString();
      updatedMsg = msg;
    });

    res.json({ success: true, data: updatedMsg });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pin/Unpin Message
communityRouter.post('/messages/:id/pin', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { isPinned, pinnedBy } = req.body;

    let updatedMsg: any = null;
    await mutateServerDB((db) => {
      if (!db.communityMessages) return;
      const msg = db.communityMessages.find((m: any) => m.id === req.params.id && m.schoolId === schoolId);
      if (!msg) throw new Error('Message not found');

      msg.isPinned = isPinned ?? true;
      msg.pinnedBy = pinnedBy || undefined;
      msg.updatedAt = new Date().toISOString();
      updatedMsg = msg;
    });

    res.json({ success: true, data: updatedMsg });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 7. ANNOUNCEMENTS
// ----------------------------------------------------

communityRouter.get('/announcements', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await ensureDefaultGroups(schoolId);

    const db = await getServerDB();
    let anns = (db.communityAnnouncements || []).filter((a: any) => a.schoolId === schoolId);

    const { targetScope, targetId, priority } = req.query;
    if (targetScope && targetScope !== 'ALL') {
      anns = anns.filter((a: any) => a.targetScope === targetScope);
    }
    if (targetId) {
      anns = anns.filter((a: any) => a.targetId === targetId);
    }
    if (priority) {
      anns = anns.filter((a: any) => a.priority === priority);
    }

    anns.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: anns, total: anns.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

communityRouter.post('/announcements', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      title,
      content,
      priority = 'NORMAL',
      targetScope = 'SCHOOL_WIDE',
      targetId,
      targetName,
      authorId,
      authorName,
      authorRole = 'Staff',
      isPinned = false,
      attachments = [],
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const newAnnouncement = {
      id: `ann-${uuidv4().substring(0, 8)}`,
      schoolId,
      title,
      content,
      priority,
      targetScope,
      targetId: targetId || undefined,
      targetName: targetName || undefined,
      authorId: authorId || 'usr-admin-1',
      authorName: authorName || 'School Desk',
      authorRole,
      isPinned,
      attachments,
      createdAt: new Date().toISOString(),
    };

    await mutateServerDB((db) => {
      if (!db.communityAnnouncements) db.communityAnnouncements = [];
      db.communityAnnouncements.unshift(newAnnouncement);
    });

    res.status(201).json({ success: true, data: newAnnouncement });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 8. PROJECTS & STEM COLLABORATION
// ----------------------------------------------------

communityRouter.get('/projects', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    await ensureDefaultGroups(schoolId);

    const db = await getServerDB();
    let projects = (db.communityProjects || []).filter((p: any) => p.schoolId === schoolId);

    const { groupId, status } = req.query;
    if (groupId) {
      projects = projects.filter((p: any) => p.groupId === groupId);
    }
    if (status && status !== 'ALL') {
      projects = projects.filter((p: any) => p.status === status);
    }

    res.json({ success: true, data: projects, total: projects.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

communityRouter.post('/projects', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      groupId,
      title,
      description,
      subject,
      leadTeacherId,
      leadTeacherName,
      studentMemberIds = [],
      studentMemberNames = [],
      dueDate,
    } = req.body;

    if (!groupId || !title) {
      return res.status(400).json({ success: false, error: 'groupId and title are required' });
    }

    const newProject = {
      id: `prj-${uuidv4().substring(0, 8)}`,
      schoolId,
      groupId,
      title,
      description: description || '',
      subject: subject || 'STEM Innovation',
      leadTeacherId: leadTeacherId || 'usr-teacher-1',
      leadTeacherName: leadTeacherName || 'Teacher Advisor',
      studentMemberIds,
      studentMemberNames,
      dueDate: dueDate || undefined,
      status: 'IN_PROGRESS',
      tasks: [],
      deliverables: [],
      teacherFeedback: [],
      isMarketplacePublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mutateServerDB((db) => {
      if (!db.communityProjects) db.communityProjects = [];
      db.communityProjects.unshift(newProject);
    });

    res.status(201).json({ success: true, data: newProject });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Project Tasks & Deliverables
communityRouter.put('/projects/:id', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    let updatedPrj: any = null;

    await mutateServerDB((db) => {
      if (!db.communityProjects) return;
      const idx = db.communityProjects.findIndex((p: any) => p.id === req.params.id && p.schoolId === schoolId);
      if (idx !== -1) {
        db.communityProjects[idx] = {
          ...db.communityProjects[idx],
          ...req.body,
          updatedAt: new Date().toISOString(),
        };
        updatedPrj = db.communityProjects[idx];
      }
    });

    if (!updatedPrj) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: updatedPrj });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 9. SAFEGUARDING & ANTI-BULLYING ENGINE
// ----------------------------------------------------

communityRouter.get('/reports', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const db = await getServerDB();
    let reports = (db.communityReports || []).filter((r: any) => r.schoolId === schoolId);

    const { status } = req.query;
    if (status && status !== 'ALL') {
      reports = reports.filter((r: any) => r.status === status);
    }

    reports.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: reports, total: reports.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

communityRouter.post('/reports', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      targetType,
      targetId,
      groupId,
      groupName,
      reportedByUserId,
      reportedByUserName,
      reportedUserRole = 'Student',
      reasonCategory,
      description,
      evidenceText,
    } = req.body;

    if (!targetType || !targetId || !reasonCategory) {
      return res.status(400).json({ success: false, error: 'targetType, targetId and reasonCategory are required' });
    }

    const newReport = {
      id: `rep-${uuidv4().substring(0, 8)}`,
      schoolId,
      targetType,
      targetId,
      groupId: groupId || undefined,
      groupName: groupName || undefined,
      reportedByUserId: reportedByUserId || 'usr-anonymous',
      reportedByUserName: reportedByUserName || 'Anonymous Student',
      reportedUserRole,
      reasonCategory,
      description: description || '',
      evidenceText: evidenceText || undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await mutateServerDB((db) => {
      if (!db.communityReports) db.communityReports = [];
      db.communityReports.unshift(newReport);
    });

    res.status(201).json({ success: true, data: newReport, message: 'Report safely received by safeguarding team' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Take Moderation Action
communityRouter.post('/reports/:id/action', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const {
      actionType,
      moderatorId,
      moderatorName,
      notes,
      affectedUserId,
      affectedUserName,
    } = req.body;

    if (!actionType || !moderatorId) {
      return res.status(400).json({ success: false, error: 'actionType and moderatorId are required' });
    }

    let updatedReport: any = null;
    const now = new Date().toISOString();

    await mutateServerDB((db) => {
      if (!db.communityReports) db.communityReports = [];
      if (!db.communityModerationActions) db.communityModerationActions = [];
      if (!db.communityMessages) db.communityMessages = [];

      const rIndex = db.communityReports.findIndex((r: any) => r.id === req.params.id && r.schoolId === schoolId);
      if (rIndex === -1) throw new Error('Report not found');

      const report = db.communityReports[rIndex];
      report.status = 'RESOLVED';
      report.resolvedAt = now;
      report.resolvedBy = moderatorId;
      report.actionTaken = actionType;
      updatedReport = report;

      // If action relates to a message, apply change
      if (report.targetType === 'MESSAGE') {
        const msg = db.communityMessages.find((m: any) => m.id === report.targetId);
        if (msg) {
          if (actionType === 'HIDE_MESSAGE' || actionType === 'REMOVE_MESSAGE') {
            msg.status = 'HIDDEN';
          } else if (actionType === 'RESTORE_MESSAGE') {
            msg.status = 'ACTIVE';
          }
        }
      }

      // Log moderation action
      const modAction = {
        id: `mod-${uuidv4().substring(0, 8)}`,
        schoolId,
        reportId: report.id,
        targetType: report.targetType,
        targetId: report.targetId,
        actionType,
        moderatorId,
        moderatorName: moderatorName || 'Moderator',
        affectedUserId: affectedUserId || report.reportedByUserId,
        affectedUserName: affectedUserName || report.reportedByUserName,
        notes: notes || '',
        timestamp: now,
      };
      db.communityModerationActions.unshift(modAction);
    });

    res.json({ success: true, data: updatedReport });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

communityRouter.get('/moderation-logs', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const db = await getServerDB();
    const logs = (db.communityModerationActions || []).filter((l: any) => l.schoolId === schoolId);
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 10. SAFE MEDIA UPLOAD VALIDATOR
// ----------------------------------------------------

communityRouter.post('/media/upload', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { fileName, fileType, mimeType, base64Data, fileSize } = req.body;

    if (!fileName || !base64Data) {
      return res.status(400).json({ success: false, error: 'fileName and base64Data are required' });
    }

    const MAX_BYTES = 25 * 1024 * 1024;
    if (fileSize && fileSize > MAX_BYTES) {
      return res.status(400).json({ success: false, error: 'File size exceeds maximum 25MB limit' });
    }

    const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats'];
    const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => mimeType && mimeType.startsWith(prefix));
    if (!isAllowed) {
      return res.status(400).json({ success: false, error: 'Invalid file format for school community. Only safe media & documents allowed.' });
    }

    const attachmentId = `att-${uuidv4().substring(0, 8)}`;
    const url = base64Data.startsWith('data:') ? base64Data : `data:${mimeType || 'application/octet-stream'};base64,${base64Data}`;

    const attachmentMeta = {
      id: attachmentId,
      fileType: fileType || 'document',
      fileName,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/octet-stream',
      url,
      isSafeChecked: true,
    };

    res.status(201).json({ success: true, data: attachmentMeta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// 11. OFFLINE BATCH SYNC ENDPOINT
// ----------------------------------------------------

communityRouter.post('/sync', async (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    const { pendingMessages = [], pendingRequests = [] } = req.body;
    const results: any[] = [];

    await mutateServerDB((db) => {
      if (!db.communityMessages) db.communityMessages = [];
      if (!db.communityGroups) db.communityGroups = [];
      if (!db.groupMembershipRequests) db.groupMembershipRequests = [];

      // Sync pending messages
      for (const item of pendingMessages) {
        if (!item.senderId || (!item.content && (!item.attachments || item.attachments.length === 0))) {
          continue;
        }

        if (item.clientMessageId) {
          const existing = db.communityMessages.find(
            (m: any) => m.clientMessageId === item.clientMessageId && m.schoolId === schoolId
          );
          if (existing) {
            results.push({ clientMessageId: item.clientMessageId, serverId: existing.id, status: 'already_synced' });
            continue;
          }
        }

        const safetyCheck = checkContentSafety(item.content || '');
        const messageStatus = safetyCheck.isFlagged ? 'FLAGGED' : 'ACTIVE';
        const now = item.createdAt || new Date().toISOString();

        const serverMessage = {
          id: item.id || `msg-${uuidv4().substring(0, 10)}`,
          clientMessageId: item.clientMessageId,
          schoolId,
          groupId: item.groupId,
          senderId: item.senderId,
          senderName: item.senderName || 'User',
          senderRole: item.senderRole || 'Student',
          senderAvatar: item.senderAvatar,
          content: item.content || '',
          messageType: item.messageType || 'TEXT',
          status: messageStatus,
          attachments: item.attachments || [],
          replyToMessageId: item.replyToMessageId,
          replyToPreview: item.replyToPreview,
          reactions: item.reactions || [],
          mentions: item.mentions || [],
          isPinned: false,
          isEdited: false,
          createdAt: now,
          updatedAt: now,
        };

        db.communityMessages.push(serverMessage);
        results.push({ clientMessageId: item.clientMessageId, serverId: serverMessage.id, status: 'created' });

        const group = db.communityGroups.find((g: any) => g.id === item.groupId && g.schoolId === schoolId);
        if (group) {
          group.messageCount = (group.messageCount || 0) + 1;
        }
      }

      // Sync offline join requests
      for (const reqItem of pendingRequests) {
        if (!reqItem.groupId || !reqItem.studentId) continue;
        const existing = db.groupMembershipRequests.find(
          (r: any) => r.groupId === reqItem.groupId && r.studentId === reqItem.studentId && r.schoolId === schoolId
        );
        if (!existing) {
          db.groupMembershipRequests.push({
            id: reqItem.id || `req-${uuidv4().substring(0, 8)}`,
            requestId: reqItem.requestId || reqItem.id,
            schoolId,
            groupId: reqItem.groupId,
            groupName: reqItem.groupName,
            groupType: reqItem.groupType,
            studentId: reqItem.studentId,
            studentName: reqItem.studentName,
            studentEmail: reqItem.studentEmail,
            studentGrade: reqItem.studentGrade,
            studentStream: reqItem.studentStream,
            requestedAt: reqItem.requestedAt || new Date().toISOString(),
            status: 'PENDING',
            reason: reqItem.reason || 'Offline queued request',
          });
        }
      }
    });

    res.json({ success: true, syncedCount: results.length, details: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
