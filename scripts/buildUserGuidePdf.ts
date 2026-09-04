import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

async function generateAuthoritativeUserGuidePDF() {
  const pdfDoc = await PDFDocument.create();
  
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28; // A4 width in points (8.27 x 11.69 inches)
  const pageHeight = 841.89; // A4 height
  const marginX = 54;
  const contentWidth = pageWidth - marginX * 2;

  function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // -------------------------------------------------------------
  // PAGE 1: Title, Purpose, Scope
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 65;

    // Main Title
    const titleText = 'SchoolSoul OS 2026.1.0';
    const titleWidth = fontHelveticaBold.widthOfTextAtSize(titleText, 22);
    page.drawText(titleText, {
      x: (pageWidth - titleWidth) / 2,
      y: y,
      size: 22,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 32;

    // Subtitle
    const subTitleText = 'USER GUIDELINE & OPERATIONS BOOK';
    const subTitleWidth = fontHelveticaBold.widthOfTextAtSize(subTitleText, 16);
    page.drawText(subTitleText, {
      x: (pageWidth - subTitleWidth) / 2,
      y: y,
      size: 16,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 34;

    // Lead text
    const leadText = 'A practical guide to navigating SchoolSoul, understanding dashboards, using buttons, completing workflows, and operating the School Market and Pesapal payment features.';
    const leadLines = wrapText(leadText, fontHelvetica, 10, contentWidth - 40);
    for (const line of leadLines) {
      const lineWidth = fontHelvetica.widthOfTextAtSize(line, 10);
      page.drawText(line, {
        x: (pageWidth - lineWidth) / 2,
        y: y,
        size: 10,
        font: fontHelvetica,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 15;
    }
    y -= 25;

    // Section 1: Purpose
    page.drawText('Purpose', {
      x: marginX,
      y: y,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    const p1 = 'This book explains the SchoolSoul OS capabilities that are documented as implemented in the current 2026.1.0 release candidate. It is organized so that a new user can understand the system, find the correct screen, use the available controls, and complete common tasks safely.';
    const p1Lines = wrapText(p1, fontHelvetica, 9.5, contentWidth);
    for (const line of p1Lines) {
      page.drawText(line, { x: marginX, y, size: 9.5, font: fontHelvetica, color: rgb(0.1, 0.1, 0.1) });
      y -= 14;
    }
    y -= 8;

    const p2 = 'Important current payment state: Pesapal 3.0 is the exclusive active payment architecture, Flutterwave is disabled, and PAYMENTS_ENABLED remains false until the owner performs the required controlled live-payment authorization and production credential activation.';
    const p2Lines = wrapText(p2, fontHelvetica, 9.5, contentWidth);
    for (const line of p2Lines) {
      page.drawText(line, { x: marginX, y, size: 9.5, font: fontHelvetica, color: rgb(0.1, 0.1, 0.1) });
      y -= 14;
    }
    y -= 25;

    // Section 2: Current verified scope
    page.drawText('Current verified scope', {
      x: marginX,
      y: y,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    const p3 = 'The latest audit records 128 registered views, 76 navigation nodes, 14 operational dashboards, 342 interactive controls, 68 backend API endpoints, 112 database operations, 26 end-to-end workflows, and 34/34 acceptance tests passing. These figures are audit measurements, not a promise that every screen looks identical on every device.';
    const p3Lines = wrapText(p3, fontHelvetica, 9.5, contentWidth);
    for (const line of p3Lines) {
      page.drawText(line, { x: marginX, y, size: 9.5, font: fontHelvetica, color: rgb(0.1, 0.1, 0.1) });
      y -= 14;
    }
  }

  // -------------------------------------------------------------
  // PAGE 2: 1. Understanding SchoolSoul, Navigation, Button Rule
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 55;

    page.drawText('1. UNDERSTANDING SCHOOLSOUL', {
      x: marginX,
      y,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 18;

    const intro = 'SchoolSoul is organized around role-based access. Your account determines which dashboards, navigation items, records, actions, and administrative controls you can see and use. The documented roles are Platform Administrator, School Administrator, DOS/Headteacher, Teacher, Bursar, Student, and Parent.';
    const introLines = wrapText(intro, fontHelvetica, 9.5, contentWidth);
    for (const line of introLines) {
      page.drawText(line, { x: marginX, y, size: 9.5, font: fontHelvetica });
      y -= 14;
    }
    y -= 12;

    page.drawText('Everyday navigation', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 16;

    const navItems = [
      '• Navigation / Sidebar: opens the main areas available to your role. The audit identifies 76 primary navigation nodes.',
      '• Header controls: provide access to available account/system actions and contextual controls.',
      '• Mobile drawer: provides the same role-appropriate navigation on smaller screens.',
      '• Dashboard cards: open the operational areas represented by the card.',
      '• Back / Close: returns from a detail panel, modal, drawer, or previous screen where implemented.',
      '• Search: narrows records or marketplace content using supported search fields.',
      '• Filters: narrows lists by the options provided on that screen.',
      '• Time-range controls: change the reporting period on supported dashboards.',
      '• Save / Submit: validates and sends a form to the appropriate backend operation.',
      '• Edit: opens an existing record for authorized modification.',
      '• Delete / Remove: performs the authorized removal workflow; protected records may use soft-delete behavior.',
      '• Approve / Reject: changes workflow status when the user\'s role is authorized.',
      '• Upload: sends an authorized image/video/file through validation before storage.',
      '• Download: retrieves an authorized file after ownership and content checks.',
      '• Refresh: reloads current data from the application state/backend.',
      '• Confirm / Verify: completes a protected action only after required validation.',
    ];

    for (const item of navItems) {
      const lines = wrapText(item, fontHelvetica, 9, contentWidth - 10);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], {
          x: marginX + (i > 0 ? 10 : 0),
          y,
          size: 9,
          font: fontHelvetica,
        });
        y -= 13.5;
      }
      y -= 3;
    }
    y -= 10;

    page.drawText('Button rule', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 16;

    const btnRule = 'A button should be used according to the label and context displayed on the current screen. Role restrictions are enforced server-side as well as through the interface. If a control is unavailable, the account may not have permission for that action.';
    const btnRuleLines = wrapText(btnRule, fontHelvetica, 9.5, contentWidth);
    for (const line of btnRuleLines) {
      page.drawText(line, { x: marginX, y, size: 9.5, font: fontHelvetica });
      y -= 14;
    }
  }

  // -------------------------------------------------------------
  // PAGE 3: 2. Role-by-Role Guide
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 55;

    page.drawText('2. ROLE-BY-ROLE GUIDE', {
      x: marginX,
      y,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    const rolesData = [
      {
        role: 'Platform Administrator',
        points: [
          '• Use system-level dashboards and diagnostics, tenant oversight, global frameworks, and system-health functions available to this role.',
          '• Do not expose payment secrets or credentials to ordinary users.',
          '• Use audit and system-health views to monitor platform integrity.',
        ],
      },
      {
        role: 'School Administrator',
        points: [
          '• Manage school profile and authorized users.',
          '• Manage RBAC, curriculum-related administration, backups, commercial billing, and school-level configuration available to the account.',
          '• Use dashboard controls to monitor school operations and access reports.',
        ],
      },
      {
        role: 'DOS / Headteacher',
        points: [
          '• Manage academic calendar and class assignments.',
          '• Review teacher gradebook information and compile/report academic results.',
          '• Use operational dashboards and filters to review school performance.',
        ],
      },
      {
        role: 'Teacher',
        points: [
          '• Open assigned rosters, record attendance, enter grades, post assignments, and use supported live classroom functions.',
          '• Use student/project/portfolio functions only where the role has access.',
          '• Use communication controls for authorized messaging.',
        ],
      },
      {
        role: 'Bursar',
        points: [
          '• Manage student fee ledger functions, cash-counter collections, receipts, and transaction reconciliation available to the role.',
          '• For School Market fulfillment, verify authorized pickup PINs or delivery completion according to the order workflow.',
          '• Never mark a payment as successful based only on a browser redirect; payment confirmation is server-verified.',
        ],
      },
      {
        role: 'Student',
        points: [
          '• View assigned learning information, homework and submissions, attendance history, skills passport, live classroom, projects/portfolio features, and School Market functions available to students.',
          '• Use School Market to browse products, view approved media, add items to the cart, and follow the checkout/order workflow.',
          '• Protect pickup PINs and account credentials.',
        ],
      },
      {
        role: 'Parent',
        points: [
          '• Use linked-student views, fee statements, authorized payment functions, communication, and School Market purchasing.',
          '• For School Market orders, retain the pickup PIN and follow the delivery/pickup instructions shown by the order workflow.',
        ],
      },
    ];

    for (const r of rolesData) {
      page.drawText(r.role, {
        x: marginX,
        y,
        size: 11,
        font: fontHelveticaBold,
        color: rgb(0, 0, 0),
      });
      y -= 14;

      for (const pt of r.points) {
        const lines = wrapText(pt, fontHelvetica, 9, contentWidth - 10);
        for (let i = 0; i < lines.length; i++) {
          page.drawText(lines[i], {
            x: marginX + (i > 0 ? 10 : 0),
            y,
            size: 9,
            font: fontHelvetica,
          });
          y -= 12.5;
        }
      }
      y -= 7;
    }
  }

  // -------------------------------------------------------------
  // PAGE 4: 3. School Market User Guide
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 55;

    page.drawText('3. SCHOOL MARKET USER GUIDE', {
      x: marginX,
      y,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 18;

    const intro = 'The current audit documents School Market catalog navigation, search/filtering, product media, cart calculations, order reservation, payment routing, pickup PIN fulfillment, stock protection, and delivery/pickup state transitions.';
    const introLines = wrapText(intro, fontHelvetica, 9.5, contentWidth);
    for (const line of introLines) {
      page.drawText(line, { x: marginX, y, size: 9.5, font: fontHelvetica });
      y -= 13.5;
    }
    y -= 10;

    const sections = [
      {
        title: 'Browsing and product details',
        points: [
          '• Search: find available marketplace listings.',
          '• Filters: narrow products using the available category/price/location or other displayed criteria.',
          '• Product card: opens the product detail view.',
          '• Image viewer: displays validated product images.',
          '• Video preview: plays supported product video media where supplied.',
          '• Add to cart: places the selected product/variant in the cart.',
          '• Cart: reviews quantities, prices, applicable market fee, and total before checkout.',
        ],
      },
      {
        title: 'Seller/product media controls',
        points: [
          '• Product media is validated server-side using file signatures (magic bytes).',
          '• Documented supported market images include JPEG, PNG, WebP, and GIF.',
          '• Documented supported market video formats include MP4 and WebM.',
          '• The current documented media limits are 5 MB for images and 30 MB for video, with video duration limited to 90 seconds.',
          '• Executable/path-traversal payloads are rejected by the documented validation controls.',
          '• Use the primary-image control where available to designate the main product image.',
        ],
      },
    ];

    for (const sec of sections) {
      page.drawText(sec.title, {
        x: marginX,
        y,
        size: 11,
        font: fontHelveticaBold,
        color: rgb(0, 0, 0),
      });
      y -= 15;

      for (const pt of sec.points) {
        const lines = wrapText(pt, fontHelvetica, 9, contentWidth - 10);
        for (let i = 0; i < lines.length; i++) {
          page.drawText(lines[i], {
            x: marginX + (i > 0 ? 10 : 0),
            y,
            size: 9,
            font: fontHelvetica,
          });
          y -= 13;
        }
      }
      y -= 8;
    }

    page.drawText('Checkout and market fees', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    const fees = 'The documented School Market transaction fee is: 1,000-5,000 UGX -> 50 UGX; 5,001-10,000 UGX -> 100 UGX; 10,001-50,000+ UGX -> 150 UGX. These micro-fees are isolated to School Market transactions and do not apply to institutional subscriptions or school fees.';
    const feeLines = wrapText(fees, fontHelvetica, 9, contentWidth);
    for (const line of feeLines) {
      page.drawText(line, { x: marginX, y, size: 9, font: fontHelvetica });
      y -= 13;
    }
    y -= 10;

    page.drawText('Order lifecycle', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;

    const lifecycle = 'An order remains pending until the payment is authoritatively verified. After successful server-side payment verification, the order can move to PAID and a 4-digit pickup PIN can be issued. Fulfillment is a separate state: authorized staff/seller completes pickup or delivery verification before the order reaches COMPLETED.';
    const lcLines = wrapText(lifecycle, fontHelvetica, 9, contentWidth);
    for (const line of lcLines) {
      page.drawText(line, { x: marginX, y, size: 9, font: fontHelvetica });
      y -= 13;
    }
  }

  // -------------------------------------------------------------
  // PAGE 5: 4. Pesapal, Payments & Safety
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 55;

    page.drawText('4. PESAPAL, PAYMENTS & SAFETY', {
      x: marginX,
      y,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 18;

    const intro = 'Pesapal 3.0 is the exclusive active payment provider in the documented release. Flutterwave is disabled and is not required for startup or checkout. Payment credentials are intended to remain server-side.';
    const introLines = wrapText(intro, fontHelvetica, 9.5, contentWidth);
    for (const line of introLines) {
      page.drawText(line, { x: marginX, y, size: 9.5, font: fontHelvetica });
      y -= 13.5;
    }
    y -= 10;

    page.drawText('Card payment', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    const card = 'The documented card flow redirects to Pesapal\'s 3D-Secure experience. SchoolSoul does not capture or store raw card numbers, CVVs, or PINs.';
    for (const line of wrapText(card, fontHelvetica, 9, contentWidth)) {
      page.drawText(line, { x: marginX, y, size: 9, font: fontHelvetica });
      y -= 13;
    }
    y -= 8;

    page.drawText('Mobile Money', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    const mmPoints = [
      '• MTN Mobile Money and Airtel Money are presented as separate payment flows.',
      '• The documented flows request a mobile phone number and normalize it to E.164 format.',
      '• Do not enter card details into a Mobile Money flow.',
      '• Follow the payment instructions presented by Pesapal and your mobile-money provider.',
    ];
    for (const pt of mmPoints) {
      for (const line of wrapText(pt, fontHelvetica, 9, contentWidth - 10)) {
        page.drawText(line, { x: marginX, y, size: 9, font: fontHelvetica });
        y -= 13;
      }
    }
    y -= 8;

    page.drawText('Payment verification', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    const pvPoints = [
      '• Browser callbacks are not treated as authoritative payment proof.',
      '• Pesapal IPN notifications are processed with duplicate protection.',
      '• The server verifies payment status with Pesapal before changing protected order/payment state.',
      '• Amount and currency are checked against the internal invoice/ledger.',
      '• Idempotency protection prevents duplicate billing/ledger entries.',
      '• Cryptographic receipts are issued only after confirmed payment in the documented workflow.',
    ];
    for (const pt of pvPoints) {
      for (const line of wrapText(pt, fontHelvetica, 9, contentWidth - 10)) {
        page.drawText(line, { x: marginX, y, size: 9, font: fontHelvetica });
        y -= 13;
      }
    }
    y -= 8;

    page.drawText('Current live-payment gate', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    const gate = 'PAYMENTS_ENABLED=false. The latest reports state that no real production transaction has been executed and merchant settlement has not been verified because merchant-portal access/live credentials are still required. Therefore users should not treat the current release as having completed a real-money production payment test.';
    for (const line of wrapText(gate, fontHelvetica, 9, contentWidth)) {
      page.drawText(line, { x: marginX, y, size: 9, font: fontHelvetica });
      y -= 13;
    }
    y -= 8;

    page.drawText('If a payment fails', {
      x: marginX,
      y,
      size: 11,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    const fails = 'Do not manually change an order to PAID. Check the payment status through the authorized workflow, allow the server verification path to complete, and use the failure/refund/dispute process available to the authorized role.';
    for (const line of wrapText(fails, fontHelvetica, 9, contentWidth)) {
      page.drawText(line, { x: marginX, y, size: 9, font: fontHelvetica });
      y -= 13;
    }
  }

  // -------------------------------------------------------------
  // PAGE 6: 5. Academics, Communication, Security, Troubleshooting, Principle
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 50;

    page.drawText('5. ACADEMICS, COMMUNICATION, FILES & SECURITY', {
      x: marginX,
      y,
      size: 13,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 16;

    const sections6 = [
      {
        title: 'Academic workflows',
        points: [
          '• Admissions and student records follow role-controlled workflows.',
          '• Attendance/Roll-Call allows authorized teachers/staff to record and review attendance.',
          '• Gradebooks allow authorized teachers to enter grades; authorized academic leadership can review.',
          '• Report-card workflows include documented QR verification support.',
          '• Student projects support draft saving, publishing, media galleries, and STEM showcase workflows.',
          '• Digital portfolios support curation and shareable portfolio URLs.',
          '• Verified credentials/skill badges use cryptographic verification and QR-authenticated credentials.',
        ],
      },
      {
        title: 'Communication and live classroom',
        points: [
          '• Direct messaging uses authorized conversation/thread access.',
          '• Bulk SMS templates and WhatsApp alerts are documented as supported communication functions.',
          '• Live classroom uses WebRTC room state, socket event broadcasts, and participant controls.',
          '• Use only communication features visible and authorized for your role.',
        ],
      },
      {
        title: 'Offline, backup and restore',
        points: [
          '• Offline actions use a client queue and synchronize when connectivity returns.',
          '• Offline payment bypass is prohibited; payment confirmation requires live server verification.',
          '• Encrypted snapshot backups include metadata and audit logging.',
          '• Restore workflows validate archives/checksums and apply tenant-aware restoration controls.',
        ],
      },
      {
        title: 'Security rules every user should follow',
        points: [
          '• Never share your password, session credentials, pickup PIN, or payment information unnecessarily.',
          '• Do not upload executable files or disguised malicious payloads.',
          '• Use only records and dashboards your role authorizes.',
          '• Do not attempt to bypass payment verification, RBAC, tenant boundaries, or inactivity controls.',
          '• Use logout and account-protection controls when finished on shared devices.',
          '• Report suspicious activity to the authorized school/system administrator.',
        ],
      },
    ];

    for (const sec of sections6) {
      page.drawText(sec.title, {
        x: marginX,
        y,
        size: 10,
        font: fontHelveticaBold,
        color: rgb(0, 0, 0),
      });
      y -= 13;

      for (const pt of sec.points) {
        const lines = wrapText(pt, fontHelvetica, 8.5, contentWidth - 10);
        for (let i = 0; i < lines.length; i++) {
          page.drawText(lines[i], {
            x: marginX + (i > 0 ? 10 : 0),
            y,
            size: 8.5,
            font: fontHelvetica,
          });
          y -= 11.5;
        }
      }
      y -= 5;
    }

    page.drawText('6. QUICK TROUBLESHOOTING', {
      x: marginX,
      y,
      size: 12,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 14;

    const troublePoints = [
      '• Button unavailable: check whether the account role permits the action.',
      '• Data not visible: refresh, verify the selected school/context, search/filter settings, and account permissions.',
      '• Upload rejected: check supported format, file size, and media duration.',
      '• Payment pending: do not repeat payment immediately; allow the authorized server verification workflow to determine status.',
      '• Order not completed: payment and fulfillment are separate; complete the authorized pickup/delivery verification.',
      '• Session locked: re-authenticate according to the account\'s security flow.',
    ];
    for (const pt of troublePoints) {
      const lines = wrapText(pt, fontHelvetica, 8.5, contentWidth - 10);
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], {
          x: marginX + (i > 0 ? 10 : 0),
          y,
          size: 8.5,
          font: fontHelvetica,
        });
        y -= 11.5;
      }
    }
    y -= 6;

    page.drawText('FINAL USER PRINCIPLE', {
      x: marginX,
      y,
      size: 10,
      font: fontHelveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= 13;

    const principle = 'SchoolSoul is role-driven and workflow-driven. Use the navigation item that matches your task, read the action label before submitting, verify important records before finalizing them, and never bypass server-side security or payment verification.';
    const prLines = wrapText(principle, fontHelvetica, 8.5, contentWidth);
    for (const line of prLines) {
      page.drawText(line, { x: marginX, y, size: 8.5, font: fontHelvetica });
      y -= 11.5;
    }
  }

  // -------------------------------------------------------------
  // PAGE 7: Header note
  // -------------------------------------------------------------
  {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawText('SchoolSoul OS 2026.1.0 - User Guideline Book', {
      x: marginX,
      y: pageHeight - 55,
      size: 10,
      font: fontHelvetica,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

async function main() {
  console.log('Generating authoritative SchoolSoul OS 2026.1.0 User Guideline Book PDF...');
  const pdfBytes = await generateAuthoritativeUserGuidePDF();

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const targets = [
    path.join(publicDir, 'SchoolSoul_OS_User_Guideline_Book_2026.1.0.pdf'),
    path.join(publicDir, 'SchoolSoul_OS_2026.1.0_Official_User_Guide.pdf'),
    path.join(process.cwd(), 'SchoolSoul_OS_User_Guideline_Book_2026.1.0.pdf'),
  ];

  for (const target of targets) {
    fs.writeFileSync(target, pdfBytes);
    console.log(`Saved: ${target} (${pdfBytes.length} bytes)`);
  }

  const hash = crypto.createHash('sha256').update(pdfBytes).digest('hex');
  console.log(`SHA-256 Checksum: ${hash}`);
  console.log(`Total Pages: 7`);
}

main().catch(err => {
  console.error('Failed to generate user guide PDF:', err);
  process.exit(1);
});
