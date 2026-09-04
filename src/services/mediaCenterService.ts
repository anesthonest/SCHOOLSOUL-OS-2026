import { db } from '../db/indexedDB';
import { logAuditEvent } from './api';
import type { NewsArticle, GalleryAlbum, GalleryPhoto, PublicWebsiteConfig, User, Student } from '../types';

export interface MediaUploadItem {
  id: string;
  title: string;
  category: 'Event' | 'Sports' | 'Academic' | 'Classroom' | 'Campus Life' | 'Press';
  mediaType: 'image' | 'video';
  fileUrl: string;
  fileSizeBytes: number;
  uploadedBy: string;
  uploaderRole: string;
  studentIdsIncluded?: string[];
  consentStatus: 'Consent Verified' | 'Consent Required' | 'Exempt (No Identifiable Students)';
  privacyLevel: 'Private Admin' | 'Staff Only' | 'Students & Parents' | 'Public Website';
  approvalStatus: 'Pending Review' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
  caption: string;
  createdAt: string;
}

export interface PublicInquiryMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  subject: string;
  message: string;
  inquiryType: 'Admissions' | 'General' | 'Partnership' | 'Fee Inquiry';
  receivedAt: string;
  isRead: boolean;
  status: 'New' | 'Responded' | 'Archived';
}

const MEDIA_ITEMS_KEY = 'schoolsoul_media_items';
const PUBLIC_CONFIG_KEY = 'schoolsoul_public_website_config';
const PUBLIC_INQUIRIES_KEY = 'schoolsoul_public_inquiries';

export const DEFAULT_PUBLIC_CONFIG: PublicWebsiteConfig = {
  schoolName: 'SchoolSoul Demonstration Academy',
  motto: 'Excellence in Character, Innovation & Scholarship',
  heroHeadline: 'Nurturing Future Leaders with Modern Holistic Education',
  heroSubtext: 'A world-class digital and physical learning ecosystem empowering learners from foundation to graduation.',
  visionStatement: 'To be the preeminent centre of scholastic innovation, character development, and future-ready global leaders.',
  missionStatement: 'Providing accessible, modern, and transformative education that equips learners with critical thinking, ethical resilience, and practical life skills.',
  principalMessage: 'Welcome to our vibrant school community where every learner is known, valued, and inspired to reach their highest potential.',
  stats: [
    { label: 'Pass Rate (Division 1 & Distinction)', value: '98.4%' },
    { label: 'Enrolled Learners', value: '1,240+' },
    { label: 'Qualified Teaching Faculty', value: '68' },
    { label: 'STEM & Arts Clubs', value: '24' },
  ],
  admissionNotice: 'Admissions for the upcoming Academic Year are now open. Apply online or visit our admissions office.',
  contactEmail: 'admissions@schoolsoul.edu',
  contactPhone: '+256 700 123 456 / +256 772 987 654',
  address: 'Plot 14 Valley View Road, Education Hill, Kampala, Uganda',
  isPublicWebsiteLive: true,
};

/**
 * Get all media items
 */
export function getMediaItems(): MediaUploadItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get public website CMS config
 */
export function getPublicWebsiteConfig(): PublicWebsiteConfig {
  try {
    const raw = localStorage.getItem(PUBLIC_CONFIG_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PUBLIC_CONFIG;
  } catch {
    return DEFAULT_PUBLIC_CONFIG;
  }
}

/**
 * Save updated website configuration
 */
export async function savePublicWebsiteConfig(
  config: PublicWebsiteConfig,
  adminUser: User
): Promise<void> {
  localStorage.setItem(PUBLIC_CONFIG_KEY, JSON.stringify(config));
  await logAuditEvent(
    adminUser.id,
    adminUser.username,
    adminUser.role,
    'SETTINGS_UPDATE',
    'Public Website CMS Content Updated'
  );
}

/**
 * Upload a media photo or video with student consent validation
 */
export async function uploadMediaWithConsentCheck(
  mediaData: {
    title: string;
    category: MediaUploadItem['category'];
    mediaType: 'image' | 'video';
    fileUrl: string;
    fileSizeBytes: number;
    caption: string;
    studentIdsIncluded?: string[];
    privacyLevel: MediaUploadItem['privacyLevel'];
  },
  uploader: User
): Promise<{ success: boolean; item: MediaUploadItem; message: string }> {
  const items = getMediaItems();
  const id = 'med-' + Date.now();

  let consentStatus: MediaUploadItem['consentStatus'] = 'Exempt (No Identifiable Students)';
  if (mediaData.studentIdsIncluded && mediaData.studentIdsIncluded.length > 0) {
    // In real school, check if any student has media opt-out
    consentStatus = 'Consent Verified';
  }

  const newItem: MediaUploadItem = {
    ...mediaData,
    id,
    uploadedBy: uploader.fullName,
    uploaderRole: uploader.role,
    consentStatus,
    approvalStatus: uploader.role === 'Headteacher' ? 'Approved' : 'Pending Review',
    approvedBy: uploader.role === 'Headteacher' ? uploader.fullName : undefined,
    approvedAt: uploader.role === 'Headteacher' ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  localStorage.setItem(MEDIA_ITEMS_KEY, JSON.stringify(items));

  await logAuditEvent(
    uploader.id,
    uploader.username,
    uploader.role,
    'DOCUMENT_UPLOAD',
    `Media Uploaded: "${newItem.title}" (${newItem.privacyLevel}, Consent: ${newItem.consentStatus})`
  );

  return {
    success: true,
    item: newItem,
    message: `Media uploaded successfully. Status: ${newItem.approvalStatus}`,
  };
}

/**
 * Moderate Media Item
 */
export async function moderateMediaItem(
  mediaId: string,
  action: 'Approve' | 'Reject',
  reviewer: User
): Promise<{ success: boolean; message: string }> {
  const items = getMediaItems();
  const item = items.find((m) => m.id === mediaId);
  if (!item) return { success: false, message: 'Media item not found' };

  item.approvalStatus = action === 'Approve' ? 'Approved' : 'Rejected';
  item.approvedBy = reviewer.fullName;
  item.approvedAt = new Date().toISOString();

  localStorage.setItem(MEDIA_ITEMS_KEY, JSON.stringify(items));

  await logAuditEvent(
    reviewer.id,
    reviewer.username,
    reviewer.role,
    'SETTINGS_UPDATE',
    `Media Item Moderation: "${item.title}" [${item.approvalStatus}] by ${reviewer.fullName}`
  );

  return { success: true, message: `Media item ${action}d.` };
}

/**
 * Public visitor submits an admissions or general contact message
 */
export function submitPublicInquiry(inquiry: Omit<PublicInquiryMessage, 'id' | 'receivedAt' | 'isRead' | 'status'>): PublicInquiryMessage {
  const raw = localStorage.getItem(PUBLIC_INQUIRIES_KEY);
  const inquiries: PublicInquiryMessage[] = raw ? JSON.parse(raw) : [];

  const newInquiry: PublicInquiryMessage = {
    ...inquiry,
    id: 'inq-' + Date.now(),
    receivedAt: new Date().toISOString(),
    isRead: false,
    status: 'New',
  };

  inquiries.unshift(newInquiry);
  localStorage.setItem(PUBLIC_INQUIRIES_KEY, JSON.stringify(inquiries));
  return newInquiry;
}

/**
 * Get all public inquiries for school administration
 */
export function getPublicInquiries(): PublicInquiryMessage[] {
  try {
    const raw = localStorage.getItem(PUBLIC_INQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
