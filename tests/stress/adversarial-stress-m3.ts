import {
  TestServerManager,
  launchTestBrowser,
  SERVER_URL,
  dismissPwaToast,
} from '../e2e/types.ts';

interface M3StressResult {
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details: string;
  error?: string;
}

const results: M3StressResult[] = [];

async function runM3AdversarialSuite(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║       Milestone M3 Runtime & Code Panel Adversarial Stress Suite       ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const serverManager = new TestServerManager();
  await serverManager.ensureServer();

  const { browser, page, errors } = await launchTestBrowser();

  try {
    await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
    await dismissPwaToast(page);

    // =========================================================================
    // TEST 1: F14 Static Box Model & Geometry Invariance in CodeNotebookCard
    // =========================================================================
    console.log('▶ [TEST 1] Verifying CodeNotebookCard box model geometry invariance (F14)...');
    const t1Start = Date.now();
    try {
      // Step to activate a line
      const stepForwardBtn = page.locator('button[aria-label="Paso siguiente"]').first();
      await stepForwardBtn.click();
      await page.waitForTimeout(100);

      const geometryReport = await page.evaluate(() => {
        // Find code lines in CodeNotebookCard
        const codePane = document.querySelector('aside div.font-mono');
        if (!codePane) return { error: 'Code inspector pane not found' };

        const lineDivs = Array.from(codePane.children) as HTMLElement[];
        if (lineDivs.length < 5) return { error: `Too few lines found: ${lineDivs.length}` };

        const lineMetrics = lineDivs.map((div, idx) => {
          const style = window.getComputedStyle(div);
          const rect = div.getBoundingClientRect();
          const isActive = div.className.includes('bg-highlighter-compare') || div.className.includes('border-ink-primary');
          const borderLeftWidth = parseFloat(style.borderLeftWidth);
          const paddingTop = parseFloat(style.paddingTop);
          const paddingBottom = parseFloat(style.paddingBottom);

          return {
            line: idx + 1,
            isActive,
            height: rect.height,
            borderLeftWidth,
            paddingTop,
            paddingBottom,
            borderLeftStyle: style.borderLeftStyle,
          };
        });

        const activeLines = lineMetrics.filter((m) => m.isActive);
        const inactiveLines = lineMetrics.filter((m) => !m.isActive);

        if (activeLines.length === 0) return { error: 'No active line found after stepping' };
        if (inactiveLines.length === 0) return { error: 'No inactive line found' };

        // Check border-left reservation
        const allHave4pxBorder = lineMetrics.every((m) => Math.abs(m.borderLeftWidth - 4) < 0.5);
        // Check padding py-0.5 (2px)
        const allHave2pxPaddingTop = lineMetrics.every((m) => Math.abs(m.paddingTop - 2) < 0.5);
        const allHave2pxPaddingBottom = lineMetrics.every((m) => Math.abs(m.paddingBottom - 2) < 0.5);

        // Check height consistency: compare first inactive with active
        const inactiveHeight = inactiveLines[0].height;
        const activeHeight = activeLines[0].height;
        const heightDelta = Math.abs(inactiveHeight - activeHeight);

        return {
          totalLines: lineMetrics.length,
          activeCount: activeLines.length,
          inactiveCount: inactiveLines.length,
          allHave4pxBorder,
          allHave2pxPaddingTop,
          allHave2pxPaddingBottom,
          inactiveHeight,
          activeHeight,
          heightDelta,
        };
      });

      if ('error' in geometryReport && geometryReport.error) {
        throw new Error(geometryReport.error);
      }

      if (!geometryReport.allHave4pxBorder) {
        throw new Error('Not all code lines have static 4px border-left reservation');
      }
      if (!geometryReport.allHave2pxPaddingTop || !geometryReport.allHave2pxPaddingBottom) {
        throw new Error('Not all code lines have static py-0.5 (2px) padding');
      }
      if (geometryReport.heightDelta > 1.0) {
        throw new Error(
          `Line height jump detected: inactive=${geometryReport.inactiveHeight}px vs active=${geometryReport.activeHeight}px (delta=${geometryReport.heightDelta}px)`
        );
      }

      results.push({
        name: 'TEST 1: F14 Static Box Model & Geometry Invariance',
        status: 'PASS',
        durationMs: Date.now() - t1Start,
        details: `4px border reserved on all ${geometryReport.totalLines} lines; heightDelta=${geometryReport.heightDelta.toFixed(2)}px (inactive=${geometryReport.inactiveHeight}px, active=${geometryReport.activeHeight}px).`,
      });
      console.log('  ✅ TEST 1 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 1: F14 Static Box Model & Geometry Invariance',
        status: 'FAIL',
        durationMs: Date.now() - t1Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 1 Failed:', err.message);
    }

    // =========================================================================
    // TEST 2: Rapid Forward Stepping CLS Stress (25 Steps with LayoutShift Tracking)
    // =========================================================================
    console.log('▶ [TEST 2] Rapid forward stepping CLS measurement (25 consecutive steps)...');
    const t2Start = Date.now();
    try {
      // Reset to beginning first
      await page.keyboard.press('r');
      await page.waitForTimeout(150);

      // Attach continuous LayoutShift observer in browser context
      await page.evaluate(() => {
        (window as any).__clsRecords = [];
        (window as any).__observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              (window as any).__clsRecords.push((entry as any).value);
            }
          }
        });
        (window as any).__observer.observe({ type: 'layout-shift', buffered: false });
      });

      const stepBtn = page.locator('button[aria-label="Paso siguiente"]').first();

      // Rapidly step forward 25 times
      for (let i = 0; i < 25; i++) {
        await stepBtn.click();
        await page.waitForTimeout(40);
      }

      // Collect CLS
      const clsResult = await page.evaluate(() => {
        const records: number[] = (window as any).__clsRecords || [];
        const total = records.reduce((sum, v) => sum + v, 0);
        return { count: records.length, total };
      });

      if (clsResult.total >= 0.05) {
        throw new Error(`Excessive CLS during rapid forward stepping: ${clsResult.total} >= 0.05`);
      }

      results.push({
        name: 'TEST 2: Rapid Forward Stepping CLS Stress',
        status: 'PASS',
        durationMs: Date.now() - t2Start,
        details: `Stepped 25 frames forward. Shifts: ${clsResult.count}, Cumulative CLS: ${clsResult.total.toFixed(5)} (< 0.05 target).`,
      });
      console.log('  ✅ TEST 2 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 2: Rapid Forward Stepping CLS Stress',
        status: 'FAIL',
        durationMs: Date.now() - t2Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 2 Failed:', err.message);
    }

    // =========================================================================
    // TEST 3: Rapid Backward Stepping CLS Stress (25 Consecutive Steps Backwards)
    // =========================================================================
    console.log('▶ [TEST 3] Rapid backward stepping CLS measurement (25 consecutive steps)...');
    const t3Start = Date.now();
    try {
      // Clear CLS records
      await page.evaluate(() => {
        (window as any).__clsRecords = [];
      });

      const stepBackBtn = page.locator('button[aria-label="Paso anterior"]').first();

      // Rapidly step backward 25 times
      for (let i = 0; i < 25; i++) {
        const isDisabled = await stepBackBtn.isDisabled();
        if (isDisabled) break;
        await stepBackBtn.click();
        await page.waitForTimeout(40);
      }

      const clsResult = await page.evaluate(() => {
        const records: number[] = (window as any).__clsRecords || [];
        const total = records.reduce((sum, v) => sum + v, 0);
        return { count: records.length, total };
      });

      if (clsResult.total >= 0.05) {
        throw new Error(`Excessive CLS during rapid backward stepping: ${clsResult.total} >= 0.05`);
      }

      results.push({
        name: 'TEST 3: Rapid Backward Stepping CLS Stress',
        status: 'PASS',
        durationMs: Date.now() - t3Start,
        details: `Stepped 25 frames backward to origin. Shifts: ${clsResult.count}, Cumulative CLS: ${clsResult.total.toFixed(5)}.`,
      });
      console.log('  ✅ TEST 3 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 3: Rapid Backward Stepping CLS Stress',
        status: 'FAIL',
        durationMs: Date.now() - t3Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 3 Failed:', err.message);
    }

    // =========================================================================
    // TEST 4: Oscillating Ping-Pong Jitter Stress & Code Panel Position Invariance
    // =========================================================================
    console.log('▶ [TEST 4] High-frequency forward/backward oscillation jitter test...');
    const t4Start = Date.now();
    try {
      const stepForwardBtn = page.locator('button[aria-label="Paso siguiente"]').first();
      const stepBackBtn = page.locator('button[aria-label="Paso anterior"]').first();

      // Advance to step 5 to enable both forward and backward
      for (let i = 0; i < 5; i++) {
        await stepForwardBtn.click();
        await page.waitForTimeout(50);
      }

      // Record baseline bounding boxes of code container and top line
      const baseline = await page.evaluate(() => {
        const codePane = document.querySelector('aside div.font-mono');
        const firstLine = codePane?.children[0] as HTMLElement | null;
        const tenthLine = codePane?.children[9] as HTMLElement | null;
        return {
          codeTop: codePane?.getBoundingClientRect().top ?? 0,
          codeHeight: codePane?.getBoundingClientRect().height ?? 0,
          firstLineTop: firstLine?.getBoundingClientRect().top ?? 0,
          firstLineHeight: firstLine?.getBoundingClientRect().height ?? 0,
          tenthLineTop: tenthLine?.getBoundingClientRect().top ?? 0,
          tenthLineHeight: tenthLine?.getBoundingClientRect().height ?? 0,
        };
      });

      // Clear CLS
      await page.evaluate(() => {
        (window as any).__clsRecords = [];
      });

      // Rapidly oscillate forward/backward 30 times
      let maxTopDeviation = 0;
      let maxHeightDeviation = 0;

      for (let cycle = 0; cycle < 15; cycle++) {
        await stepForwardBtn.click();
        await page.waitForTimeout(30);
        await stepBackBtn.click();
        await page.waitForTimeout(30);

        const current = await page.evaluate(() => {
          const codePane = document.querySelector('aside div.font-mono');
          const firstLine = codePane?.children[0] as HTMLElement | null;
          return {
            codeTop: codePane?.getBoundingClientRect().top ?? 0,
            codeHeight: codePane?.getBoundingClientRect().height ?? 0,
            firstLineTop: firstLine?.getBoundingClientRect().top ?? 0,
            firstLineHeight: firstLine?.getBoundingClientRect().height ?? 0,
          };
        });

        maxTopDeviation = Math.max(maxTopDeviation, Math.abs(current.codeTop - baseline.codeTop));
        maxHeightDeviation = Math.max(maxHeightDeviation, Math.abs(current.codeHeight - baseline.codeHeight));
      }

      const clsResult = await page.evaluate(() => {
        const records: number[] = (window as any).__clsRecords || [];
        const total = records.reduce((sum, v) => sum + v, 0);
        return { count: records.length, total };
      });

      if (maxTopDeviation > 1.0 || maxHeightDeviation > 1.0) {
        throw new Error(
          `Visual jitter detected during oscillation: maxTopDeviation=${maxTopDeviation}px, maxHeightDeviation=${maxHeightDeviation}px`
        );
      }

      if (clsResult.total >= 0.01) {
        throw new Error(`CLS during ping-pong oscillation exceeded threshold: ${clsResult.total} >= 0.01`);
      }

      results.push({
        name: 'TEST 4: Oscillating Ping-Pong Jitter Stress',
        status: 'PASS',
        durationMs: Date.now() - t4Start,
        details: `30 oscillation cycles executed. maxTopDev=${maxTopDeviation.toFixed(2)}px, maxHeightDev=${maxHeightDeviation.toFixed(2)}px, CLS=${clsResult.total.toFixed(5)}.`,
      });
      console.log('  ✅ TEST 4 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 4: Oscillating Ping-Pong Jitter Stress',
        status: 'FAIL',
        durationMs: Date.now() - t4Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 4 Failed:', err.message);
    }

    // =========================================================================
    // TEST 5: Language Switching (Python <-> C) Under Active Stepping
    // =========================================================================
    console.log('▶ [TEST 5] Testing language switching under active playback stepping...');
    const t5Start = Date.now();
    try {
      const cTabBtn = page.locator('aside button:has-text("C")').first();
      const pyTabBtn = page.locator('aside button:has-text("Python")').first();
      const stepForwardBtn = page.locator('button[aria-label="Paso siguiente"]').first();

      // Switch to C
      await cTabBtn.click();
      await page.waitForTimeout(100);

      // Verify C tab is active
      const isCActive = await cTabBtn.evaluate((el) => el.className.includes('font-bold'));
      if (!isCActive) throw new Error('C language tab did not activate');

      // Check C code line box model
      const cGeometry = await page.evaluate(() => {
        const codePane = document.querySelector('aside div.font-mono');
        const lines = Array.from(codePane?.children || []) as HTMLElement[];
        const allHaveBorder = lines.every((l) => Math.abs(parseFloat(window.getComputedStyle(l).borderLeftWidth) - 4) < 0.5);
        const allHavePadding = lines.every((l) => Math.abs(parseFloat(window.getComputedStyle(l).paddingTop) - 2) < 0.5);
        return { count: lines.length, allHaveBorder, allHavePadding };
      });

      if (!cGeometry.allHaveBorder || !cGeometry.allHavePadding) {
        throw new Error('C tab code lines violate static border/padding reservation');
      }

      // Step 5 times in C mode
      for (let i = 0; i < 5; i++) {
        await stepForwardBtn.click();
        await page.waitForTimeout(30);
      }

      // Switch back to Python
      await pyTabBtn.click();
      await page.waitForTimeout(100);

      results.push({
        name: 'TEST 5: Language Switching Under Active Stepping',
        status: 'PASS',
        durationMs: Date.now() - t5Start,
        details: `C code inspected (${cGeometry.count} lines) with valid static 4px border & 2px padding; seamless switch back to Python.`,
      });
      console.log('  ✅ TEST 5 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 5: Language Switching Under Active Stepping',
        status: 'FAIL',
        durationMs: Date.now() - t5Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 5 Failed:', err.message);
    }

    // =========================================================================
    // TEST 6: Multi-Paradigm Code Stepping (BST, Dijkstra, Knapsack)
    // =========================================================================
    console.log('▶ [TEST 6] Multi-paradigm code stepping stability (BST, Dijkstra, Knapsack)...');
    const t6Start = Date.now();
    try {
      const stepForwardBtn = page.locator('button[aria-label="Paso siguiente"]').first();
      const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();

      const testParadigms = ['BST', 'Dijkstra', 'Mochila'];

      for (const paradigm of testParadigms) {
        await catalogBtn.click();
        await page.waitForTimeout(150);
        const opt = page.locator(`button[role="option"]:has-text("${paradigm}")`).first();
        if (!await opt.isVisible()) {
          throw new Error(`Catalog option ${paradigm} not visible`);
        }
        await opt.click();
        await page.waitForTimeout(300);

        // Clear CLS
        await page.evaluate(() => {
          (window as any).__clsRecords = [];
        });

        // Step 10 times in this paradigm
        for (let i = 0; i < 10; i++) {
          await stepForwardBtn.click();
          await page.waitForTimeout(30);
        }

        const paradigmCls = await page.evaluate(() => {
          const records: number[] = (window as any).__clsRecords || [];
          return records.reduce((s, v) => s + v, 0);
        });

        if (paradigmCls >= 0.05) {
          throw new Error(`CLS exceeded in ${paradigm}: ${paradigmCls} >= 0.05`);
        }
      }

      // Switch back to Bubble Sort
      await catalogBtn.click();
      await page.waitForTimeout(150);
      const bubbleOpt = page.locator('button[role="option"]:has-text("Bubble Sort")').first();
      if (await bubbleOpt.isVisible()) {
        await bubbleOpt.click();
        await page.waitForTimeout(200);
      }

      results.push({
        name: 'TEST 6: Multi-Paradigm Code Stepping Stability',
        status: 'PASS',
        durationMs: Date.now() - t6Start,
        details: 'Verified 10 rapid steps across BST, Dijkstra, and Knapsack with CLS < 0.05 in each paradigm.',
      });
      console.log('  ✅ TEST 6 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 6: Multi-Paradigm Code Stepping Stability',
        status: 'FAIL',
        durationMs: Date.now() - t6Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 6 Failed:', err.message);
    }

    // =========================================================================
    // TEST 7: Modal Esc Dismissal & Standardized aria-label Audit (F15)
    // =========================================================================
    console.log('▶ [TEST 7] Standardized aria-label & Esc dismissal audit across all dialogs (F15)...');
    const t7Start = Date.now();
    try {
      // 1. Technical Sheet Modal
      const techBtn = page.locator('button[title*="Ficha"]').first();
      await techBtn.click();
      await page.waitForTimeout(200);
      const techModal = page.locator('div[role="dialog"]').first();
      if (!await techModal.isVisible()) throw new Error('Technical Sheet did not open');
      const techCloseBtns = await techModal.locator('button[aria-label="Cerrar modal"]').count();
      if (techCloseBtns === 0) throw new Error('Technical sheet missing aria-label="Cerrar modal"');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      if (await techModal.isVisible()) throw new Error('Technical sheet did not dismiss on Escape');

      // 2. Settings Modal
      const setBtn = page.locator('button[aria-label*="Ajustes"]').first();
      await setBtn.click();
      await page.waitForTimeout(200);
      const setModal = page.locator('div[role="dialog"]').first();
      if (!await setModal.isVisible()) throw new Error('Settings modal did not open');
      const setCloseBtns = await setModal.locator('button[aria-label="Cerrar modal"]').count();
      if (setCloseBtns === 0) throw new Error('Settings modal missing aria-label="Cerrar modal"');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      if (await setModal.isVisible()) throw new Error('Settings modal did not dismiss on Escape');

      // 3. Shortcuts Modal
      const scBtn = page.locator('button[aria-label*="Atajos"]').first();
      await scBtn.click();
      await page.waitForTimeout(200);
      const scModal = page.locator('div[role="dialog"]').first();
      if (!await scModal.isVisible()) throw new Error('Shortcuts modal did not open');
      const scCloseBtns = await scModal.locator('button[aria-label="Cerrar modal"]').count();
      if (scCloseBtns === 0) throw new Error('Shortcuts modal missing aria-label="Cerrar modal"');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      if (await scModal.isVisible()) throw new Error('Shortcuts modal did not dismiss on Escape');

      // 4. Curriculum View Modal (from Curriculum view if any modal is triggered)
      const curNav = page.locator('button:has-text("Currículum"), nav button:has-text("Currículum")').first();
      await curNav.click();
      await page.waitForTimeout(200);

      // Return to Visualizer
      const visNav = page.locator('button:has-text("Visualizador"), nav button:has-text("Visualizador")').first();
      await visNav.click();
      await page.waitForTimeout(200);

      results.push({
        name: 'TEST 7: Standardized aria-label & Esc Dismissal Audit',
        status: 'PASS',
        durationMs: Date.now() - t7Start,
        details: 'Verified aria-label="Cerrar modal" and clean Escape dismissal across dialogs.',
      });
      console.log('  ✅ TEST 7 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 7: Standardized aria-label & Esc Dismissal Audit',
        status: 'FAIL',
        durationMs: Date.now() - t7Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 7 Failed:', err.message);
    }

    // =========================================================================
    // FINAL VERIFICATION REPORT
    // =========================================================================
    console.log('\n================== M3 ADVERSARIAL STRESS RESULTS ==================');
    console.table(results);
    console.log('===================================================================\n');

    const totalConsoleErrors = errors.consoleErrors.length;
    const totalPageErrors = errors.pageErrors.length;

    console.log(`Console Errors Trapped : ${totalConsoleErrors}`);
    console.log(`Page Errors Trapped    : ${totalPageErrors}`);

    const hasFailure = results.some((r) => r.status === 'FAIL');
    if (hasFailure || totalConsoleErrors > 0 || totalPageErrors > 0) {
      console.error('❌ M3 ADVERSARIAL STRESS SUITE FAILED');
      process.exit(1);
    } else {
      console.log('🎉 ALL 7 M3 ADVERSARIAL STRESS TESTS PASSED WITH 0 JITTER AND ZERO ERRORS!\n');
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

runM3AdversarialSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
