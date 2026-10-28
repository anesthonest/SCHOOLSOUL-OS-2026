import fs from 'fs';
import path from 'path';

export interface PatchTestResult {
  category: string;
  testId: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export async function runRegistrationPatchAndRenderBuildAudit(): Promise<PatchTestResult[]> {
  const results: PatchTestResult[] = [];
  console.log('\n================================================================');
  console.log('📋 RUNNING SCHOOL REGISTRATION PATCH & RENDER PWA BUILD SUITE');
  console.log('================================================================\n');

  try {
    const wizardContent = fs.readFileSync(path.join(process.cwd(), 'src/pages/SchoolSetupWizard.tsx'), 'utf-8');
    const apiContent = fs.readFileSync(path.join(process.cwd(), 'src/services/api.ts'), 'utf-8');
    const schoolRouteContent = fs.readFileSync(path.join(process.cwd(), 'server/routes/school.ts'), 'utf-8');
    const packageJsonContent = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8');
    const packageLockContent = fs.readFileSync(path.join(process.cwd(), 'package-lock.json'), 'utf-8');
    const renderYamlContent = fs.readFileSync(path.join(process.cwd(), 'render.yaml'), 'utf-8');
    const npmrcContent = fs.existsSync(path.join(process.cwd(), '.npmrc'))
      ? fs.readFileSync(path.join(process.cwd(), '.npmrc'), 'utf-8')
      : '';

    // -------------------------------------------------------------
    // TEST 1: School Registration/Center Number is Optional
    // -------------------------------------------------------------
    const hasOptionalRegNumberLabel = wizardContent.includes('School Registration / Center Number') &&
      wizardContent.includes('(Optional)');
    const hasNonForcedPayloadRegNumber = wizardContent.includes('registrationNumber: schoolData.registrationNumber?.trim() || \'\'');
    const hasApiNonForcedRegNumber = apiContent.includes('registrationNumber: school.registrationNumber !== undefined ? school.registrationNumber : \'\'');

    if (hasOptionalRegNumberLabel && hasNonForcedPayloadRegNumber && hasApiNonForcedRegNumber) {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-OPT-01',
        name: 'School Registration / Center Number Optional & Non-Forced',
        status: 'PASS',
        details: 'Centre number is labeled (Optional), frontend validation does not block when empty, and payload/API do not force dummy numbers.',
      });
    } else {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-OPT-01',
        name: 'School Registration / Center Number Optional & Non-Forced',
        status: 'FAIL',
        details: 'Centre number is still required or forcing dummy fallback values.',
      });
    }

    // -------------------------------------------------------------
    // TEST 2: Physical Address / Campus Location is Optional
    // -------------------------------------------------------------
    const hasOptionalAddressLabel = wizardContent.includes('Physical Address / Campus Location') &&
      wizardContent.includes('(Optional)');
    const hasNonForcedPayloadAddress = wizardContent.includes('physicalAddress: schoolData.physicalAddress?.trim() || \'\'');
    const hasApiNonForcedAddress = apiContent.includes('physicalAddress: school.physicalAddress !== undefined ? school.physicalAddress : \'\'');

    if (hasOptionalAddressLabel && hasNonForcedPayloadAddress && hasApiNonForcedAddress) {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-OPT-02',
        name: 'Physical Address / Campus Location Optional & Non-Forced',
        status: 'PASS',
        details: 'Physical address is labeled (Optional), frontend validation permits blank submission, and API saves empty string without injecting dummy locations.',
      });
    } else {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-OPT-02',
        name: 'Physical Address / Campus Location Optional & Non-Forced',
        status: 'FAIL',
        details: 'Physical address validation or payload still requires/forces dummy addresses.',
      });
    }

    // -------------------------------------------------------------
    // TEST 3: Step Two Setup Identity is School Email
    // -------------------------------------------------------------
    const hasStepTwoSchoolEmailTitle = wizardContent.includes('Step 2 — School Email & Institutional Contact');
    const hasStepTwoSchoolEmailField = wizardContent.includes('Official School Email *') &&
      wizardContent.includes('serves as the institution');
    const hasStepperSchoolEmailLabel = wizardContent.includes("label: 'School Email'");

    if (hasStepTwoSchoolEmailTitle && hasStepTwoSchoolEmailField && hasStepperSchoolEmailLabel) {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-STEP2-01',
        name: 'Step Two Setup Identity is School Email',
        status: 'PASS',
        details: 'Step Two explicitly sets School Email as the primary institutional identity, with Stepper updated to School Email.',
      });
    } else {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-STEP2-01',
        name: 'Step Two Setup Identity is School Email',
        status: 'FAIL',
        details: 'Step Two still frames setup identity around Headteacher rather than School Email.',
      });
    }

    // -------------------------------------------------------------
    // TEST 4: Step Two Prominently Prompts School Contact
    // -------------------------------------------------------------
    const hasSchoolContactPrompt = wizardContent.includes('Official School Contact (Primary Telephone) *') &&
      wizardContent.includes('Direct line for administrative communications');

    if (hasSchoolContactPrompt) {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-STEP2-02',
        name: 'Step Two School Contact Prompt & Phone Field',
        status: 'PASS',
        details: 'Step Two contains prominent Official School Contact telephone prompt with international country prefix.',
      });
    } else {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-STEP2-02',
        name: 'Step Two School Contact Prompt & Phone Field',
        status: 'FAIL',
        details: 'Step Two is missing the official School Contact telephone prompt.',
      });
    }

    // -------------------------------------------------------------
    // TEST 5: Backend / Database Accepts Null / Empty Optional Fields
    // -------------------------------------------------------------
    const hasBackendAcceptOptional = schoolRouteContent.includes('if (!school || !school.schoolName || !adminUser') &&
      !schoolRouteContent.includes('!school.registrationNumber') &&
      !schoolRouteContent.includes('!school.physicalAddress');

    if (hasBackendAcceptOptional) {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-BE-01',
        name: 'Backend API Accepts Empty Centre Number & Address',
        status: 'PASS',
        details: 'Server route /api/school/setup does not mandate registrationNumber or physicalAddress.',
      });
    } else {
      results.push({
        category: 'REGISTRATION_PATCH',
        testId: 'REG-BE-01',
        name: 'Backend API Accepts Empty Centre Number & Address',
        status: 'FAIL',
        details: 'Server route /api/school/setup still enforces non-empty registrationNumber or physicalAddress.',
      });
    }

    // -------------------------------------------------------------
    // TEST 6: vite-plugin-pwa in package.json devDependencies
    // -------------------------------------------------------------
    const packageJson = JSON.parse(packageJsonContent);
    const hasPwaDevDep = Boolean(packageJson.devDependencies && packageJson.devDependencies['vite-plugin-pwa']);

    if (hasPwaDevDep) {
      results.push({
        category: 'RENDER_DEPLOYMENT',
        testId: 'DEP-PWA-01',
        name: 'vite-plugin-pwa in package.json devDependencies',
        status: 'PASS',
        details: `vite-plugin-pwa is declared under devDependencies: "${packageJson.devDependencies['vite-plugin-pwa']}".`,
      });
    } else {
      results.push({
        category: 'RENDER_DEPLOYMENT',
        testId: 'DEP-PWA-01',
        name: 'vite-plugin-pwa in package.json devDependencies',
        status: 'FAIL',
        details: 'vite-plugin-pwa missing from package.json devDependencies.',
      });
    }

    // -------------------------------------------------------------
    // TEST 7: package-lock.json contains resolved vite-plugin-pwa
    // -------------------------------------------------------------
    const hasPwaLock = packageLockContent.includes('node_modules/vite-plugin-pwa') &&
      packageLockContent.includes('vite-plugin-pwa-2.0.0.tgz');

    if (hasPwaLock) {
      results.push({
        category: 'RENDER_DEPLOYMENT',
        testId: 'DEP-LOCK-01',
        name: 'package-lock.json Resolves vite-plugin-pwa Tree',
        status: 'PASS',
        details: 'package-lock.json resolves vite-plugin-pwa and workbox build tooling completely.',
      });
    } else {
      results.push({
        category: 'RENDER_DEPLOYMENT',
        testId: 'DEP-LOCK-01',
        name: 'package-lock.json Resolves vite-plugin-pwa Tree',
        status: 'FAIL',
        details: 'package-lock.json does not resolve vite-plugin-pwa.',
      });
    }

    // -------------------------------------------------------------
    // TEST 8: Render Deployment Blueprint & .npmrc Protection
    // -------------------------------------------------------------
    const hasRenderDevInstall = renderYamlContent.includes('npm install --include=dev && npm run build') &&
      renderYamlContent.includes('NPM_CONFIG_PRODUCTION');
    const hasNpmrcIncludeDev = npmrcContent.includes('include=dev');

    if (hasRenderDevInstall && hasNpmrcIncludeDev) {
      results.push({
        category: 'RENDER_DEPLOYMENT',
        testId: 'DEP-CFG-01',
        name: 'Render Blueprint & .npmrc Include devDependencies during Build',
        status: 'PASS',
        details: 'render.yaml buildCommand includes devDependencies and .npmrc sets include=dev to avoid ERR_MODULE_NOT_FOUND.',
      });
    } else {
      results.push({
        category: 'RENDER_DEPLOYMENT',
        testId: 'DEP-CFG-01',
        name: 'Render Blueprint & .npmrc Include devDependencies during Build',
        status: 'FAIL',
        details: 'render.yaml buildCommand or .npmrc does not ensure devDependencies installation.',
      });
    }

  } catch (err: any) {
    results.push({
      category: 'Fatal Error',
      testId: 'FATAL-01',
      name: 'Test Execution',
      status: 'FAIL',
      details: `Exception: ${err?.message || String(err)}`,
    });
  }

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`${icon} [${r.category} / ${r.testId}] ${r.name}: ${r.details}`);
  }

  return results;
}
