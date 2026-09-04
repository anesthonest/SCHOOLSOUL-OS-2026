import { runAcceptanceSuite } from './runAcceptanceSuite';
import { runPesapalProductionAudit } from './testPesapalProduction';
import { runMarketMediaSuite } from './testMarketMediaSuite';
import { runUniversalNamingSuite } from './testUniversalNamingSuite';
import { runUniversalQRSuite } from './testUniversalQRSuite';
import { runAccountRecoveryAndSuccessionSuite } from './testAccountRecoveryAndSuccessionSuite';
import { runBreakTestCertificationSuite } from './testBreakTestCertificationSuite';
import { runResilienceAndDualStorageSuite } from './testResilienceAndDualStorageSuite';
import { runV6ProductionCandidateSuite } from './testV6ProductionCandidateSuite';

async function main() {
  try {
    const results = await runAcceptanceSuite();
    
    console.log('\n================================================================');
    console.log('🔒 RUNNING PESAPAL 3.0 PRODUCTION & GATEWAY AUDIT MATRIX');
    console.log('================================================================\n');
    const pesapalResults = await runPesapalProductionAudit();
    for (const res of pesapalResults) {
      const icon = res.status === 'PASS' ? '✅ [PASS]' : res.status === 'BLOCKED' ? '⚠️ [BLOCKED]' : res.status === 'NOT TESTED' ? 'ℹ️ [NOT TESTED]' : '❌ [FAIL]';
      console.log(`${icon} [${res.category}] ${res.name}: ${res.details}`);
    }

    const marketMediaResults = await runMarketMediaSuite();

    const namingResults = await runUniversalNamingSuite();
    for (const res of namingResults) {
      const icon = res.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
      console.log(`${icon} [${res.category}] ${res.name}: ${res.details}`);
    }

    const qrResults = await runUniversalQRSuite();
    for (const res of qrResults) {
      const icon = res.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
      console.log(`${icon} [${res.category}] ${res.name}: ${res.details}`);
    }

    const recoveryResults = await runAccountRecoveryAndSuccessionSuite();
    for (const res of recoveryResults) {
      const icon = res.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
      console.log(`${icon} [${res.category}] ${res.name}: ${res.details}`);
    }

    console.log('\n================================================================');
    console.log('💥 RUNNING FINAL INDEPENDENT PRODUCTION BREAK-TEST & CERTIFICATION');
    console.log('================================================================\n');
    const breakTestResults = await runBreakTestCertificationSuite();
    for (const res of breakTestResults) {
      const icon = res.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
      console.log(`${icon} [${res.category} / ${res.code}] ${res.name}: ${res.details} (${res.durationMs}ms)`);
    }

    console.log('\n================================================================');
    console.log('🛡️ RUNNING V5 DUAL-STORAGE, RESILIENCE & FAILURE-INJECTION SUITE');
    console.log('================================================================\n');
    const resilienceResults = await runResilienceAndDualStorageSuite();
    for (const res of resilienceResults) {
      const icon = res.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
      console.log(`${icon} [${res.category} / ${res.code}] ${res.name}: ${res.details} (${res.durationMs}ms)`);
    }

    console.log('\n================================================================');
    console.log('🚀 RUNNING V6 FINAL PRODUCTION CANDIDATE & RELEASE GATE SUITE');
    console.log('================================================================\n');
    const v6Results = await runV6ProductionCandidateSuite();
    for (const res of v6Results) {
      const icon = res.status === 'PASS' ? '✅ [PASS]' : '❌ [FAIL]';
      console.log(`${icon} [${res.category} / ${res.code}] ${res.name}: ${res.details} (${res.durationMs}ms)`);
    }

    const failures = results
      .filter(r => r.status === 'FAIL')
      .concat(pesapalResults.filter(r => r.status === 'FAIL') as any)
      .concat(marketMediaResults.filter(r => r.status === 'FAIL') as any)
      .concat(namingResults.filter(r => r.status === 'FAIL') as any)
      .concat(qrResults.filter(r => r.status === 'FAIL') as any)
      .concat(recoveryResults.filter(r => r.status === 'FAIL') as any)
      .concat(breakTestResults.filter(r => r.status === 'FAIL') as any)
      .concat(resilienceResults.filter(r => r.status === 'FAIL') as any)
      .concat(v6Results.filter(r => r.status === 'FAIL') as any);

    if (failures.length > 0) {
      console.error(`\n❌ Suite failed with ${failures.length} test failures.`);
      process.exit(1);
    } else {
      console.log('\n🎉 All acceptance, Pesapal production, School Market Media, Universal Naming, Universal QR, Account Recovery, Independent Break-Tests, V5 Dual-Storage, and V6 Production Candidate Release Gate Tests passed with 100% success rate (0 critical failures)!');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during acceptance test run:', err);
    process.exit(1);
  }
}

main();
