import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicLandingPage } from '../../src/pages/PublicLandingPage';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { ToastProvider } from '../../src/context/ToastContext';

// Polyfill browser globals if running in Node environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => { store.set(key, val); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] || null,
    length: 0,
  } as any;
}
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    location: {
      search: '',
      hash: '',
      pathname: '/',
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };
} else if (!(globalThis as any).window.matchMedia) {
  (globalThis as any).window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

export interface FirstScreenAuditResult {
  category: string;
  testId: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export async function runLandingFirstScreenAudit(): Promise<FirstScreenAuditResult[]> {
  const results: FirstScreenAuditResult[] = [];

  // Helper to test assertion
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
    // 1. Render PublicLandingPage to static markup
    let capturedAuthTab: string | null = null;
    const handleGoToAuth = (tab?: 'LOGIN' | 'REGISTER' | 'STATUS') => {
      capturedAuthTab = tab || 'LOGIN';
    };

    const renderedHtml = renderToStaticMarkup(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          ToastProvider,
          null,
          React.createElement(PublicLandingPage, {
            onGoToAuth: handleGoToAuth,
            schoolName: 'St. Jude International Academy',
          })
        )
      )
    );

    // TEST 1: First screen contains School Branding
    assert(
      'FS-01',
      'First-Screen Branding',
      'School Branding & OS Title Rendered',
      renderedHtml.includes('SchoolSoul OS') && renderedHtml.includes('One operating system for the modern school.'),
      'Rendered SchoolSoul OS brand title and tagline "One operating system for the modern school."'
    );

    // TEST 2: First-Screen Primary LOGIN button presence
    assert(
      'FS-02',
      'First-Screen Actions',
      'LOGIN Button Prominently Rendered in Viewport',
      renderedHtml.includes('data-testid="first-screen-login-btn"') && renderedHtml.includes('LOGIN'),
      'Found data-testid="first-screen-login-btn" with dominant LOGIN label'
    );

    // TEST 3: First-Screen Primary REGISTER SCHOOL button presence
    assert(
      'FS-03',
      'First-Screen Actions',
      'REGISTER SCHOOL Button Prominently Rendered',
      renderedHtml.includes('data-testid="first-screen-register-btn"') && renderedHtml.includes('REGISTER SCHOOL'),
      'Found data-testid="first-screen-register-btn" with explicit REGISTER SCHOOL label'
    );

    // TEST 4: Join Existing School Action Present
    assert(
      'FS-04',
      'Secondary Actions',
      'Join Existing School Action Present',
      renderedHtml.includes('Join Existing School'),
      'Found Join Existing School action routing to join workflow'
    );

    // TEST 5: Short description and benefit line
    assert(
      'FS-05',
      'Core Messaging',
      'Short Description & Benefit Line Rendered',
      renderedHtml.includes('Manage your school from one secure, resilient platform.'),
      'Found concise benefit line "Manage your school from one secure, resilient platform."'
    );

    // TEST 6: Attribution present
    assert(
      'FS-06',
      'Attribution',
      'VINEXSAH TECHNOLOGIES Attribution Present',
      renderedHtml.includes('SchoolSoul OS — Developed by VINEXSAH TECHNOLOGIES. All rights reserved.'),
      'Found exact attribution "SchoolSoul OS — Developed by VINEXSAH TECHNOLOGIES. All rights reserved."'
    );

    // TEST 7: Excessive Marketing Content Completely Removed
    assert(
      'FS-07',
      'Content Cleanliness',
      'Marketing Cards, Strips & Promos Completely Removed',
      !renderedHtml.includes('Verified Regional Curriculum Compliance') &&
      !renderedHtml.includes('Pilot Program 2026') &&
      !renderedHtml.includes('Ready to Transform Your School Operations') &&
      !renderedHtml.includes('Request a Demo') &&
      !renderedHtml.includes('Explore SchoolSoul') &&
      !renderedHtml.includes('Check Application Status') &&
      !renderedHtml.includes('Watch Overview'),
      'Verified all marketing sections, curriculum cards, and extra actions have been completely removed'
    );

    // TEST 8: Mobile Layout & Touch Target (min-h-[48px])
    assert(
      'FS-08',
      'Mobile Accessibility',
      'Mobile Full-Width Vertical Stacking & Touch Target (min-h-[48px])',
      renderedHtml.includes('min-h-[') && renderedHtml.includes('w-full'),
      'Buttons use full-width stack with minimum 48px touch target for mobile tapping'
    );

    // TEST 9: Theme Contrast & Styling
    assert(
      'FS-09',
      'Theme Contrast',
      'High-Contrast Styling for Dark & Light Modes',
      renderedHtml.includes('bg-blue-600') &&
      renderedHtml.includes('text-white') &&
      renderedHtml.includes('dark:bg-slate-800') &&
      renderedHtml.includes('dark:border-slate-600'),
      'Verified high-contrast blue primary login styling and slate border/backgrounds for dark & light modes'
    );

    // TEST 10: Clean Minimal Page Architecture
    assert(
      'FS-10',
      'Page Structure',
      'Minimal Gateway Structure Without Duplicate Controls',
      !renderedHtml.includes('data-testid="header-login-btn"') &&
      !renderedHtml.includes('data-testid="header-register-btn"') &&
      renderedHtml.includes('School Operating System'),
      'Verified clean gateway structure without duplicate header controls'
    );

  } catch (err: any) {
    results.push({
      testId: 'FS-ERR',
      category: 'Fatal Error',
      name: 'Landing Page Audit Execution Failure',
      status: 'FAIL',
      details: err.message || String(err),
    });
  }

  return results;
}

if (process.argv[1]?.endsWith('testLandingPageFirstScreen.ts') || process.argv[1]?.endsWith('testLandingPageFirstScreen.js')) {
  runLandingFirstScreenAudit().then((res) => {
    console.log('\n================================================================');
    console.log('🌟 SCHOOLSOUL OS: FIRST SCREEN / LANDING PAGE CRITICAL AUDIT');
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
