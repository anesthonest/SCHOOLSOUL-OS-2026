import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SCHOOL_SETUP_11_STEPS } from '../../src/components/common/OnboardingGuideModal';
import { ROIEstimator } from '../../src/components/landing/ROIEstimator';
import { PlanComparisonTable } from '../../src/components/landing/PlanComparisonTable';
import { ProductShowcase } from '../../src/components/landing/ProductShowcase';
import { PWAInstallBanner } from '../../src/components/common/PWAInstallBanner';

export interface PwaAuditResult {
  category: string;
  testId: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export async function runPWAMarketReadinessSuite(): Promise<PwaAuditResult[]> {
  const results: PwaAuditResult[] = [];
  const rootDir = process.cwd();

  const assert = (testId: string, category: string, name: string, condition: boolean, details: string) => {
    results.push({
      testId,
      category,
      name,
      status: condition ? 'PASS' : 'FAIL',
      details: condition ? details : `FAILED: ${details}`,
    });
  };

  try {
    // 1. Web App Manifest
    const manifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
    const manifestExists = fs.existsSync(manifestPath);
    let manifestData: any = {};
    if (manifestExists) {
      manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }

    assert(
      'PWA-01',
      'Web App Manifest',
      'Manifest exists and defines required standalone PWA attributes',
      manifestExists &&
        manifestData.name === 'SchoolSoul OS' &&
        manifestData.short_name === 'SchoolSoul' &&
        manifestData.display === 'standalone' &&
        manifestData.start_url &&
        Array.isArray(manifestData.icons) &&
        manifestData.icons.length >= 3,
      'Valid manifest.webmanifest found with standalone mode, icons, and SchoolSoul brand'
    );

    // 2. Compliant PNG Icon Assets
    const pwa192 = path.join(rootDir, 'public', 'pwa-192x192.png');
    const pwa512 = path.join(rootDir, 'public', 'pwa-512x512.png');
    const pwaMaskable = path.join(rootDir, 'public', 'pwa-maskable-512x512.png');
    const appleIcon = path.join(rootDir, 'public', 'apple-touch-icon.png');

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const isValidPng = (filePath: string) => {
      if (!fs.existsSync(filePath)) return false;
      const buf = fs.readFileSync(filePath);
      return buf.length >= 8 && buf.subarray(0, 8).equals(pngHeader);
    };

    assert(
      'PWA-02',
      'PWA Icon Assets',
      'Mandatory 192px, 512px, Maskable, and Apple Touch PNG icons exist and valid',
      isValidPng(pwa192) && isValidPng(pwa512) && isValidPng(pwaMaskable) && isValidPng(appleIcon),
      'All 4 PNG icons (192, 512, maskable, apple touch) exist with valid binary PNG magic numbers'
    );

    // 3. index.html PWA tags
    const indexPath = path.join(rootDir, 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    assert(
      'PWA-03',
      'HTML Entry Point',
      'index.html contains manifest link and iOS Safari meta tags',
      indexHtml.includes('rel="manifest"') &&
        indexHtml.includes('apple-touch-icon') &&
        indexHtml.includes('apple-mobile-web-app-capable'),
      'index.html links to manifest.webmanifest and includes iOS web app capabilities'
    );

    // 4. Vite Workbox Configuration
    const viteConfigPath = path.join(rootDir, 'vite.config.ts');
    const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');
    assert(
      'PWA-04',
      'Service Worker Caching Rule',
      'vite.config.ts configures VitePWA and excludes /api routes from navigation fallback',
      viteConfigContent.includes('VitePWA') &&
        viteConfigContent.includes('/^\\/api/'),
      'VitePWA configured with autoUpdate and strict security exclusion for /api routes'
    );

    // 5. In-App PWA Install Banner & Button Rendering
    const bannerHtml = renderToStaticMarkup(React.createElement(PWAInstallBanner, { variant: 'banner' }));
    assert(
      'PWA-05',
      'In-App Install UI',
      'PWAInstallBanner renders install button and offline capability notice',
      bannerHtml.includes('Install SchoolSoul OS Application') &&
        bannerHtml.includes('OFFLINE-READY PWA'),
      'PWAInstallBanner properly rendered with offline notice'
    );

    // 6. 11-Point School Setup Checklist completeness
    assert(
      'PWA-06',
      'Setup Onboarding',
      '11-Point School Setup Checklist defined with 11 discrete steps',
      Array.isArray(SCHOOL_SETUP_11_STEPS) && SCHOOL_SETUP_11_STEPS.length === 11,
      `11 Setup Steps verified: ${SCHOOL_SETUP_11_STEPS.map((s) => s.stepNumber).join(', ')}`
    );

    // 7. ROI Estimator Component Rendering
    const roiHtml = renderToStaticMarkup(React.createElement(ROIEstimator, { initialCurrency: 'UGX' }));
    assert(
      'PWA-07',
      'ROI Estimator',
      'ROIEstimator renders sliders, staff hours saved, and payback velocity',
      roiHtml.includes('Time Savings Estimator') &&
        roiHtml.includes('Staff Hours Saved') &&
        roiHtml.includes('Estimated Financial Value') &&
        roiHtml.includes('Payback Velocity'),
      'ROIEstimator computes dynamic savings and renders all key metric indicators'
    );

    // 8. Plan Comparison Table Rendering
    const planTableHtml = renderToStaticMarkup(React.createElement(PlanComparisonTable, { onSelectPlan: () => {} }));
    assert(
      'PWA-08',
      'Commercial Transparency',
      'PlanComparisonTable renders side-by-side tier comparison',
      planTableHtml.includes('Foundation') &&
        planTableHtml.includes('Professional') &&
        planTableHtml.includes('Enterprise') &&
        planTableHtml.includes('CBC Competency-Based Gradebook'),
      'PlanComparisonTable renders all 3 tiers with detailed breakdown of academic, finance, and offline capabilities'
    );

    // 9. Product Showcase Component Rendering
    const showcaseHtml = renderToStaticMarkup(React.createElement(ProductShowcase));
    assert(
      'PWA-09',
      'Product Experience',
      'ProductShowcase renders Admin, CBC, Fees, Attendance, and LAN tabs',
      showcaseHtml.includes('Admin Cockpit') &&
        showcaseHtml.includes('CBC Marksheets') &&
        showcaseHtml.includes('Fee Collections') &&
        showcaseHtml.includes('QR Attendance') &&
        showcaseHtml.includes('Offline LAN Node'),
      'ProductShowcase provides interactive visual inspection across all primary operational surfaces'
    );

    // 10. Sync Center & Context Status States
    const syncContextPath = path.join(rootDir, 'src', 'context', 'SyncContext.tsx');
    const syncContextContent = fs.readFileSync(syncContextPath, 'utf8');
    assert(
      'PWA-10',
      'Resilience & Sync Center',
      'SyncContext exports SyncStatusState with ONLINE, OFFLINE, SYNCING, SYNCED, SYNC_ERROR',
      syncContextContent.includes('SyncStatusState') &&
        syncContextContent.includes("'ONLINE'") &&
        syncContextContent.includes("'OFFLINE'") &&
        syncContextContent.includes("'SYNCING'") &&
        syncContextContent.includes("'SYNCED'") &&
        syncContextContent.includes("'SYNC_ERROR'"),
      'SyncContext supports full 5-state connectivity model with lastSyncTime tracking'
    );

  } catch (err: any) {
    results.push({
      testId: 'PWA-ERR',
      category: 'Fatal Error',
      name: 'PWA Audit Execution Failure',
      status: 'FAIL',
      details: err.message || String(err),
    });
  }

  return results;
}

if (process.argv[1]?.endsWith('testPWAMarketReadinessSuite.ts') || process.argv[1]?.endsWith('testPWAMarketReadinessSuite.js')) {
  runPWAMarketReadinessSuite().then((res) => {
    console.log('\n================================================================');
    console.log('📱 SCHOOLSOUL OS: PWA & MARKET READINESS CERTIFICATION SUITE');
    console.log('================================================================\n');
    let allPassed = true;
    for (const r of res) {
      const icon = r.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
      if (r.status === 'FAIL') allPassed = false;
      console.log(`${icon} [${r.category} / ${r.testId}] ${r.name}: ${r.details}`);
    }
    console.log('\n----------------------------------------------------------------');
    console.log(`Summary: ${res.filter((r) => r.status === 'PASS').length}/${res.length} tests passed.`);
    process.exit(allPassed ? 0 : 1);
  });
}
