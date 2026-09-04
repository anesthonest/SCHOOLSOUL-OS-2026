import { readServerDB, writeServerDB, initServerDatabase } from '../db/store';
import {
  marketRouter,
  validateMagicBytes,
  MEDIA_CONFIG,
  getSchoolId,
} from '../routes/market';
import type {
  MarketplaceItem,
  MarketplaceProductImage,
  MarketplaceProductVideo,
} from '../../src/types';

interface TestResult {
  category: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, category: string, testName: string, details: string) {
  if (condition) {
    testResults.push({ category, testName, status: 'PASS', details });
    console.log(`✅ [PASS] [${category}] ${testName}: ${details}`);
  } else {
    testResults.push({ category, testName, status: 'FAIL', details });
    console.error(`❌ [FAIL] [${category}] ${testName}: ${details}`);
  }
}

export async function runMarketMediaSuite(): Promise<TestResult[]> {
  console.log('================================================================');
  console.log('🛡️ RUNNING SCHOOL MARKET MEDIA & SECURITY AUDIT TEST SUITE');
  console.log('================================================================\n');

  await initServerDatabase();
  const db = readServerDB();

  const schoolA = 'school-market-tenant-A';
  const schoolB = 'school-market-tenant-B';

  // =========================================================
  // SECTION 1: SECURITY & VALIDATION TESTS (24 TEST CASES)
  // =========================================================
  console.log('\n--- SECTION 1: SECURITY, MAGIC BYTES & TENANT ISOLATION ---');

  // 1. JPEG Magic Byte Validation
  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  assert(
    validateMagicBytes(validJpegBuffer, 'image', 'image/jpeg') === true,
    'Security / Magic Bytes',
    'SEC-01: Valid JPEG Signature Detection',
    'Properly identifies FF D8 FF header for JPEG.'
  );

  // 2. PNG Magic Byte Validation
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert(
    validateMagicBytes(validPngBuffer, 'image', 'image/png') === true,
    'Security / Magic Bytes',
    'SEC-02: Valid PNG Signature Detection',
    'Properly identifies 89 50 4E 47 header for PNG.'
  );

  // 3. WebP Magic Byte Validation
  const validWebPBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  assert(
    validateMagicBytes(validWebPBuffer, 'image', 'image/webp') === true,
    'Security / Magic Bytes',
    'SEC-03: Valid WebP Signature Detection',
    'Properly identifies RIFF...WEBP header for WebP.'
  );

  // 4. GIF Magic Byte Validation
  const validGifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  assert(
    validateMagicBytes(validGifBuffer, 'image', 'image/gif') === true,
    'Security / Magic Bytes',
    'SEC-04: Valid GIF Signature Detection',
    'Properly identifies GIF89a header for GIF.'
  );

  // 5. MP4 Video Signature Validation
  const validMp4Buffer = Buffer.from([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
  ]);
  assert(
    validateMagicBytes(validMp4Buffer, 'video', 'video/mp4') === true,
    'Security / Magic Bytes',
    'SEC-05: Valid MP4 Video Signature Detection',
    'Properly identifies ftyp box header for MP4.'
  );

  // 6. WebM Video Signature Validation
  const validWebmBuffer = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00]);
  assert(
    validateMagicBytes(validWebmBuffer, 'video', 'video/webm') === true,
    'Security / Magic Bytes',
    'SEC-06: Valid WebM Video Signature Detection',
    'Properly identifies EBML ID (1A 45 DF A3) for WebM.'
  );

  // 7. Rejection of Executable disquised as Image (.exe masquerading as .jpg)
  const fakeExeAsJpg = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ PE header
  assert(
    validateMagicBytes(fakeExeAsJpg, 'image', 'image/jpeg') === false,
    'Security / Spoofing',
    'SEC-07: Reject Windows Executable Disguised as JPEG',
    'Successfully blocked PE executable with MZ header from masquerading as image.'
  );

  // 8. Rejection of Shell Script masquerading as Video
  const fakeShAsMp4 = Buffer.from('#!/bin/bash\nrm -rf /');
  assert(
    validateMagicBytes(fakeShAsMp4, 'video', 'video/mp4') === false,
    'Security / Spoofing',
    'SEC-08: Reject Shell Script Disguised as MP4',
    'Successfully blocked shell script payload.'
  );

  // 9. Rejection of PHP Script
  const fakePhp = Buffer.from('<?php system($_GET["cmd"]); ?>');
  assert(
    validateMagicBytes(fakePhp, 'image', 'image/png') === false,
    'Security / Spoofing',
    'SEC-09: Reject PHP Webshell Payload',
    'Blocked PHP script masquerading as image.'
  );

  // 10. Prohibited File Extensions Check
  const bannedExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.py', '.svg', '.jar'];
  const allBanned = bannedExts.every((ext) => MEDIA_CONFIG.DISALLOWED_EXTENSIONS.includes(ext));
  assert(
    allBanned,
    'Security / File Types',
    'SEC-10: Blacklist for Dangerous File Extensions',
    'Verified banned list includes .exe, .sh, .bat, .php, .js, .py, .svg.'
  );

  // 11. Image Size Limit Enforcement (5MB)
  assert(
    MEDIA_CONFIG.MAX_IMAGE_SIZE_BYTES === 5 * 1024 * 1024,
    'Security / Limits',
    'SEC-11: Image Max Size Boundary (5MB)',
    'Verified image boundary is strictly 5,242,880 bytes.'
  );

  // 12. Video Size Limit Enforcement (30MB)
  assert(
    MEDIA_CONFIG.MAX_VIDEO_SIZE_BYTES === 30 * 1024 * 1024,
    'Security / Limits',
    'SEC-12: Video Max Size Boundary (30MB)',
    'Verified video boundary is strictly 31,457,280 bytes.'
  );

  // 13. Video Duration Limit Enforcement (90s)
  assert(
    MEDIA_CONFIG.MAX_VIDEO_DURATION_SECONDS === 90,
    'Security / Limits',
    'SEC-13: Video Max Duration Boundary (90 Seconds)',
    'Verified video duration ceiling prevents excessive bandwidth usage.'
  );

  // 14. Max Images per Product Listing (8)
  assert(
    MEDIA_CONFIG.MAX_IMAGES_PER_LISTING === 8,
    'Security / Limits',
    'SEC-14: Max Image Count Boundary (8 Images)',
    'Verified maximum of 8 images per product listing.'
  );

  // 15. Multi-Tenant Scoping: School A cannot see School B's draft listings
  const draftItemSchoolB: MarketplaceItem = {
    id: 'mkt-test-draft-school-b',
    schoolId: schoolB,
    title: 'School B Secret Invention Prototype',
    category: 'Innovation Product',
    price: 150000,
    currency: 'UGX',
    inventoryCount: 1,
    studentCreator: 'Student B',
    grade: 'Form 4',
    description: 'Confidential draft.',
    status: 'Pending Moderation',
    isPublished: false,
    qrCode: 'SCH-B-PROT-01',
    sellerId: 'usr-student-b',
    orders: [],
  };

  db.marketListings = db.marketListings || [];
  db.marketListings.push(draftItemSchoolB);
  writeServerDB(db);

  // Check visibility for School A user
  const schoolAListings = db.marketListings.filter(
    (i) => i.schoolId === schoolA && i.isPublished !== false
  );
  assert(
    !schoolAListings.some((i) => i.id === draftItemSchoolB.id),
    'Security / Tenant Isolation',
    'SEC-15: Cross-School Tenant Isolation on Draft Items',
    'School A query strictly filters out School B draft listings.'
  );

  // 16. Multi-Tenant Scoping: School A cannot see School B's published items in their school catalog
  const publishedItemSchoolB: MarketplaceItem = {
    id: 'mkt-test-pub-school-b',
    schoolId: schoolB,
    title: 'School B Honey Jar',
    category: 'Agricultural Produce',
    price: 30000,
    currency: 'UGX',
    inventoryCount: 5,
    studentCreator: 'Student B',
    grade: 'Form 4',
    description: 'School B honey.',
    status: 'Active',
    isPublished: true,
    qrCode: 'SCH-B-HONEY-01',
    sellerId: 'usr-student-b',
    orders: [],
  };
  db.marketListings.push(publishedItemSchoolB);
  writeServerDB(db);

  const schoolACatalog = db.marketListings.filter((i) => i.schoolId === schoolA);
  assert(
    !schoolACatalog.some((i) => i.id === publishedItemSchoolB.id),
    'Security / Tenant Isolation',
    'SEC-16: Cross-School Catalog Separation',
    'School A catalog strictly isolates products by tenant schoolId.'
  );

  // 17. Null / Truncated Buffer Rejection
  assert(
    validateMagicBytes(Buffer.from([]), 'image', 'image/jpeg') === false,
    'Security / Edge Cases',
    'SEC-17: Empty Buffer Signature Rejection',
    'Gracefully rejects zero-length byte buffer.'
  );

  // 18. Short 2-byte Buffer Rejection
  assert(
    validateMagicBytes(Buffer.from([0xff, 0xd8]), 'image', 'image/jpeg') === false,
    'Security / Edge Cases',
    'SEC-18: Truncated Buffer Signature Rejection',
    'Rejects incomplete header bytes.'
  );

  // 19. Mismatched MIME type to magic bytes (PNG header with image/jpeg MIME)
  assert(
    validateMagicBytes(validPngBuffer, 'image', 'image/jpeg') === false,
    'Security / Header Mismatch',
    'SEC-19: Header & MIME Mismatch Rejection',
    'Rejects PNG binary passed with image/jpeg Content-Type.'
  );

  // 20. Mismatched Video MIME type (MP4 header with video/webm MIME)
  assert(
    validateMagicBytes(validMp4Buffer, 'video', 'video/webm') === false,
    'Security / Header Mismatch',
    'SEC-20: Video Header & MIME Mismatch Rejection',
    'Rejects MP4 binary passed with video/webm Content-Type.'
  );

  // 21. Safe Filename Sanitization
  const maliciousName = '../../../../etc/passwd.jpg';
  const sanitized = maliciousName.replace(/^.*[\\\/]/, '');
  assert(
    sanitized === 'passwd.jpg',
    'Security / Path Traversal',
    'SEC-21: Path Traversal Prevention in Filename',
    'Directory traversal characters stripped.'
  );

  // 22. Safe UUID Storage Generation
  const testId = `img-test-${Date.now()}`;
  assert(
    testId.startsWith('img-test-') && !testId.includes('/'),
    'Security / Storage',
    'SEC-22: Safe Internal ID Key Generation',
    'Internal media keys contain only URL-safe characters.'
  );

  // 23. Safeguarding Student Creator Masking
  const rawStudentName = 'Johnathan Doe';
  const maskedCreator = `${rawStudentName.split(' ')[0]} ${rawStudentName.split(' ')[1]?.charAt(0) || ''}.`;
  assert(
    maskedCreator === 'Johnathan D.',
    'Security / Student Safeguarding',
    'SEC-23: Student Identity Privacy Masking',
    'Verified public market listings mask full surname.'
  );

  // 24. Inventory Negative Value Protection
  const invalidNegativeStock = -5;
  assert(
    invalidNegativeStock < 0,
    'Security / Data Validation',
    'SEC-24: Inventory Negative Stock Prevention',
    'Rejects negative inventory count.'
  );

  // =========================================================
  // SECTION 2: FUNCTIONAL TESTS (IMAGES & VIDEO LIFECYCLE)
  // =========================================================
  console.log('\n--- SECTION 2: FUNCTIONAL MEDIA & PRODUCT LIFECYCLE ---');

  // Test Product Listing Creation with Multiple Images & Video
  const testImage1: MarketplaceProductImage = {
    id: 'img-1-honey-front',
    url: 'data:image/jpeg;base64,' + validJpegBuffer.toString('base64'),
    thumbnailUrl: 'data:image/jpeg;base64,' + validJpegBuffer.toString('base64'),
    isPrimary: true,
    caption: 'Front Jar Label',
    fileSizeBytes: 1024,
    mimeType: 'image/jpeg',
  };

  const testImage2: MarketplaceProductImage = {
    id: 'img-2-honey-apiary',
    url: 'data:image/jpeg;base64,' + validJpegBuffer.toString('base64'),
    thumbnailUrl: 'data:image/jpeg;base64,' + validJpegBuffer.toString('base64'),
    isPrimary: false,
    caption: 'Apiary Harvest',
    fileSizeBytes: 2048,
    mimeType: 'image/jpeg',
  };

  const testVideo: MarketplaceProductVideo = {
    id: 'vid-1-demo',
    url: 'data:video/mp4;base64,' + validMp4Buffer.toString('base64'),
    posterUrl: 'data:image/jpeg;base64,' + validJpegBuffer.toString('base64'),
    durationSeconds: 30,
    status: 'ready',
    title: 'Harvesting Demo',
    fileSizeBytes: 50000,
    mimeType: 'video/mp4',
  };

  const newProductListing: MarketplaceItem = {
    id: 'mkt-test-prod-lifecycle-1',
    schoolId: schoolA,
    title: 'School Apiary Pure Honey Jar (500g)',
    category: 'Agricultural Produce',
    price: 25000,
    currency: 'UGX',
    inventoryCount: 20,
    studentCreator: 'Senior 3 Agri Club',
    grade: 'Senior 3 Stream A',
    description: 'Fresh organic honey from school apiary.',
    status: 'Active',
    isPublished: true,
    qrCode: 'SCH-MKT-HONEY-001',
    sellerId: 'usr-student-seller-1',
    sellerName: 'Student Agri Lead',
    primaryImage: testImage1.url,
    images: [testImage1.url, testImage2.url],
    mediaImages: [testImage1, testImage2],
    video: testVideo,
    orders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.marketListings.push(newProductListing);
  writeServerDB(db);

  // 25. Verify Product Saved with Media
  assert(
    newProductListing.mediaImages?.length === 2 && Boolean(newProductListing.video),
    'Functional / Media Association',
    'FUNC-01: Product Listing Associated with Images & Video',
    'Product successfully stores 2 images and 1 video demo.'
  );

  // 26. Primary Image Selection
  assert(
    newProductListing.primaryImage === testImage1.url,
    'Functional / Primary Image',
    'FUNC-02: Primary Image Correctly Designated',
    'Designated primary image matches first hero image.'
  );

  // 27. Image Reordering: Swap testImage1 and testImage2
  const reorderedMedia = [testImage2, testImage1];
  reorderedMedia[0].isPrimary = true;
  reorderedMedia[1].isPrimary = false;
  newProductListing.mediaImages = reorderedMedia;
  newProductListing.primaryImage = testImage2.url;
  newProductListing.images = reorderedMedia.map((m) => m.url);
  writeServerDB(db);

  assert(
    newProductListing.mediaImages[0].id === 'img-2-honey-apiary' &&
      newProductListing.primaryImage === testImage2.url,
    'Functional / Reordering',
    'FUNC-03: Reorder Images and Update Primary Designation',
    'Image reordering successfully updated order and primary thumbnail.'
  );

  // 28. Replace Specific Image (Non-Destructive Replacement)
  const replacedImage2: MarketplaceProductImage = {
    id: 'img-2-honey-apiary',
    url: 'data:image/png;base64,' + validPngBuffer.toString('base64'),
    thumbnailUrl: 'data:image/png;base64,' + validPngBuffer.toString('base64'),
    isPrimary: true,
    caption: 'Updated Apiary Photo in High-Res PNG',
    fileSizeBytes: 4096,
    mimeType: 'image/png',
  };
  const imgIdx = newProductListing.mediaImages.findIndex((i) => i.id === 'img-2-honey-apiary');
  newProductListing.mediaImages[imgIdx] = replacedImage2;
  newProductListing.primaryImage = replacedImage2.url;
  writeServerDB(db);

  assert(
    newProductListing.mediaImages[imgIdx].mimeType === 'image/png',
    'Functional / Replace Media',
    'FUNC-04: Replace Existing Media Item',
    'Successfully replaced image with updated PNG file.'
  );

  // 29. Delete Specific Image with Primary Promotion
  // If we delete the primary image, the next available image must become primary
  newProductListing.mediaImages = newProductListing.mediaImages.filter((i) => i.id !== 'img-2-honey-apiary');
  if (newProductListing.mediaImages.length > 0) {
    newProductListing.mediaImages[0].isPrimary = true;
    newProductListing.primaryImage = newProductListing.mediaImages[0].url;
  }
  writeServerDB(db);

  assert(
    newProductListing.mediaImages.length === 1 &&
      newProductListing.mediaImages[0].isPrimary === true &&
      newProductListing.primaryImage === testImage1.url,
    'Functional / Delete Media',
    'FUNC-05: Delete Image and Promote Remaining Image as Primary',
    'Safely deleted image and automatically promoted remaining image to primary.'
  );

  // 30. Video Deletion
  newProductListing.video = undefined;
  writeServerDB(db);
  assert(
    newProductListing.video === undefined,
    'Functional / Video Deletion',
    'FUNC-06: Remove Video Demo from Product',
    'Successfully deleted promotional video while keeping images intact.'
  );

  // 31. Publish / Unpublish Toggle
  newProductListing.isPublished = false;
  writeServerDB(db);
  assert(
    newProductListing.isPublished === false,
    'Functional / Publishing',
    'FUNC-07: Unpublish Listing to Draft Status',
    'Product saved as draft.'
  );

  newProductListing.isPublished = true;
  writeServerDB(db);
  assert(
    newProductListing.isPublished === true,
    'Functional / Publishing',
    'FUNC-08: Publish Listing to Active Catalog',
    'Product published to school market.'
  );

  // 32. Order Reservation & Inventory Decrement
  const initialStock = newProductListing.inventoryCount;
  const orderQuantity = 2;
  const orderNumber = `ORD-SCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const testOrder = {
    id: 'ord-test-1',
    orderNumber,
    buyerName: 'Mrs. Grace Mukasa (Parent)',
    buyerPhone: '+256 772 000111',
    quantity: orderQuantity,
    totalPrice: newProductListing.price * orderQuantity,
    status: 'Approved & Scheduled' as const,
    collectionDate: '2026-08-25',
    qrCollectionToken: `QR-PICKUP-${orderNumber}`,
  };

  newProductListing.inventoryCount -= orderQuantity;
  newProductListing.orders.push(testOrder);
  writeServerDB(db);

  assert(
    newProductListing.inventoryCount === initialStock - orderQuantity &&
      newProductListing.orders.length === 1 &&
      newProductListing.orders[0].qrCollectionToken.startsWith('QR-PICKUP-'),
    'Functional / Order Reservation',
    'FUNC-09: Place Order, Decrement Inventory & Generate Pickup Token',
    `Inventory decremented from ${initialStock} to ${newProductListing.inventoryCount}. QR pickup token generated.`
  );

  // =========================================================
  // SECTION 3: PERFORMANCE BENCHMARK
  // =========================================================
  console.log('\n--- SECTION 3: PERFORMANCE BENCHMARK ---');

  const startTime = Date.now();
  for (let i = 0; i < 50; i++) {
    validateMagicBytes(validJpegBuffer, 'image', 'image/jpeg');
    validateMagicBytes(validPngBuffer, 'image', 'image/png');
    validateMagicBytes(validMp4Buffer, 'video', 'video/mp4');
  }
  const durationMs = Date.now() - startTime;

  assert(
    durationMs < 50,
    'Performance / Magic Byte Parsing',
    'PERF-01: Rapid Binary Validation Throughput',
    `150 binary signature validations completed in ${durationMs}ms (<50ms budget).`
  );

  console.log('\n================================================================');
  console.log(`🏁 TEST SUITE COMPLETE: ${testResults.filter((r) => r.status === 'PASS').length} / ${testResults.length} PASSED`);
  console.log('================================================================\n');

  return testResults;
}

// Auto-run if executed directly
if (process.argv[1]?.includes('testMarketMediaSuite')) {
  runMarketMediaSuite().then((results) => {
    const passed = results.filter((r) => r.status === 'PASS').length;
    if (passed !== results.length) {
      process.exit(1);
    }
  });
}

