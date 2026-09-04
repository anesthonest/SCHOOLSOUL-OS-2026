import { db } from '../db/indexedDB';
import { isServerOnline, queueOfflineAction } from './api';
import type {
  FeeStructure,
  FeeCategoryItem,
  StudentFeeAccount,
  PaymentRecord,
  PaymentMethod,
  PaymentType,
  ScholarshipRecord,
  BudgetItem,
  FinancialTransaction,
  JournalEntry,
  MobileMoneyRequest,
  PaymentReminder,
  Student,
  ExpenseCategory,
  IncomeCategory,
  TransactionType,
} from '../types';

// Format UGX Currency
export function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

// Generate Verification Checksum Code
export function generateVerificationCode(receiptNum: string, amount: number, studentId: string): string {
  const raw = `${receiptNum}-${amount}-${studentId}-SCHOOLSOUL-V4`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const positiveHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `SS-VER-${receiptNum.replace('REC-', '')}-${positiveHash.slice(0, 4)}`;
}

// ==========================================
// SEED INITIAL FINANCIAL DATA
// ==========================================
let isSeedingFinancePromise: Promise<void> | null = null;

export async function seedSampleFinanceDataIfEmpty(): Promise<void> {
  if (isSeedingFinancePromise) {
    return isSeedingFinancePromise;
  }

  isSeedingFinancePromise = (async () => {
    try {
      const feeStructureCount = await db.feeStructures.count();
      if (feeStructureCount === 0) {
        const year = new Date().getFullYear().toString();
    
    // 1. Fee Structures
    const primaryBoardingStructure: FeeStructure = {
      id: 'fs-p7-boarding-2026',
      title: 'P.7 Boarding Term I Fee Structure',
      academicYear: year,
      term: 'Term I',
      classGrade: 'Primary 7',
      residenceType: 'Boarding',
      studentCategory: 'All',
      items: [
        { id: 'f1', category: 'Tuition', name: 'Academic Tuition & Coaching', amountUGX: 650000, isMandatory: true, appliesTo: 'All' },
        { id: 'f2', category: 'Boarding', name: 'Dormitory & Accommodation', amountUGX: 350000, isMandatory: true, appliesTo: 'Boarding' },
        { id: 'f3', category: 'Meals', name: 'Balanced Diet Meal Program', amountUGX: 200000, isMandatory: true, appliesTo: 'All' },
        { id: 'f4', category: 'Examination', name: 'PLE Prep & MOCK Exams', amountUGX: 80000, isMandatory: true, appliesTo: 'All' },
        { id: 'f5', category: 'ICT', name: 'Computer Lab & E-Learning', amountUGX: 50000, isMandatory: true, appliesTo: 'All' },
        { id: 'f6', category: 'Development', name: 'Campus Expansion Fund', amountUGX: 50000, isMandatory: true, appliesTo: 'All' },
        { id: 'f7', category: 'Medical', name: 'Sanitation & Infirmary Care', amountUGX: 20000, isMandatory: true, appliesTo: 'All' },
        { id: 'f8', category: 'Uniform', name: 'Sunday Wear & Sweater (New)', amountUGX: 100000, isMandatory: false, appliesTo: 'New Students' },
      ],
      totalMandatoryAmountUGX: 1400000,
      installmentPlans: [
        { installmentNumber: 1, percentageOrAmount: 50, dueDate: `${year}-02-15`, latePenaltyPercentage: 5 },
        { installmentNumber: 2, percentageOrAmount: 30, dueDate: `${year}-03-20`, latePenaltyPercentage: 5 },
        { installmentNumber: 3, percentageOrAmount: 20, dueDate: `${year}-04-15`, latePenaltyPercentage: 10 },
      ],
      latePenaltyPolicy: {
        enabled: true,
        percentageAfterDueDate: 5,
        gracePeriodDays: 7,
      },
      status: 'Active',
      version: 1,
      createdBy: 'Bursar Office',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const primaryDayStructure: FeeStructure = {
      id: 'fs-p6-day-2026',
      title: 'P.6 Day Scholar Term I Fee Structure',
      academicYear: year,
      term: 'Term I',
      classGrade: 'Primary 6',
      residenceType: 'Day',
      studentCategory: 'All',
      items: [
        { id: 'f10', category: 'Tuition', name: 'Academic Tuition', amountUGX: 450000, isMandatory: true, appliesTo: 'All' },
        { id: 'f11', category: 'Meals', name: 'Mid-Day Lunch Program', amountUGX: 120000, isMandatory: true, appliesTo: 'Day' },
        { id: 'f12', category: 'Examination', name: 'Termly Assessments', amountUGX: 40000, isMandatory: true, appliesTo: 'All' },
        { id: 'f13', category: 'ICT', name: 'ICT Skills Training', amountUGX: 40000, isMandatory: true, appliesTo: 'All' },
        { id: 'f14', category: 'Development', name: 'Building Fund', amountUGX: 50000, isMandatory: true, appliesTo: 'All' },
      ],
      totalMandatoryAmountUGX: 700000,
      installmentPlans: [
        { installmentNumber: 1, percentageOrAmount: 60, dueDate: `${year}-02-15`, latePenaltyPercentage: 5 },
        { installmentNumber: 2, percentageOrAmount: 40, dueDate: `${year}-03-25`, latePenaltyPercentage: 5 },
      ],
      status: 'Active',
      version: 1,
      createdBy: 'Bursar Office',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.feeStructures.bulkPut([primaryBoardingStructure, primaryDayStructure]);

    // 2. Fetch existing students or ensure students exist to bind accounts
    const students = await db.students.toArray();
    
    if (students.length > 0) {
      const studentAccounts: StudentFeeAccount[] = [];
      const paymentRecords: PaymentRecord[] = [];
      const scholarships: ScholarshipRecord[] = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const isBoarding = student.residenceType === 'Boarding';
        const totalBilled = isBoarding ? 1400000 : 700000;
        
        let scholarshipVal = 0;
        if (i === 0) {
          // Kato Joseph has a 20% Merit Scholarship
          scholarshipVal = totalBilled * 0.20;
          scholarships.push({
            id: `sch-1`,
            studentId: student.id,
            studentName: student.fullName,
            classGrade: student.classGrade,
            discountType: 'Merit',
            discountValueType: 'Percentage',
            value: 20,
            calculatedAmountUGX: scholarshipVal,
            academicYear: year,
            term: 'Term I',
            reason: 'Academic Excellence in Term III Exams (Top Aggregate)',
            approvedBy: 'Headteacher',
            status: 'Active',
            startDate: `${year}-01-10`,
            expiryDate: `${year}-12-31`,
            createdAt: new Date().toISOString(),
          });
        }

        const netBilled = totalBilled - scholarshipVal;
        let paid = 0;
        if (i === 0) paid = 1120000; // Paid fully!
        else if (i === 1) paid = 400000; // Partial
        else paid = 0; // Unpaid

        const balance = Math.max(0, netBilled - paid);
        const overpay = paid > netBilled ? paid - netBilled : 0;
        const accountStatus = paid >= netBilled ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

        studentAccounts.push({
          id: `sfa-${student.id}`,
          studentId: student.id,
          studentName: student.fullName,
          admissionNumber: student.admissionNumber,
          classGrade: student.classGrade,
          stream: student.stream,
          residenceType: student.residenceType,
          academicYear: year,
          term: 'Term I',
          feeStructureId: isBoarding ? primaryBoardingStructure.id : primaryDayStructure.id,
          totalBilledUGX: totalBilled,
          totalDiscountUGX: 0,
          totalScholarshipUGX: scholarshipVal,
          netBilledUGX: netBilled,
          totalPaidUGX: paid,
          outstandingBalanceUGX: balance,
          overpaymentUGX: overpay,
          status: accountStatus,
          lastPaymentDate: paid > 0 ? `${year}-02-10` : undefined,
          updatedAt: new Date().toISOString(),
        });

        if (paid > 0) {
          const recNo = `REC-${year}-000${i + 1}`;
          const verCode = generateVerificationCode(recNo, paid, student.id);
          paymentRecords.push({
            id: `pay-${i + 1}`,
            receiptNumber: recNo,
            studentId: student.id,
            studentName: student.fullName,
            admissionNumber: student.admissionNumber,
            classGrade: student.classGrade,
            guardianName: 'Primary Guardian',
            guardianPhone: '0772123456',
            academicYear: year,
            term: 'Term I',
            amountPaidUGX: paid,
            previousBalanceUGX: netBilled,
            newBalanceUGX: balance,
            paymentType: paid >= netBilled ? 'Full' : 'Partial',
            paymentMethod: i === 0 ? 'MTN Mobile Money' : 'Bank Deposit',
            transactionReference: i === 0 ? 'MTN-94281920' : 'STANBIC-DEP-4412',
            mobileMoneyNumber: i === 0 ? '0772123456' : undefined,
            mobileMoneyProvider: i === 0 ? 'MTN' : undefined,
            bankName: i === 1 ? 'Stanbic Bank Uganda' : undefined,
            status: 'Completed',
            cashierId: 'usr-bursar-1',
            cashierName: 'Akwero Sarah (Bursar)',
            date: `${year}-02-10`,
            timestamp: new Date().toISOString(),
            verificationCode: verCode,
            qrPayload: `VERIFY:${recNo}:${verCode}:${paid}:UGX`,
            notes: 'Term I Fee Payment Receipt',
            isOfflineCaptured: false,
          });
        }
      }

      await db.studentFeeAccounts.bulkPut(studentAccounts);
      await db.paymentRecords.bulkPut(paymentRecords);
      if (scholarships.length > 0) await db.scholarships.bulkPut(scholarships);
    }

    // 3. Budgets
    const sampleBudgets: BudgetItem[] = [
      {
        id: 'bdg-1',
        title: 'Term I Academic & Exam Materials',
        category: 'Academics',
        academicYear: year,
        term: 'Term I',
        allocatedAmountUGX: 15000000,
        actualSpentUGX: 11200000,
        remainingAmountUGX: 3800000,
        varianceUGX: 3800000,
        status: 'On Track',
        approvedBy: 'Headteacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bdg-2',
        title: 'Term I Boarding Food & Kitchen Supplies',
        category: 'Boarding',
        academicYear: year,
        term: 'Term I',
        allocatedAmountUGX: 28000000,
        actualSpentUGX: 22500000,
        remainingAmountUGX: 5500000,
        varianceUGX: 5500000,
        status: 'On Track',
        approvedBy: 'Headteacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bdg-3',
        title: 'Utilities (Electricity & Water Supply)',
        category: 'Utilities',
        academicYear: year,
        term: 'Term I',
        allocatedAmountUGX: 6000000,
        actualSpentUGX: 5800000,
        remainingAmountUGX: 200000,
        varianceUGX: 200000,
        status: 'On Track',
        approvedBy: 'Headteacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    await db.budgets.bulkPut(sampleBudgets);

    // 4. Financial Transactions (Income & Expense)
    const sampleTransactions: FinancialTransaction[] = [
      {
        id: 'tx-1',
        transactionType: 'Income',
        category: 'Fees',
        amountUGX: 1120000,
        description: 'MTN Mobile Money Fee Collection - Kato Joseph',
        receiptOrRefNumber: `REC-${year}-0001`,
        paymentMethod: 'MTN Mobile Money',
        payerOrPayeeName: 'Kato Joseph (LIN-2026-1042)',
        approvalStatus: 'Approved',
        approvedBy: 'Auto System',
        recordedBy: 'Akwero Sarah',
        date: `${year}-02-10`,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        transactionType: 'Income',
        category: 'Fees',
        amountUGX: 400000,
        description: 'Bank Deposit Fee Collection - Nalubega Grace',
        receiptOrRefNumber: `REC-${year}-0002`,
        paymentMethod: 'Bank Deposit',
        payerOrPayeeName: 'Nalubega Grace (LIN-2026-2109)',
        approvalStatus: 'Approved',
        approvedBy: 'Auto System',
        recordedBy: 'Akwero Sarah',
        date: `${year}-02-10`,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'tx-3',
        transactionType: 'Expense',
        category: 'Food',
        amountUGX: 4500000,
        description: 'Bulk Maize Flour & Beans Purchase for Dining Hall',
        voucherNumber: `VOUCH-${year}-0012`,
        paymentMethod: 'Bank Transfer',
        payerOrPayeeName: 'Kampala Grain Millers Ltd',
        approvalStatus: 'Approved',
        approvedBy: 'Headteacher',
        recordedBy: 'Akwero Sarah',
        date: `${year}-02-08`,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'tx-4',
        transactionType: 'Expense',
        category: 'Exam Materials',
        amountUGX: 1800000,
        description: 'Printing Papers & Duplicating Ink for Mock Exams',
        voucherNumber: `VOUCH-${year}-0015`,
        paymentMethod: 'Cash',
        payerOrPayeeName: 'Nasser Road Stationers',
        approvalStatus: 'Approved',
        approvedBy: 'Headteacher',
        recordedBy: 'Akwero Sarah',
        date: `${year}-02-09`,
        timestamp: new Date().toISOString(),
      },
    ];
    await db.financialTransactions.bulkPut(sampleTransactions);

    // 5. Journal Entries
    const sampleJournals: JournalEntry[] = [
      {
        id: 'jrn-1',
        date: `${year}-02-10`,
        referenceNumber: `JRN-${year}-0001`,
        description: 'Term I Mobile Money Fee Collection Deposit',
        debitAccount: 'MTN Mobile Money Wallet / Cash',
        creditAccount: 'Student Fee Revenue Control',
        amountUGX: 1120000,
        recordedBy: 'Akwero Sarah',
        timestamp: new Date().toISOString(),
      },
    ];
    await db.journalEntries.bulkPut(sampleJournals);

    // 6. Payment Reminders
    if (students.length > 1) {
      const sampleReminder: PaymentReminder = {
        id: 'rem-1',
        studentId: students[1].id,
        studentName: students[1].fullName,
        guardianPhone: '0772987654',
        guardianName: 'Grace Guardian',
        outstandingBalanceUGX: 300000,
        dueDate: `${year}-02-28`,
        channel: 'SMS',
        message: `Dear Parent of ${students[1].fullName}, this is a gentle reminder that the Term I fee balance of UGX 300,000 is due on ${year}-02-28. Pay via MTN/Airtel MoMo or Bank. Thank you - SchoolSoul.`,
        reminderType: 'Upcoming Due Date',
        status: 'Sent',
        sentAt: new Date().toISOString(),
        scheduledDate: `${year}-02-15`,
      };
      await db.paymentReminders.put(sampleReminder);
    }
  }
} catch (err) {
  console.warn('seedSampleFinanceDataIfEmpty warning (handled):', err);
} finally {
  isSeedingFinancePromise = null;
}
})();

return isSeedingFinancePromise;
}

// ==========================================
// FEE STRUCTURE API
// ==========================================
export async function getFeeStructures(): Promise<FeeStructure[]> {
  await seedSampleFinanceDataIfEmpty();
  return db.feeStructures.reverse().toArray();
}

export async function createFeeStructure(data: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<FeeStructure> {
  const mandatoryTotal = data.items
    .filter((i) => i.isMandatory)
    .reduce((sum, item) => sum + item.amountUGX, 0);

  const newStructure: FeeStructure = {
    ...data,
    id: `fs-${Date.now()}`,
    totalMandatoryAmountUGX: mandatoryTotal,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.feeStructures.add(newStructure);

  // Sync queue & audit log
  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: data.createdBy || 'current-user',
    username: 'Bursar',
    userRole: 'Bursar',
    action: 'FEE_STRUCTURE_CREATE',
    details: `Created Fee Structure "${newStructure.title}" (${newStructure.classGrade} ${newStructure.term} - UGX ${mandatoryTotal})`,
  });

  if (!isServerOnline()) {
    await queueOfflineAction('fee_structure', 'CREATE', newStructure);
  }

  return newStructure;
}

export async function updateFeeStructure(id: string, updates: Partial<FeeStructure>): Promise<void> {
  const existing = await db.feeStructures.get(id);
  if (!existing) throw new Error('Fee Structure not found');

  const updatedItems = updates.items || existing.items;
  const mandatoryTotal = updatedItems
    .filter((i) => i.isMandatory)
    .reduce((sum, item) => sum + item.amountUGX, 0);

  const updated: FeeStructure = {
    ...existing,
    ...updates,
    totalMandatoryAmountUGX: mandatoryTotal,
    version: (existing.version || 1) + 1,
    updatedAt: new Date().toISOString(),
  };

  await db.feeStructures.put(updated);

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: 'Bursar',
    userRole: 'Bursar',
    action: 'FEE_STRUCTURE_UPDATE',
    details: `Updated Fee Structure "${updated.title}" to version ${updated.version}`,
  });
}

// ==========================================
// STUDENT FEE ACCOUNTS & BALANCE COMPUTATION
// ==========================================
export async function getStudentFeeAccounts(): Promise<StudentFeeAccount[]> {
  await seedSampleFinanceDataIfEmpty();
  
  // Ensure every active student has a fee account
  const students = await db.students.toArray();
  const accounts = await db.studentFeeAccounts.toArray();
  const year = new Date().getFullYear().toString();

  const missingStudents = students.filter((s) => !accounts.some((a) => a.studentId === s.id));
  
  if (missingStudents.length > 0) {
    const feeStructures = await db.feeStructures.toArray();
    const defaultStructure = feeStructures.find((f) => f.status === 'Active') || feeStructures[0];
    const defaultBilled = defaultStructure ? defaultStructure.totalMandatoryAmountUGX : 700000;

    const newAccounts: StudentFeeAccount[] = missingStudents.map((student) => ({
      id: `sfa-${student.id}`,
      studentId: student.id,
      studentName: student.fullName,
      admissionNumber: student.admissionNumber,
      classGrade: student.classGrade,
      stream: student.stream,
      residenceType: student.residenceType,
      academicYear: year,
      term: 'Term I',
      feeStructureId: defaultStructure?.id,
      totalBilledUGX: defaultBilled,
      totalDiscountUGX: 0,
      totalScholarshipUGX: 0,
      netBilledUGX: defaultBilled,
      totalPaidUGX: 0,
      outstandingBalanceUGX: defaultBilled,
      overpaymentUGX: 0,
      status: 'Unpaid',
      updatedAt: new Date().toISOString(),
    }));

    await db.studentFeeAccounts.bulkPut(newAccounts);
    return db.studentFeeAccounts.reverse().toArray();
  }

  return accounts.reverse();
}

export async function getStudentFeeAccountByStudentId(studentId: string): Promise<StudentFeeAccount | undefined> {
  await getStudentFeeAccounts(); // ensure initialized
  const accounts = await db.studentFeeAccounts.where('studentId').equals(studentId).toArray();
  return accounts[0];
}

// Recalculate Student Fee Account
export async function recalculateStudentAccount(studentId: string): Promise<StudentFeeAccount> {
  let account = await getStudentFeeAccountByStudentId(studentId);
  const student = await db.students.get(studentId);
  
  if (!account) {
    if (!student) throw new Error('Student not found');
    const year = new Date().getFullYear().toString();
    account = {
      id: `sfa-${student.id}`,
      studentId: student.id,
      studentName: student.fullName,
      admissionNumber: student.admissionNumber,
      classGrade: student.classGrade,
      stream: student.stream,
      residenceType: student.residenceType,
      academicYear: year,
      term: 'Term I',
      totalBilledUGX: 700000,
      totalDiscountUGX: 0,
      totalScholarshipUGX: 0,
      netBilledUGX: 700000,
      totalPaidUGX: 0,
      outstandingBalanceUGX: 700000,
      overpaymentUGX: 0,
      status: 'Unpaid',
      updatedAt: new Date().toISOString(),
    };
  }

  // Calculate total active scholarships / discounts
  const activeScholarships = await db.scholarships
    .where('studentId')
    .equals(studentId)
    .filter((s) => s.status === 'Active')
    .toArray();

  const totalScholarshipUGX = activeScholarships.reduce((sum, sch) => sum + sch.calculatedAmountUGX, 0);

  // Calculate total completed payments
  const completedPayments = await db.paymentRecords
    .where('studentId')
    .equals(studentId)
    .filter((p) => p.status === 'Completed')
    .toArray();

  const totalPaidUGX = completedPayments.reduce((sum, pay) => sum + pay.amountPaidUGX, 0);

  const netBilledUGX = Math.max(0, account.totalBilledUGX - account.totalDiscountUGX - totalScholarshipUGX);
  const outstandingBalanceUGX = Math.max(0, netBilledUGX - totalPaidUGX);
  const overpaymentUGX = totalPaidUGX > netBilledUGX ? totalPaidUGX - netBilledUGX : 0;

  let status: StudentFeeAccount['status'] = 'Unpaid';
  if (totalPaidUGX >= netBilledUGX) {
    status = overpaymentUGX > 0 ? 'Overpaid' : 'Paid';
  } else if (totalPaidUGX > 0) {
    status = 'Partial';
  } else {
    status = 'Unpaid';
  }

  const lastPay = completedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const updatedAccount: StudentFeeAccount = {
    ...account,
    totalScholarshipUGX,
    netBilledUGX,
    totalPaidUGX,
    outstandingBalanceUGX,
    overpaymentUGX,
    status,
    lastPaymentDate: lastPay ? lastPay.date : account.lastPaymentDate,
    updatedAt: new Date().toISOString(),
  };

  await db.studentFeeAccounts.put(updatedAccount);
  return updatedAccount;
}

// ==========================================
// PAYMENT PROCESSING & RECEIPT ENGINE
// ==========================================
export async function getPaymentRecords(): Promise<PaymentRecord[]> {
  await seedSampleFinanceDataIfEmpty();
  return db.paymentRecords.reverse().toArray();
}

export async function processPayment(params: {
  studentId: string;
  amountPaidUGX: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: 'MTN' | 'Airtel';
  bankName?: string;
  notes?: string;
  cashierName: string;
  cashierId: string;
}): Promise<{ payment: PaymentRecord; updatedAccount: StudentFeeAccount }> {
  const account = await recalculateStudentAccount(params.studentId);
  const year = new Date().getFullYear().toString();
  const count = await db.paymentRecords.count();
  const receiptNumber = `REC-${year}-${(count + 1).toString().padStart(4, '0')}`;
  
  const txRef = params.transactionReference || 
    (params.paymentMethod.includes('Mobile Money')
      ? `${params.mobileMoneyProvider || 'MM'}-${Math.floor(10000000 + Math.random() * 90000000)}`
      : `TX-${Math.floor(100000 + Math.random() * 900000)}`);

  const prevBalance = account.outstandingBalanceUGX;
  const newBal = Math.max(0, prevBalance - params.amountPaidUGX);
  const payType: PaymentType = params.amountPaidUGX >= prevBalance ? (params.amountPaidUGX > prevBalance ? 'Overpayment' : 'Full') : 'Partial';

  const verificationCode = generateVerificationCode(receiptNumber, params.amountPaidUGX, params.studentId);
  const qrPayload = JSON.stringify({
    receipt: receiptNumber,
    studentId: params.studentId,
    studentName: account.studentName,
    amountUGX: params.amountPaidUGX,
    code: verificationCode,
    date: new Date().toISOString().split('T')[0],
  });

  const payment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    receiptNumber,
    studentId: params.studentId,
    studentName: account.studentName,
    admissionNumber: account.admissionNumber,
    classGrade: account.classGrade,
    academicYear: account.academicYear,
    term: account.term,
    amountPaidUGX: params.amountPaidUGX,
    previousBalanceUGX: prevBalance,
    newBalanceUGX: newBal,
    paymentType: payType,
    paymentMethod: params.paymentMethod,
    transactionReference: txRef,
    bankName: params.bankName,
    mobileMoneyNumber: params.mobileMoneyNumber,
    mobileMoneyProvider: params.mobileMoneyProvider,
    status: 'Completed',
    cashierId: params.cashierId,
    cashierName: params.cashierName,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    verificationCode,
    qrPayload,
    notes: params.notes,
    isOfflineCaptured: !isServerOnline(),
  };

  await db.paymentRecords.add(payment);

  // Auto record in Financial Transactions (Income)
  const incomeTx: FinancialTransaction = {
    id: `tx-pay-${payment.id}`,
    transactionType: 'Income',
    category: 'Fees',
    amountUGX: params.amountPaidUGX,
    description: `Fee Payment Received - ${account.studentName} (${payment.receiptNumber})`,
    receiptOrRefNumber: payment.receiptNumber,
    paymentMethod: params.paymentMethod,
    payerOrPayeeName: `${account.studentName} (${account.admissionNumber})`,
    approvalStatus: 'Approved',
    approvedBy: params.cashierName,
    recordedBy: params.cashierName,
    date: payment.date,
    timestamp: payment.timestamp,
  };
  await db.financialTransactions.add(incomeTx);

  // Recalculate account
  const updatedAccount = await recalculateStudentAccount(params.studentId);

  // Add Audit Log
  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: params.cashierId,
    username: params.cashierName,
    userRole: 'Bursar',
    action: 'PAYMENT_RECORD',
    details: `Processed payment of ${formatUGX(params.amountPaidUGX)} via ${params.paymentMethod} for ${account.studentName} (${receiptNumber})`,
  });

  if (!isServerOnline()) {
    await queueOfflineAction('payment_record', 'CREATE', payment);
  }

  return { payment, updatedAccount };
}

// Reverse Payment (Financial Security / Bursar Authorization)
export async function reversePayment(paymentId: string, reason: string, authorizedBy: string): Promise<void> {
  const payment = await db.paymentRecords.get(paymentId);
  if (!payment) throw new Error('Payment record not found');
  if (payment.status === 'Reversed') throw new Error('Payment is already reversed');

  await db.paymentRecords.update(paymentId, {
    status: 'Reversed',
    notes: `REVERSED by ${authorizedBy}: ${reason}. Original notes: ${payment.notes || ''}`,
  });

  // Add negative financial transaction reversal entry
  await db.financialTransactions.add({
    id: `tx-rev-${Date.now()}`,
    transactionType: 'Expense',
    category: 'Other Expense',
    amountUGX: payment.amountPaidUGX,
    description: `REVERSAL of Payment ${payment.receiptNumber} - ${reason}`,
    receiptOrRefNumber: payment.receiptNumber,
    paymentMethod: payment.paymentMethod,
    payerOrPayeeName: payment.studentName,
    approvalStatus: 'Approved',
    approvedBy: authorizedBy,
    recordedBy: authorizedBy,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
  });

  await recalculateStudentAccount(payment.studentId);

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: authorizedBy,
    userRole: 'Bursar',
    action: 'PAYMENT_REVERSAL',
    details: `Reversed payment ${payment.receiptNumber} of UGX ${payment.amountPaidUGX}. Reason: ${reason}`,
  });
}

// ==========================================
// MOBILE MONEY PROVIDER ABSTRACTION LAYER
// ==========================================
export async function initiateMobileMoneyPrompt(params: {
  provider: 'MTN Mobile Money' | 'Airtel Money';
  phoneNumber: string;
  studentId: string;
  studentName: string;
  amountUGX: number;
  cashierName: string;
  cashierId: string;
}): Promise<MobileMoneyRequest> {
  const ref = `MM-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
  const extTxId = `${params.provider === 'MTN Mobile Money' ? 'MTN' : 'AIR'}-${Date.now().toString().slice(-8)}`;

  const request: MobileMoneyRequest = {
    id: `mm-${Date.now()}`,
    provider: params.provider,
    phoneNumber: params.phoneNumber,
    studentId: params.studentId,
    studentName: params.studentName,
    amountUGX: params.amountUGX,
    referenceNumber: ref,
    externalTransactionId: extTxId,
    status: 'Pending Authorization',
    initiatedBy: params.cashierName,
    timestamp: new Date().toISOString(),
  };

  await db.mobileMoneyRequests.add(request);
  return request;
}

// Confirm Mobile Money Transaction (Simulated Provider STK Response)
export async function confirmMobileMoneyPayment(
  requestId: string,
  isSuccessful: boolean,
  cashierName: string,
  cashierId: string
): Promise<{ request: MobileMoneyRequest; payment?: PaymentRecord }> {
  const req = await db.mobileMoneyRequests.get(requestId);
  if (!req) throw new Error('Mobile Money request not found');

  if (!isSuccessful) {
    await db.mobileMoneyRequests.update(requestId, {
      status: 'Failed',
      failureReason: 'User cancelled USSD prompt or insufficient Mobile Money wallet balance.',
    });
    const updated = await db.mobileMoneyRequests.get(requestId);
    return { request: updated! };
  }

  await db.mobileMoneyRequests.update(requestId, {
    status: 'Successful',
  });

  // Process the fee payment automatically
  const { payment } = await processPayment({
    studentId: req.studentId,
    amountPaidUGX: req.amountUGX,
    paymentMethod: req.provider,
    mobileMoneyNumber: req.phoneNumber,
    mobileMoneyProvider: req.provider === 'MTN Mobile Money' ? 'MTN' : 'Airtel',
    transactionReference: req.externalTransactionId,
    notes: `Mobile Money Payment via ${req.provider} (${req.referenceNumber})`,
    cashierName,
    cashierId,
  });

  await db.mobileMoneyRequests.update(requestId, {
    status: 'Reconciled',
  });

  const finalReq = await db.mobileMoneyRequests.get(requestId);
  return { request: finalReq!, payment };
}

// ==========================================
// SCHOLARSHIPS & DISCOUNTS ENGINE
// ==========================================
export async function getScholarships(): Promise<ScholarshipRecord[]> {
  await seedSampleFinanceDataIfEmpty();
  return db.scholarships.reverse().toArray();
}

export async function grantScholarship(data: Omit<ScholarshipRecord, 'id' | 'createdAt' | 'calculatedAmountUGX'>): Promise<ScholarshipRecord> {
  const account = await getStudentFeeAccountByStudentId(data.studentId);
  const baseBilled = account ? account.totalBilledUGX : 700000;
  
  let calcUGX = 0;
  if (data.discountValueType === 'Percentage') {
    calcUGX = Math.round((baseBilled * data.value) / 100);
  } else {
    calcUGX = Math.min(baseBilled, data.value);
  }

  const record: ScholarshipRecord = {
    ...data,
    id: `sch-${Date.now()}`,
    calculatedAmountUGX: calcUGX,
    createdAt: new Date().toISOString(),
  };

  await db.scholarships.add(record);
  await recalculateStudentAccount(data.studentId);

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: data.approvedBy,
    userRole: 'Headteacher',
    action: 'SCHOLARSHIP_GRANT',
    details: `Granted ${data.discountType} (${data.value}${data.discountValueType === 'Percentage' ? '%' : ' UGX'}) to ${data.studentName}`,
  });

  return record;
}

// ==========================================
// BUDGET ENGINE
// ==========================================
export async function getBudgets(): Promise<BudgetItem[]> {
  await seedSampleFinanceDataIfEmpty();
  return db.budgets.toArray();
}

export async function createBudget(data: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt' | 'actualSpentUGX' | 'remainingAmountUGX' | 'varianceUGX'>): Promise<BudgetItem> {
  const budget: BudgetItem = {
    ...data,
    id: `bdg-${Date.now()}`,
    actualSpentUGX: 0,
    remainingAmountUGX: data.allocatedAmountUGX,
    varianceUGX: data.allocatedAmountUGX,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.budgets.add(budget);

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: 'Bursar',
    userRole: 'Bursar',
    action: 'BUDGET_CREATE',
    details: `Created Budget "${budget.title}" (${budget.category}) - Allocated UGX ${budget.allocatedAmountUGX}`,
  });

  return budget;
}

// ==========================================
// INCOME & EXPENDITURE ENGINE
// ==========================================
export async function getFinancialTransactions(): Promise<FinancialTransaction[]> {
  await seedSampleFinanceDataIfEmpty();
  return db.financialTransactions.reverse().toArray();
}

export async function recordTransaction(params: {
  transactionType: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amountUGX: number;
  description: string;
  payeeOrPayer: string;
  paymentMethod: PaymentMethod;
  voucherNumber?: string;
  recordedBy: string;
}): Promise<FinancialTransaction> {
  const year = new Date().getFullYear().toString();
  const count = await db.financialTransactions.count();
  const voucherNumber = params.voucherNumber || `VOUCH-${year}-${(count + 1).toString().padStart(4, '0')}`;

  const requiresApproval = params.transactionType === 'Expense' && params.amountUGX > 1000000;
  const status = requiresApproval ? 'Pending Approval' : 'Approved';

  const tx: FinancialTransaction = {
    id: `tx-${Date.now()}`,
    transactionType: params.transactionType,
    category: params.category,
    amountUGX: params.amountUGX,
    description: params.description,
    voucherNumber,
    paymentMethod: params.paymentMethod,
    payerOrPayeeName: params.payeeOrPayer,
    approvalStatus: status,
    approvedBy: requiresApproval ? undefined : params.recordedBy,
    recordedBy: params.recordedBy,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
  };

  await db.financialTransactions.add(tx);

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: params.recordedBy,
    userRole: 'Bursar',
    action: 'TRANSACTION_RECORD',
    details: `Recorded ${params.transactionType} Voucher ${voucherNumber} - UGX ${params.amountUGX} (${params.category})`,
  });

  return tx;
}

export async function sendPaymentReminder(data: {
  studentId: string;
  studentName: string;
  parentPhone: string;
  outstandingBalanceUGX: number;
  dueDate: string;
  reminderType: any;
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'In-App';
  message: string;
  status: 'Queued' | 'Sent' | 'Failed' | 'Delivered';
  sentAt?: string;
}): Promise<PaymentReminder> {
  const reminder: PaymentReminder = {
    id: `rem-${Date.now()}`,
    studentId: data.studentId,
    studentName: data.studentName,
    guardianPhone: data.parentPhone,
    guardianName: 'Parent / Guardian',
    outstandingBalanceUGX: data.outstandingBalanceUGX,
    dueDate: data.dueDate,
    channel: data.channel,
    message: data.message,
    reminderType: 'Overdue Fee Warning',
    status: 'Sent',
    sentAt: new Date().toISOString(),
    scheduledDate: new Date().toISOString().split('T')[0],
  };

  await db.paymentReminders.add(reminder);

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: 'Bursar',
    userRole: 'Bursar',
    action: 'REMINDER_SEND',
    details: `Sent ${data.channel} fee reminder to parent of ${data.studentName} (${formatUGX(data.outstandingBalanceUGX)})`,
  });

  return reminder;
}

export async function approveExpenseTransaction(txId: string, approvedBy: string): Promise<void> {
  await db.financialTransactions.update(txId, {
    approvalStatus: 'Approved',
    approvedBy,
  });

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: approvedBy,
    userRole: 'Headteacher',
    action: 'TRANSACTION_RECORD',
    details: `Approved Expense Transaction ${txId}`,
  });
}

// ==========================================
// PAYMENT REMINDERS ENGINE
// ==========================================
export async function getPaymentReminders(): Promise<PaymentReminder[]> {
  await seedSampleFinanceDataIfEmpty();
  return db.paymentReminders.reverse().toArray();
}

export async function generateOverdueReminders(channel: 'SMS' | 'WhatsApp' | 'Email' | 'In-App'): Promise<number> {
  const accounts = await getStudentFeeAccounts();
  const overdueAccounts = accounts.filter((a) => a.outstandingBalanceUGX > 0);
  const students = await db.students.toArray();
  const guardians = await db.guardians.toArray();
  const today = new Date().toISOString().split('T')[0];

  let generatedCount = 0;

  for (const acc of overdueAccounts) {
    const guardian = guardians.find((g) => g.studentId === acc.studentId && g.isPrimaryContact) || guardians[0];
    const phone = guardian ? guardian.phoneNumber : '0772000000';
    const guardianName = guardian ? guardian.fullName : 'Parent / Guardian';

    const msg = `Dear ${guardianName}, this is a reminder from SchoolSoul regarding ${acc.studentName} (${acc.classGrade}). Outstanding Fee Balance: ${formatUGX(acc.outstandingBalanceUGX)}. Please pay via Mobile Money (MTN/Airtel) or Bank to clear the account. Thank you.`;

    const reminder: PaymentReminder = {
      id: `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: acc.studentId,
      studentName: acc.studentName,
      guardianPhone: phone,
      guardianName,
      outstandingBalanceUGX: acc.outstandingBalanceUGX,
      dueDate: `${new Date().getFullYear()}-03-31`,
      channel,
      message: msg,
      reminderType: 'Overdue Fee Warning',
      status: 'Sent',
      sentAt: new Date().toISOString(),
      scheduledDate: today,
    };

    await db.paymentReminders.add(reminder);
    generatedCount++;
  }

  await db.auditLogs.add({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    username: 'System Automated',
    userRole: 'Bursar',
    action: 'REMINDER_SEND',
    details: `Dispatched ${generatedCount} payment reminders via ${channel}`,
  });

  return generatedCount;
}
