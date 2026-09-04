import { db } from '../db/indexedDB';
import { logAuditEvent } from './api';
import { processRealPayment, PaymentInitiationRequest } from './paymentAdapterService';
import type { MarketplaceItem, MarketplaceOrder, User, Student } from '../types';

export interface VerifiedProjectOrder extends MarketplaceOrder {
  orderNumber: string;
  itemId: string;
  itemTitle: string;
  itemCategory: string;
  unitPrice: number;
  paymentReference: string;
  paymentMethod: string;
  paymentStatus: 'PAID_VERIFIED' | 'PENDING_BURSAR_VERIFICATION' | 'FAILED';
  schoolCommissionAmount: number;
  studentEarnedAmount: number;
  createdAt: string;
  qrCollectionToken: string;
}

const MARKETPLACE_ITEMS_KEY = 'schoolsoul_marketplace_items';
const MARKETPLACE_ORDERS_KEY = 'schoolsoul_marketplace_orders';

export const DEFAULT_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'mkt-prod-1',
    title: 'School Apiary Pure Organic Honey (500g Jar)',
    category: 'Agricultural Produce',
    price: 25000,
    currency: 'UGX',
    inventoryCount: 18,
    studentCreator: 'Senior 3 Agri Club',
    grade: 'Senior 3 Science & Agriculture',
    description: '100% natural, raw wildflower honey harvested sustainably from the school biology bee farm apiary.',
    status: 'Active',
    qrCode: 'SCH-MKT-QR-HONEY-500',
    orders: [],
  },
  {
    id: 'mkt-prod-2',
    title: 'Handcrafted African Sisal Basket & Table Mat Set',
    category: 'Art & Crafts',
    price: 35000,
    currency: 'UGX',
    inventoryCount: 7,
    studentCreator: 'Amina K. (Art Club Leader)',
    grade: 'Form 4 Arts & Design',
    description: 'Eco-friendly traditional woven sisal crafts made with botanical dyes from indigenous avocado and marigold extracts.',
    status: 'Active',
    qrCode: 'SCH-MKT-QR-SISAL-002',
    orders: [],
  },
  {
    id: 'mkt-prod-3',
    title: 'Solar-Powered Classroom Study Lamp Prototype',
    category: 'Innovation Product',
    price: 50000,
    currency: 'UGX',
    inventoryCount: 4,
    studentCreator: 'Robotics & STEM Team',
    grade: 'Senior 4 Physics Stream',
    description: 'Rechargeable LED desk lamp assembled with recycled lithium-ion cells and 5W solar micro-panel.',
    status: 'Active',
    qrCode: 'SCH-MKT-QR-SOLAR-003',
    orders: [],
  },
];

/**
 * Get all marketplace items
 */
export function getMarketplaceItems(): MarketplaceItem[] {
  try {
    const raw = localStorage.getItem(MARKETPLACE_ITEMS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_MARKETPLACE_ITEMS;
  } catch {
    return DEFAULT_MARKETPLACE_ITEMS;
  }
}

/**
 * Get all verified marketplace orders
 */
export function getMarketplaceOrders(): VerifiedProjectOrder[] {
  try {
    const raw = localStorage.getItem(MARKETPLACE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Student creates/proposes a new project or product
 */
export async function submitStudentProjectForApproval(
  student: Student,
  projectData: {
    title: string;
    category: MarketplaceItem['category'];
    price: number;
    inventoryCount: number;
    description: string;
  }
): Promise<MarketplaceItem> {
  const items = getMarketplaceItems();
  const id = 'mkt-item-' + Date.now();
  const qrCode = `SCH-MKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Safeguarding: Display only safe student identifier
  const safeCreatorName = `${student.firstName} ${student.lastName.charAt(0)}.`;

  const newItem: MarketplaceItem = {
    id,
    title: projectData.title,
    category: projectData.category,
    price: projectData.price,
    currency: 'UGX',
    inventoryCount: projectData.inventoryCount,
    studentCreator: safeCreatorName,
    grade: `${student.classGrade} ${student.stream}`,
    description: projectData.description,
    status: 'Pending Moderation',
    qrCode,
    orders: [],
  };

  items.unshift(newItem);
  localStorage.setItem(MARKETPLACE_ITEMS_KEY, JSON.stringify(items));

  return newItem;
}

/**
 * Teacher or Headteacher Moderates and Approves/Rejects a Project
 */
export async function moderateMarketplaceItem(
  itemId: string,
  decision: 'Approve' | 'Reject' | 'Unlist',
  reviewer: User
): Promise<{ success: boolean; message: string }> {
  const items = getMarketplaceItems();
  const item = items.find((i) => i.id === itemId);
  if (!item) return { success: false, message: 'Item not found' };

  if (decision === 'Approve') {
    item.status = 'Active';
  } else if (decision === 'Reject') {
    item.status = 'Unlisted';
  } else {
    item.status = 'Unlisted';
  }

  localStorage.setItem(MARKETPLACE_ITEMS_KEY, JSON.stringify(items));

  await logAuditEvent(
    reviewer.id,
    reviewer.username,
    reviewer.role,
    'SETTINGS_UPDATE',
    `Student Marketplace Moderation: "${item.title}" marked as [${item.status}] by ${reviewer.fullName}`
  );

  return { success: true, message: `Product moderation complete: ${decision}d.` };
}

/**
 * Place a real marketplace order with real payment verification
 */
export async function placeMarketplaceOrderWithPayment(
  itemId: string,
  buyer: { name: string; phone: string; email?: string },
  quantity: number,
  paymentMethod: PaymentInitiationRequest['provider'],
  currentUser?: User | null
): Promise<{ success: boolean; order?: VerifiedProjectOrder; message: string }> {
  const items = getMarketplaceItems();
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return { success: false, message: 'Product not found' };
  }

  if (item.inventoryCount < quantity) {
    return { success: false, message: `Insufficient inventory: only ${item.inventoryCount} units available.` };
  }

  const totalPrice = item.price * quantity;
  const year = new Date().getFullYear();
  const orderNumber = `ORD-SCH-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Process payment via authoritative payment adapter
  const payResult = await processRealPayment(
    {
      orderOrFeeId: orderNumber,
      studentId: item.studentCreator,
      payerName: buyer.name,
      payerPhone: buyer.phone,
      payerEmail: buyer.email,
      amount: totalPrice,
      currency: item.currency || 'UGX',
      provider: paymentMethod,
      description: `Purchase: ${quantity}x ${item.title}`,
      itemType: 'StudentProjectOrder',
    },
    currentUser
  );

  if (payResult.status === 'FAILED') {
    return {
      success: false,
      message: `Order could not be completed: ${payResult.message}`,
    };
  }

  // 2. Decrement inventory
  item.inventoryCount -= quantity;
  if (item.inventoryCount === 0) {
    item.status = 'Sold Out';
  }

  // School commission calculation (e.g. 10% school development, 90% student enterprise club fund)
  const schoolCommission = Math.round(totalPrice * 0.1);
  const studentBenefit = totalPrice - schoolCommission;

  const qrCollectionToken = `QR-PICKUP-${orderNumber}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const verifiedOrder: VerifiedProjectOrder = {
    id: 'ord-' + Date.now(),
    orderNumber,
    itemId: item.id,
    itemTitle: item.title,
    itemCategory: item.category,
    unitPrice: item.price,
    buyerName: buyer.name,
    buyerPhone: buyer.phone,
    quantity,
    totalPrice,
    paymentReference: payResult.referenceNumber,
    paymentMethod,
    paymentStatus: payResult.status === 'SUCCESS_VERIFIED' ? 'PAID_VERIFIED' : 'PENDING_BURSAR_VERIFICATION',
    schoolCommissionAmount: schoolCommission,
    studentEarnedAmount: studentBenefit,
    status: payResult.status === 'SUCCESS_VERIFIED' ? 'Approved & Scheduled' : 'Pending School Approval',
    collectionDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Ready in 2 days
    createdAt: new Date().toISOString(),
    qrCollectionToken,
  };

  const orders = getMarketplaceOrders();
  orders.unshift(verifiedOrder);
  localStorage.setItem(MARKETPLACE_ORDERS_KEY, JSON.stringify(orders));
  localStorage.setItem(MARKETPLACE_ITEMS_KEY, JSON.stringify(items));

  return {
    success: true,
    order: verifiedOrder,
    message: `Order #${orderNumber} placed successfully! ${payResult.message}`,
  };
}
