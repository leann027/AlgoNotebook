import {
  TestServerManager,
  launchTestBrowser,
  SERVER_URL,
  type TestResult,
} from './types.ts';
import { runTier1FeatureTests } from './tier1-features.ts';
import { runTier2BoundaryTests } from './tier2-boundary.ts';
import { runTier3CombinationTests } from './tier3-combinations.ts';
import { runTier4ScenarioTests } from './tier4-scenarios.ts';

async function runE2ESuite(): Promise<void> {
  const args = process.argv.slice(2);
  const tierArg = args.find((a) => a.startsWith('--tier='));
  const selectedTier = tierArg ? parseInt(tierArg.split('=')[1], 10) : null;

  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║       AlgoNotebook 4-Tier Automated E2E Test Suite Execution           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const serverManager = new TestServerManager();
  let browserInstance;
  const allResults: TestResult[] = [];

  try {
    console.log('📡 Verifying Vite preview server availability...');
    await serverManager.ensureServer();
    console.log(`✅ Preview server active on ${SERVER_URL}\n`);

    console.log('🌐 Launching headless Chromium browser session...');
    const { browser, page, errors } = await launchTestBrowser();
    browserInstance = browser;
    console.log('✅ Browser launched with console and pageerror monitors attached.\n');

    // Tier 1
    if (!selectedTier || selectedTier === 1) {
      console.log('▶ Running Tier 1: Feature Coverage (Isolation)...');
      const t1Results = await runTier1FeatureTests(page, SERVER_URL, errors);
      allResults.push(...t1Results);
      console.log(`  Completed ${t1Results.length} feature tests.\n`);
    }

    // Tier 2
    if (!selectedTier || selectedTier === 2) {
      console.log('▶ Running Tier 2: Boundary & Corner Cases (Multi-Viewport)...');
      const t2Results = await runTier2BoundaryTests(page, SERVER_URL, errors);
      allResults.push(...t2Results);
      console.log(`  Completed ${t2Results.length} boundary tests.\n`);
    }

    // Tier 3
    if (!selectedTier || selectedTier === 3) {
      console.log('▶ Running Tier 3: Cross-Feature Combinations...');
      const t3Results = await runTier3CombinationTests(page, SERVER_URL, errors);
      allResults.push(...t3Results);
      console.log(`  Completed ${t3Results.length} combination tests.\n`);
    }

    // Tier 4
    if (!selectedTier || selectedTier === 4) {
      console.log('▶ Running Tier 4: Real-World Application Workflows...');
      const t4Results = await runTier4ScenarioTests(page, SERVER_URL, errors);
      allResults.push(...t4Results);
      console.log(`  Completed ${t4Results.length} workflow tests.\n`);
    }

    // Print Results Summary
    console.log('\n======================== E2E TEST RESULTS SUMMARY ========================');
    console.table(
      allResults.map((r) => ({
        Tier: `T${r.tier}`,
        Test: r.name,
        Status: r.status,
        Duration: `${r.durationMs}ms`,
        Details: r.details ? (r.details.length > 55 ? r.details.slice(0, 52) + '...' : r.details) : '',
      }))
    );
    console.log('==========================================================================\n');

    const totalTests = allResults.length;
    const passedCount = allResults.filter((r) => r.passed).length;
    const failedCount = allResults.filter((r) => !r.passed).length;
    const warnCount = allResults.filter((r) => r.status === 'WARN').length;

    console.log(`📊 Total: ${totalTests} | Passed: ${passedCount} | Warnings: ${warnCount} | Failed: ${failedCount}`);

    if (failedCount > 0) {
      console.error('\n❌ FAILED TESTS:');
      for (const f of allResults.filter((r) => !r.passed)) {
        console.error(` - [${f.name}]: ${f.error || 'Assertion failed'}`);
      }
      process.exit(1);
    } else {
      console.log('\n🎉 ALL E2E TEST TIERS COMPLETED SUCCESSFULLY!\n');
      process.exit(0);
    }
  } catch (err: any) {
    console.error('❌ Fatal error executing E2E test suite:', err);
    process.exit(1);
  } finally {
    if (browserInstance) {
      await browserInstance.close().catch(() => {});
    }
    serverManager.stop();
  }
}

runE2ESuite();
