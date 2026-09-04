import type {
  StudentVoiceItem,
  StudentPortfolio,
  InnovationProject,
  SchoolClub,
  MarketplaceItem,
  MarketplaceOrder,
  PublicWebsiteConfig,
  NewsArticle,
  GalleryAlbum,
  AlumniProfile,
  Partnership,
  CommunityActivity,
  DonationCampaign,
  BrandSettings,
  RecognitionAward,
  PublicAnalyticsData,
} from '../types';

class V9PublicEngagementApi {
  private voiceItems: StudentVoiceItem[] = [
    {
      id: 'sv-1',
      studentId: 'std-101',
      studentName: 'Amina Kwame',
      grade: 'Form 4 Science',
      title: 'Solar-Powered Classroom Lighting Initiative',
      category: 'Proposal',
      content: 'I propose installing solar micro-panels on block B roof to power late evening study lamps for boarding students during power cuts.',
      status: 'Published',
      teacherFeedback: 'Outstanding proposal. Approved by Senior Management for implementation.',
      badgeEarned: 'Green Innovator',
      createdAt: '2026-07-20',
      likesCount: 34,
      commentsCount: 8,
    },
    {
      id: 'sv-2',
      studentId: 'std-102',
      studentName: 'David Ochieng',
      grade: 'Form 3 Arts',
      title: 'Echoes of the Great Rift – Poem & Photography',
      category: 'Creative Writing',
      content: 'A photo essay capturing dawn across the valley near our school grounds, accompanied by a 3-stanza poem on heritage and stewardship.',
      status: 'Published',
      teacherFeedback: 'Beautiful imagery. Published to the school public magazine.',
      badgeEarned: 'Master Wordsmith',
      createdAt: '2026-07-22',
      likesCount: 42,
      commentsCount: 12,
    },
    {
      id: 'sv-3',
      studentId: 'std-103',
      studentName: 'Grace Muthoni',
      grade: 'Form 2 Green',
      title: 'Organic Fertilizer from Canteen Food Waste',
      category: 'Science Project',
      content: 'A 6-week trial converting kitchen food scraps into liquid compost using local microbial inoculants, increasing maize yield in school garden by 18%.',
      status: 'Pending Review',
      teacherFeedback: 'Under review by Agri Club patron.',
      createdAt: '2026-07-26',
      likesCount: 19,
      commentsCount: 3,
    },
  ];

  private portfolios: StudentPortfolio[] = [
    {
      studentId: 'std-101',
      studentName: 'Amina Kwame',
      grade: 'Form 4 Science',
      bio: 'Aspiring Clean Energy Engineer, STEM Club President, and Peer Tutor.',
      achievements: [
        { title: '1st Place Regional Science Fair', category: 'Innovation', date: '2026-05-14' },
        { title: 'Best Science Student Term 1', category: 'Academics', date: '2026-04-10' },
      ],
      certificates: [
        { title: 'Python Programming Basics', issuer: 'VINEXSAH Tech Academy', date: '2025-11-20', url: '#' },
        { title: 'Junior Leadership Shield', issuer: 'SchoolSoul Board', date: '2026-02-15', url: '#' },
      ],
      skills: ['Solar Engineering', 'Python', 'Debate', 'Circuit Design', 'Team Leadership'],
      recommendations: [
        { teacherName: 'Dr. Samuel Njoroge (Physics)', comment: 'Amina displays exceptional critical thinking and practical problem-solving skills.', date: '2026-06-01' },
      ],
      projects: [
        { id: 'proj-1', title: 'Solar Powered Study Lamp', category: 'STEM' },
        { id: 'proj-2', title: 'Smart Irrigation Sensor', category: 'Robotics' },
      ],
      badges: ['Green Innovator', 'Star Scholar', 'Leadership Shield'],
    },
  ];

  private projects: InnovationProject[] = [
    {
      id: 'inv-1',
      title: 'IoT Soil Moisture Sensor for School Farm',
      category: 'Agriculture',
      teamLead: 'Grace Muthoni',
      teamMembers: ['David Ochieng', 'Amina Kwame'],
      mentorName: 'Mr. Peter Kiprop (Agri & ICT)',
      progressPercent: 85,
      description: 'An affordable microcontroller system measuring soil moisture levels and sending SMS notifications to the school farm manager.',
      milestones: [
        { id: 'm-1', title: 'Circuit Assembly', completed: true, dueDate: '2026-06-10' },
        { id: 'm-2', title: 'GSM Module Programming', completed: true, dueDate: '2026-07-01' },
        { id: 'm-3', title: 'Field Testing in Greenhouse', completed: false, dueDate: '2026-08-05' },
      ],
      demoDayDate: '2026-08-20',
      status: 'Active Development',
    },
    {
      id: 'inv-2',
      title: 'Automated Recycled Plastic Filament Extruder',
      category: 'Robotics',
      teamLead: 'Brian Wekesa',
      teamMembers: ['Kiprono Cheruiyot', 'Faith Nyambura'],
      mentorName: 'Eng. Lucy Wambui',
      progressPercent: 60,
      description: 'Converting waste plastic bottles into 3D printer filament for school STEM laboratory prototyping.',
      milestones: [
        { id: 'm-1', title: 'Shredder Motor Tuning', completed: true, dueDate: '2026-06-20' },
        { id: 'm-2', title: 'Heat Chamber Calibration', completed: false, dueDate: '2026-08-10' },
      ],
      demoDayDate: '2026-08-20',
      status: 'Active Development',
    },
  ];

  private clubs: SchoolClub[] = [
    {
      id: 'clb-1',
      name: 'Robotics & ICT Society',
      category: 'ICT',
      patronName: 'Mr. Peter Kiprop',
      studentLeader: 'Amina Kwame',
      memberCount: 42,
      meetingSchedule: 'Wednesdays 4:00 PM',
      achievementsCount: 7,
      upcomingEvent: 'National STEM Olympiad Hackathon',
      status: 'Active',
    },
    {
      id: 'clb-2',
      name: 'Young Entrepreneurs Club',
      category: 'Entrepreneurship',
      patronName: 'Mrs. Hannah Wanjiku',
      studentLeader: 'Kevin Otieno',
      memberCount: 35,
      meetingSchedule: 'Tuesdays 4:15 PM',
      achievementsCount: 4,
      upcomingEvent: 'School Marketplace Exhibition',
      status: 'Active',
    },
    {
      id: 'clb-3',
      name: 'Environmental & Agriculture Club',
      category: 'Agriculture',
      patronName: 'Mr. James Barasa',
      studentLeader: 'Grace Muthoni',
      memberCount: 50,
      meetingSchedule: 'Fridays 3:30 PM',
      achievementsCount: 9,
      upcomingEvent: 'Tree Planting & Organic Harvest Sale',
      status: 'Active',
    },
  ];

  private marketplaceItems: MarketplaceItem[] = [
    {
      id: 'mkt-1',
      title: 'Organic Honey from School Apiary (500g)',
      category: 'Agricultural Produce',
      price: 12.0,
      currency: 'USD',
      inventoryCount: 25,
      studentCreator: 'Agriculture Club',
      grade: 'All Grades',
      description: 'Pure unfiltered organic honey harvested sustainably from the Young Farmers Club apiary project.',
      status: 'Active',
      qrCode: 'QR-HONEY-500G-SCH',
      orders: [
        {
          id: 'ord-101',
          buyerName: 'Parent Mary Ndung’u',
          buyerPhone: '+254712345678',
          quantity: 2,
          totalPrice: 24.0,
          status: 'Approved & Scheduled',
          collectionDate: '2026-08-01 at Main Gate Security',
        },
      ],
    },
    {
      id: 'mkt-2',
      title: 'Handcrafted Beaded Leather Keychains',
      category: 'Art & Crafts',
      price: 5.0,
      currency: 'USD',
      inventoryCount: 40,
      studentCreator: 'Form 3 Arts Collective',
      grade: 'Form 3',
      description: 'Custom school-branded beaded keychains hand-crafted during cultural art workshops.',
      status: 'Active',
      qrCode: 'QR-KEYCHAIN-ART3',
      orders: [],
    },
    {
      id: 'mkt-3',
      title: 'Laser-Cut Bamboo Desk Organizer',
      category: 'Innovation Product',
      price: 18.0,
      currency: 'USD',
      inventoryCount: 12,
      studentCreator: 'Brian Wekesa',
      grade: 'Form 4 STEM',
      description: 'Sustainable desktop stationery holder manufactured in the school FabLab using local bamboo.',
      status: 'Active',
      qrCode: 'QR-BAMBOO-ORG-4',
      orders: [],
    },
  ];

  private websiteConfig: PublicWebsiteConfig = {
    schoolName: 'SchoolSoul International Academy',
    motto: 'Excellence in Leadership, Innovation & Character',
    heroHeadline: 'Empowering Next-Generation African Innovators & Global Leaders',
    heroSubtext: 'Welcome to SchoolSoul International Academy — a vibrant learning community dedicated to academic rigor, holistic student growth, and technology innovation.',
    visionStatement: 'To be the premier center of educational excellence, fostering ethical leadership and practical problem-solving across Africa.',
    missionStatement: 'Providing holistic, technology-infused education that inspires curiosity, integrity, and social impact in every learner.',
    principalMessage: 'Dear Parents, Students & Friends: At SchoolSoul, we believe every learner possesses unique brilliance. Our V9 Student Voice and Innovation Hub gives our children real-world agency.',
    stats: [
      { label: 'Active Students', value: '1,250+' },
      { label: 'National Exam Pass Rate', value: '98.4%' },
      { label: 'Student Clubs & Sports', value: '28' },
      { label: 'University Placement', value: '94%' },
    ],
    admissionNotice: 'Admissions open for 2026/2027 Academic Year. Early bird entrance interviews scheduled for August 15, 2026.',
    contactEmail: 'info@schoolsoul-academy.org',
    contactPhone: '+254 700 000 888',
    address: 'VINEXSAH Innovation Campus, Valley Road, Nairobi, Kenya',
    isPublicWebsiteLive: true,
  };

  private newsArticles: NewsArticle[] = [
    {
      id: 'news-1',
      title: 'SchoolSoul Robotics Team Claims Gold at Regional STEM Olympiad',
      category: 'Success Story',
      author: 'Communications Desk',
      summary: 'Our Form 3 & 4 STEM team built a solar irrigation robot that outperformed 32 competing schools.',
      content: 'Full article text detailing the team performance, judge remarks, and award ceremony highlights at the National Innovation Arena.',
      publishedAt: '2026-07-15',
      status: 'Published',
      isFeatured: true,
      views: 342,
    },
    {
      id: 'news-2',
      title: 'Annual Parent-Teacher Conference & Student Innovation Exhibition Announced',
      category: 'School News',
      author: 'Academic Registrar',
      summary: 'Join us on August 20th for our Term 2 Open Day, featuring live project demos, arts showcase, and honey harvest marketplace.',
      content: 'Detailed schedule of events, parking details, and student presentation tracks.',
      publishedAt: '2026-07-22',
      status: 'Published',
      isFeatured: false,
      views: 189,
    },
  ];

  private galleryAlbums: GalleryAlbum[] = [
    {
      id: 'alb-1',
      title: 'Inter-House Sports Day 2026',
      category: 'Sports & Games',
      eventDate: '2026-06-18',
      photoCount: 24,
      coverImage: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=800',
      privacyLevel: 'Public',
      photos: [
        {
          id: 'pic-101',
          caption: '100m Athletics Final Sprint',
          imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=800',
          consentVerified: true,
        },
      ],
    },
    {
      id: 'alb-2',
      title: 'STEM & Robotics Exhibition',
      category: 'Science Fair',
      eventDate: '2026-05-28',
      photoCount: 18,
      coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      privacyLevel: 'Public',
      photos: [
        {
          id: 'pic-102',
          caption: 'Students demonstrating IoT water sensor',
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
          consentVerified: true,
        },
      ],
    },
  ];

  private alumni: AlumniProfile[] = [
    {
      id: 'alm-1',
      name: 'Eng. Brian Kamau',
      graduationYear: 2018,
      currentRole: 'Senior Renewable Energy Engineer',
      companyOrUniversity: 'Kibo Energy Ltd',
      email: 'brian.kamau@kiboenergy.com',
      phone: '+254 722 111 222',
      location: 'Nairobi, Kenya',
      isAvailableForMentorship: true,
      mentorshipTopic: 'Careers in Electrical Engineering & Solar Tech',
      totalDonated: 1500,
      featuredStory: 'Graduated in 2018, went on to study Electrical Engineering at UoN, now sponsoring the FabLab solar kit.',
    },
    {
      id: 'alm-2',
      name: 'Dr. Sarah Cherono',
      graduationYear: 2015,
      currentRole: 'Pediatric Surgeon & Researcher',
      companyOrUniversity: 'Kenyatta National Hospital',
      email: 's.cherono@knh.or.ke',
      phone: '+254 733 444 555',
      location: 'Nairobi / Oxford',
      isAvailableForMentorship: true,
      mentorshipTopic: 'Medical School Preparation & Bio-Ethics',
      totalDonated: 2500,
      featuredStory: 'Spearheads annual medical checkup camp for primary school students.',
    },
  ];

  private partnerships: Partnership[] = [
    {
      id: 'part-1',
      organizationName: 'VINEXSAH Tech Foundation',
      partnerType: 'Corporate',
      contactPerson: 'Director Alex Vinex',
      contactEmail: 'foundation@vinexsah.com',
      agreementSummary: 'Sponsorship of 15 high-speed computers for ICT laboratory and free cloud lab licenses.',
      status: 'Active',
      renewalDate: '2027-12-31',
    },
    {
      id: 'part-2',
      organizationName: 'National Science Council',
      partnerType: 'Government Agency',
      contactPerson: 'Dr. Jane Kagia',
      contactEmail: 'jkagia@sciencecouncil.go.ke',
      agreementSummary: 'Annual accreditation and research mentorship grant for high school STEM clubs.',
      status: 'Active',
      renewalDate: '2026-11-15',
    },
  ];

  private communityActivities: CommunityActivity[] = [
    {
      id: 'comm-1',
      title: 'Community Tree Planting & Watershed Restoration',
      type: 'Eco Campaign',
      date: '2026-08-12',
      participantsCount: 120,
      coordinator: 'Mr. James Barasa',
      location: 'Valley Creek Basin',
      status: 'Upcoming',
    },
    {
      id: 'comm-2',
      title: 'Parent Career Talks: Engineering & Technology',
      type: 'Career Talk',
      date: '2026-07-08',
      participantsCount: 85,
      coordinator: 'Guidance & Counseling Department',
      location: 'School Main Hall',
      status: 'Completed',
    },
  ];

  private donationCampaigns: DonationCampaign[] = [
    {
      id: 'dnc-1',
      title: 'Digital Library & E-Learning Tablet Drive',
      targetAmount: 25000,
      raisedAmount: 18450,
      currency: 'USD',
      category: 'Library Books',
      donorCount: 64,
      status: 'Active',
      description: 'Funding 100 rugged tablets pre-loaded with STEM textbooks and offline encyclopedia software.',
    },
    {
      id: 'dnc-2',
      title: 'Need-Based Student Scholarship Fund 2026',
      targetAmount: 40000,
      raisedAmount: 32100,
      currency: 'USD',
      category: 'Student Scholarship',
      donorCount: 88,
      status: 'Active',
      description: 'Supporting full tuition and boarding uniforms for 20 bright underprivileged students.',
    },
  ];

  private brandSettings: BrandSettings = {
    logoText: 'SCHOOLSOUL ACADEMY',
    primaryColorHex: '#1e40af',
    secondaryColorHex: '#7e22ce',
    fontFamily: 'Plus Jakarta Sans',
    tagline: 'Empowering Learners, Transforming Futures',
    reportHeaderTitle: 'SCHOOLSOUL INTERNATIONAL ACADEMY — OFFICIAL EXECUTIVE REPORT',
    certificateHeader: 'SCHOOLSOUL ACADEMY BOARD OF GOVERNORS CERTIFICATE OF EXCELLENCE',
  };

  private recognitionAwards: RecognitionAward[] = [
    {
      id: 'awd-1',
      recipientName: 'Amina Kwame',
      recipientRole: 'Student',
      awardTitle: 'Star Innovator of Term 2',
      category: 'STEM & Sustainability',
      issuedDate: '2026-07-10',
      badgeType: 'Star Innovator',
      description: 'Awarded for outstanding leadership in solar lighting design and peer tutoring.',
    },
    {
      id: 'awd-2',
      recipientName: 'Robotics & ICT Society',
      recipientRole: 'Club',
      awardTitle: 'Most Outstanding Student Society',
      category: 'Extracurricular Excellence',
      issuedDate: '2026-06-30',
      badgeType: 'Leadership Shield',
      description: 'Recognized for winning Regional Gold and organizing junior coding workshops.',
    },
  ];

  private analytics: PublicAnalyticsData = {
    monthlyVisitors: 8420,
    admissionEnquiriesThisMonth: 142,
    galleryViewsCount: 12500,
    marketplaceTotalRevenue: 1850,
    totalDonationsRaised: 50550,
    activeAlumniRegistered: 340,
    studentVoiceSubmissions: 78,
  };

  // ================= Methods =================

  // Student Voice
  async getVoiceItems(): Promise<StudentVoiceItem[]> {
    return [...this.voiceItems];
  }
  async createVoiceItem(item: Omit<StudentVoiceItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>): Promise<StudentVoiceItem> {
    const newItem: StudentVoiceItem = {
      ...item,
      id: `sv-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      likesCount: 0,
      commentsCount: 0,
    };
    this.voiceItems.unshift(newItem);
    return newItem;
  }
  async updateVoiceStatus(id: string, status: StudentVoiceItem['status'], feedback?: string, badge?: string): Promise<StudentVoiceItem | null> {
    const item = this.voiceItems.find((i) => i.id === id);
    if (item) {
      item.status = status;
      if (feedback) item.teacherFeedback = feedback;
      if (badge) item.badgeEarned = badge;
    }
    return item || null;
  }

  // Student Portfolios
  async getPortfolios(): Promise<StudentPortfolio[]> {
    return [...this.portfolios];
  }
  async getPortfolioByStudentId(studentId: string): Promise<StudentPortfolio | null> {
    return this.portfolios.find((p) => p.studentId === studentId) || this.portfolios[0] || null;
  }

  // Innovation Projects
  async getInnovationProjects(): Promise<InnovationProject[]> {
    return [...this.projects];
  }
  async addInnovationProject(proj: Omit<InnovationProject, 'id'>): Promise<InnovationProject> {
    const newProj: InnovationProject = { ...proj, id: `inv-${Date.now()}` };
    this.projects.unshift(newProj);
    return newProj;
  }

  // School Clubs
  async getClubs(): Promise<SchoolClub[]> {
    return [...this.clubs];
  }

  // Marketplace
  async getMarketplaceItems(): Promise<MarketplaceItem[]> {
    return [...this.marketplaceItems];
  }
  async addMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'orders' | 'qrCode'>): Promise<MarketplaceItem> {
    const newItem: MarketplaceItem = {
      ...item,
      id: `mkt-${Date.now()}`,
      qrCode: `QR-SCH-${Date.now().toString().slice(-6)}`,
      orders: [],
    };
    this.marketplaceItems.unshift(newItem);
    return newItem;
  }
  async placeMarketplaceOrder(itemId: string, order: Omit<MarketplaceOrder, 'id' | 'status' | 'collectionDate'>): Promise<MarketplaceItem | null> {
    const item = this.marketplaceItems.find((i) => i.id === itemId);
    if (item) {
      const newOrd: MarketplaceOrder = {
        ...order,
        id: `ord-${Date.now()}`,
        status: 'Pending School Approval',
        collectionDate: 'To be scheduled by School Bursar',
      };
      item.orders.unshift(newOrd);
      item.inventoryCount = Math.max(0, item.inventoryCount - order.quantity);
    }
    return item || null;
  }

  // Public Website & Config
  async getWebsiteConfig(): Promise<PublicWebsiteConfig> {
    return { ...this.websiteConfig };
  }
  async updateWebsiteConfig(config: Partial<PublicWebsiteConfig>): Promise<PublicWebsiteConfig> {
    this.websiteConfig = { ...this.websiteConfig, ...config };
    return { ...this.websiteConfig };
  }

  // News Articles
  async getNewsArticles(): Promise<NewsArticle[]> {
    return [...this.newsArticles];
  }
  async createNewsArticle(art: Omit<NewsArticle, 'id' | 'views'>): Promise<NewsArticle> {
    const newArt: NewsArticle = { ...art, id: `news-${Date.now()}`, views: 1 };
    this.newsArticles.unshift(newArt);
    return newArt;
  }

  // Gallery
  async getGalleryAlbums(): Promise<GalleryAlbum[]> {
    return [...this.galleryAlbums];
  }

  // Alumni Network
  async getAlumniList(): Promise<AlumniProfile[]> {
    return [...this.alumni];
  }
  async registerAlumni(profile: Omit<AlumniProfile, 'id' | 'totalDonated'>): Promise<AlumniProfile> {
    const newAlum: AlumniProfile = { ...profile, id: `alm-${Date.now()}`, totalDonated: 0 };
    this.alumni.unshift(newAlum);
    return newAlum;
  }

  // Partnerships
  async getPartnerships(): Promise<Partnership[]> {
    return [...this.partnerships];
  }

  // Community
  async getCommunityActivities(): Promise<CommunityActivity[]> {
    return [...this.communityActivities];
  }

  // Donations
  async getDonationCampaigns(): Promise<DonationCampaign[]> {
    return [...this.donationCampaigns];
  }
  async donateToCampaign(campaignId: string, amount: number): Promise<DonationCampaign | null> {
    const camp = this.donationCampaigns.find((c) => c.id === campaignId);
    if (camp) {
      camp.raisedAmount += amount;
      camp.donorCount += 1;
      this.analytics.totalDonationsRaised += amount;
    }
    return camp || null;
  }

  // Brand Settings
  async getBrandSettings(): Promise<BrandSettings> {
    return { ...this.brandSettings };
  }
  async updateBrandSettings(settings: Partial<BrandSettings>): Promise<BrandSettings> {
    this.brandSettings = { ...this.brandSettings, ...settings };
    return { ...this.brandSettings };
  }

  // Recognition Awards
  async getRecognitionAwards(): Promise<RecognitionAward[]> {
    return [...this.recognitionAwards];
  }

  // Analytics
  async getPublicAnalytics(): Promise<PublicAnalyticsData> {
    return { ...this.analytics };
  }
}

export const v9PublicEngagementApi = new V9PublicEngagementApi();
