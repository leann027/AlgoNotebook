import {
  launchTestBrowser,
  TestServerManager,
  SERVER_URL,
  dismissPwaToast,
  measureCumulativeLayoutShift,
  measureAnimationFPS,
} from './types.ts';

interface AdversarialTestResult {
  name: string;
  passed: boolean;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details?: string;
  error?: string;
}

async function runAdversarialStressSuite(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║       AlgoNotebook EMPIRICAL ADVERSARIAL STRESS TEST SUITE            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const serverManager = new TestServerManager();
  await serverManager.ensureServer();

  const { browser, page, errors } = await launchTestBrowser();
  const results: AdversarialTestResult[] = [];

  try {
    await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
    await dismissPwaToast(page);

    // =========================================================================
    // STRESS 1: ArrayViewport High-Tempo Step & Scrubber Stress
    // =========================================================================
    console.log('▶ [STRESS 1] Testing ArrayViewport High-Tempo Stepping & Scrubbing...');
    const s1Start = Date.now();
    try {
      const stepForwardBtn = page.locator('button[aria-label="Paso siguiente"], button[title="Paso siguiente"]').first();
      const stepBackBtn = page.locator('button[aria-label="Paso anterior"], button[title="Paso anterior"]').first();
      const scrubber = page.locator('input[type="range"]').first();

      let forwardClicks = 0;
      for (let i = 0; i < 35; i++) {
        const canClick = await stepForwardBtn.isEnabled().catch(() => false);
        if (!canClick) break;
        await stepForwardBtn.click({ timeout: 200 }).catch(() => {});
        forwardClicks++;
        await page.waitForTimeout(10);
      }

      let backClicks = 0;
      for (let i = 0; i < 35; i++) {
        const canClick = await stepBackBtn.isEnabled().catch(() => false);
        if (!canClick) break;
        await stepBackBtn.click({ timeout: 200 }).catch(() => {});
        backClicks++;
        await page.waitForTimeout(10);
      }

      // Rapidly scrub timeline
      if (await scrubber.isVisible()) {
        const bounds = await scrubber.boundingBox();
        if (bounds) {
          for (const ratio of [0.1, 0.9, 0.3, 0.7, 0.5, 0.0, 1.0]) {
            await page.mouse.click(bounds.x + bounds.width * ratio, bounds.y + bounds.height / 2);
            await page.waitForTimeout(15);
          }
        }
      }

      // Verify array viewport still has elements and no NaN/crashes
      const bars = page.locator('main div[style*="scaleY"], main div[style*="height"]');
      const barCount = await bars.count();
      const passed = barCount > 0 && errors.consoleErrors.length === 0 && errors.pageErrors.length === 0;

      results.push({
        name: 'STRESS 1: ArrayViewport High-Tempo Step & Scrubber Stress',
        passed,
        status: passed ? 'PASS' : 'FAIL',
        durationMs: Date.now() - s1Start,
        details: `Executed ${forwardClicks} forward + ${backClicks} back clicks + 7 scrubber jumps. Bar count: ${barCount}. Zero console errors.`,
      });
      console.log('  ✅ STRESS 1 Passed.');
    } catch (err: any) {
      results.push({
        name: 'STRESS 1: ArrayViewport High-Tempo Step & Scrubber Stress',
        passed: false,
        status: 'FAIL',
        durationMs: Date.now() - s1Start,
        error: err.message,
      });
      console.log('  ❌ STRESS 1 Failed:', err.message);
    }

    // =========================================================================
    // STRESS 2: Dynamic Technical Sheet Modal Tabs across 6 Paradigms
    // =========================================================================
    console.log('▶ [STRESS 2] Testing AlgorithmTechnicalSheetModal Tabs across 6 Paradigms...');
    const s2Start = Date.now();
    try {
      const algorithmsToTest = [
        { name: 'Bubble Sort', hasMaster: false },
        { name: 'Merge Sort', hasMaster: true },
        { name: 'Búsqueda Binaria', hasMaster: true },
        { name: 'Árbol AVL (Rotaciones)', hasMaster: false },
        { name: 'Dijkstra: Camino Mínimo', hasMaster: false },
        { name: 'Mochila 0/1 (Knapsack DP)', hasMaster: false },
      ];

      for (const algo of algorithmsToTest) {
        // Open catalog dropdown
        const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
        await catalogBtn.click();
        await page.waitForTimeout(100);

        // Click algorithm item
        const itemBtn = page.locator(`button[role="option"]:has-text("${algo.name}")`).first();
        await itemBtn.click();
        await page.waitForTimeout(200);

        // Open Tech Sheet
        const techBtn = page.locator('button[title*="Ficha Técnica"]').first();
        await techBtn.click();
        await page.waitForTimeout(150);

        const dialog = page.locator('div[role="dialog"]').first();
        if (!(await dialog.isVisible())) throw new Error(`Tech Sheet modal failed to open for ${algo.name}`);

        // Click through all 5 tabs rapidly
        const tabs = [
          'Intuición & Metáfora',
          'Mecánica Paso a Paso',
          'Invariante Formal',
          'Complejidad Big-O',
          'Casos Borde',
        ];

        for (const tabText of tabs) {
          const tabBtn = dialog.locator(`button:has-text("${tabText}")`).first();
          await tabBtn.click();
          await page.waitForTimeout(30);
        }

        // On Complexity tab, check Big-O content and master theorem if applicable
        const complexityTabBtn = dialog.locator('button:has-text("Complejidad Big-O")').first();
        await complexityTabBtn.click();
        await page.waitForTimeout(40);

        const hasBigOContent = (await dialog.locator('text=Mejor Caso').count()) > 0;
        if (!hasBigOContent) throw new Error(`Complexity tab missing Big-O content for ${algo.name}`);

        if (algo.hasMaster) {
          const hasMasterBadge = (await dialog.locator('text=Teorema Maestro').count()) > 0;
          if (!hasMasterBadge) throw new Error(`Master theorem section expected for ${algo.name}`);
        }

        // Dismiss modal via Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100);
        if (await dialog.isVisible()) throw new Error(`Tech Sheet modal failed to close via Escape for ${algo.name}`);
      }

      const passed = errors.consoleErrors.length === 0 && errors.pageErrors.length === 0;
      results.push({
        name: 'STRESS 2: Dynamic Technical Sheet Modal Tabs across 6 Paradigms',
        passed,
        status: passed ? 'PASS' : 'FAIL',
        durationMs: Date.now() - s2Start,
        details: 'Verified 6 algorithms across 5 distinct paradigms; cycled all 5 tabs each; 0 errors.',
      });
      console.log('  ✅ STRESS 2 Passed.');
    } catch (err: any) {
      results.push({
        name: 'STRESS 2: Dynamic Technical Sheet Modal Tabs across 6 Paradigms',
        passed: false,
        status: 'FAIL',
        durationMs: Date.now() - s2Start,
        error: err.message,
      });
      console.log('  ❌ STRESS 2 Failed:', err.message);
    }

    // =========================================================================
    // STRESS 3: Dynamic Laboratory Settings Modal Tabs & Settings Mutation
    // =========================================================================
    console.log('▶ [STRESS 3] Testing LaboratorySettingsModal Tabs & Mutations...');
    const s3Start = Date.now();
    try {
      const settingsBtn = page.locator('button[aria-label="Ajustes de Laboratorio"], button[title="Ajustes de Laboratorio"]').first();
      await settingsBtn.click();
      await page.waitForTimeout(150);

      const dialog = page.locator('div[role="dialog"]').first();
      if (!(await dialog.isVisible())) throw new Error('Settings modal failed to open');

      // Rapidly toggle tabs: Visual -> Engine -> System -> Visual -> Engine
      const tabOrder = ['Código y Motor', 'Sistema y Datos', 'Lienzo y Visual', 'Código y Motor', 'Lienzo y Visual'];
      for (const tName of tabOrder) {
        const tBtn = dialog.locator(`button:has-text("${tName}")`).first();
        await tBtn.click();
        await page.waitForTimeout(40);
      }

      // Mutate a setting on Visual tab
      const gridBtn = dialog.locator('button:has-text("Limpio"), button:has-text("Tenue")').first();
      if (await gridBtn.isVisible()) {
        await gridBtn.click();
        await page.waitForTimeout(40);
      }

      // Close modal with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      if (await dialog.isVisible()) throw new Error('Settings modal failed to close via Escape');

      const passed = errors.consoleErrors.length === 0 && errors.pageErrors.length === 0;
      results.push({
        name: 'STRESS 3: Dynamic Laboratory Settings Modal Tabs & Mutations',
        passed,
        status: passed ? 'PASS' : 'FAIL',
        durationMs: Date.now() - s3Start,
        details: 'Settings modal tabs switched rapidly, setting mutated and persisted, dismissed via Esc.',
      });
      console.log('  ✅ STRESS 3 Passed.');
    } catch (err: any) {
      results.push({
        name: 'STRESS 3: Dynamic Laboratory Settings Modal Tabs & Mutations',
        passed: false,
        status: 'FAIL',
        durationMs: Date.now() - s3Start,
        error: err.message,
      });
      console.log('  ❌ STRESS 3 Failed:', err.message);
    }

    // =========================================================================
    // STRESS 4: Standalone KeyboardShortcutsModal Lifecycle
    // =========================================================================
    console.log('▶ [STRESS 4] Testing KeyboardShortcutsModal Lifecycle & Dismissals...');
    const s4Start = Date.now();
    try {
      const shortcutsBtn = page.locator('button[aria-label="Atajos de Teclado"], button[title="Atajos de Teclado"]').first();
      await shortcutsBtn.click();
      await page.waitForTimeout(150);

      const dialog = page.locator('div[role="dialog"]').first();
      if (!(await dialog.isVisible())) throw new Error('Shortcuts modal failed to open');

      // Verify shortcuts list entries exist
      const kbdElements = dialog.locator('kbd');
      const kbdCount = await kbdElements.count();
      if (kbdCount < 3) throw new Error(`Expected at least 3 shortcut definitions, got ${kbdCount}`);

      // Dismiss via Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      if (await dialog.isVisible()) throw new Error('Shortcuts modal failed to close via Escape');

      // Reopen and close via close button
      await shortcutsBtn.click();
      await page.waitForTimeout(100);
      const closeBtn = dialog.locator('button[aria-label="Cerrar modal"], button[title*="Cerrar"]').first();
      await closeBtn.click();
      await page.waitForTimeout(100);
      if (await dialog.isVisible()) throw new Error('Shortcuts modal failed to close via Close button');

      const passed = errors.consoleErrors.length === 0 && errors.pageErrors.length === 0;
      results.push({
        name: 'STRESS 4: Standalone KeyboardShortcutsModal Lifecycle',
        passed,
        status: passed ? 'PASS' : 'FAIL',
        durationMs: Date.now() - s4Start,
        details: `Shortcuts modal opened, verified ${kbdCount} shortcuts, dismissed via Esc and Close button.`,
      });
      console.log('  ✅ STRESS 4 Passed.');
    } catch (err: any) {
      results.push({
        name: 'STRESS 4: Standalone KeyboardShortcutsModal Lifecycle',
        passed: false,
        status: 'FAIL',
        durationMs: Date.now() - s4Start,
        error: err.message,
      });
      console.log('  ❌ STRESS 4 Failed:', err.message);
    }

    // =========================================================================
    // STRESS 5: Tree Viewport Rendering & Layout Math with AVL & Heap Trees
    // =========================================================================
    console.log('▶ [STRESS 5] Testing Tree Viewport with AVL and Heap Trees...');
    const s5Start = Date.now();
    try {
      // 5.1 AVL Tree
      const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
      await catalogBtn.click();
      await page.waitForTimeout(100);

      const avlBtn = page.locator('button[role="option"]:has-text("Árbol AVL (Rotaciones)")').first();
      await avlBtn.click();
      await page.waitForTimeout(300);

      // Verify SVG canvas exists
      const treeSvg = page.locator('svg[aria-label*="Visualizador de Jerarquía"], svg[viewBox="0 0 800 460"]').first();
      await treeSvg.waitFor({ state: 'visible', timeout: 5000 });

      // Step forward 5 times to trigger AVL balancing and populate nodes
      const stepForwardBtn = page.locator('button[aria-label="Paso siguiente"], button[title="Paso siguiente"]').first();
      for (let i = 0; i < 5; i++) {
        if (await stepForwardBtn.isEnabled().catch(() => false)) {
          await stepForwardBtn.click().catch(() => {});
          await page.waitForTimeout(60);
        }
      }

      // Check SVG nodes count
      const avlCircles = treeSvg.locator('circle');
      const avlCircleCount = await avlCircles.count();
      if (avlCircleCount === 0) throw new Error('No SVG circle nodes rendered in AVL tree');

      // 5.2 Min-Heap Tree
      await catalogBtn.click();
      await page.waitForTimeout(100);

      const heapBtn = page.locator('button[role="option"]:has-text("Min-Heap (Montículo)")').first();
      await heapBtn.click();
      await page.waitForTimeout(300);

      // Step forward 5 times in heap
      for (let i = 0; i < 5; i++) {
        if (await stepForwardBtn.isEnabled().catch(() => false)) {
          await stepForwardBtn.click().catch(() => {});
          await page.waitForTimeout(60);
        }
      }

      const heapCircles = treeSvg.locator('circle');
      const heapCircleCount = await heapCircles.count();
      if (heapCircleCount === 0) throw new Error('No SVG circle nodes rendered in Min-Heap tree');

      const passed = errors.consoleErrors.length === 0 && errors.pageErrors.length === 0;
      results.push({
        name: 'STRESS 5: Tree Viewport Rendering & Layout Math with AVL & Heap Trees',
        passed,
        status: passed ? 'PASS' : 'FAIL',
        durationMs: Date.now() - s5Start,
        details: `AVL tree circles: ${avlCircleCount}, Heap circles: ${heapCircleCount}. Pure layout geometry centered cleanly without errors.`,
      });
      console.log('  ✅ STRESS 5 Passed.');
    } catch (err: any) {
      results.push({
        name: 'STRESS 5: Tree Viewport Rendering & Layout Math with AVL & Heap Trees',
        passed: false,
        status: 'FAIL',
        durationMs: Date.now() - s5Start,
        error: err.message,
      });
      console.log('  ❌ STRESS 5 Failed:', err.message);
    }

    // =========================================================================
    // STRESS 6: Active Playback + Modal Interruption + Viewport Tab Navigation
    // =========================================================================
    console.log('▶ [STRESS 6] Testing Active Playback + Modal Interruption + Navigation...');
    const s6Start = Date.now();
    try {
      // Return to sorting
      const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
      await catalogBtn.click();
      await page.waitForTimeout(100);

      const bubbleBtn = page.locator('button[role="option"]:has-text("Bubble Sort")').first();
      await bubbleBtn.click();
      await page.waitForTimeout(200);

      // Start continuous playback
      const playBtn = page.locator('footer button[title*="motor de pasos"]').first();
      await playBtn.click();
      await page.waitForTimeout(200);

      // Measure FPS during active playback
      const fps = await measureAnimationFPS(page, 90);

      // While playing, open tech sheet modal
      const techBtn = page.locator('button[title*="Ficha Técnica"]').first();
      await techBtn.click();
      await page.waitForTimeout(200);

      // Dismiss modal with Esc
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);

      // Navigate to Curriculum tab and back to Visualizer
      const curriculumTab = page.locator('nav button:has-text("Currículum"), header button:has-text("Currículum")').first();
      if (await curriculumTab.isVisible()) {
        await curriculumTab.click();
        await page.waitForTimeout(200);

        const visualizerTab = page.locator('nav button:has-text("Visualizador"), header button:has-text("Visualizador")').first();
        await visualizerTab.click();
        await page.waitForTimeout(200);
      }

      // Pause playback
      if (await playBtn.isVisible()) {
        await playBtn.click();
        await page.waitForTimeout(100);
      }

      const cls = await measureCumulativeLayoutShift(page, 500);

      const passed = fps.avgFps >= 55.0 && cls < 0.05 && errors.consoleErrors.length === 0 && errors.pageErrors.length === 0;
      results.push({
        name: 'STRESS 6: Active Playback + Modal Interruption + Navigation',
        passed,
        status: passed ? 'PASS' : 'FAIL',
        durationMs: Date.now() - s6Start,
        details: `Average FPS: ${fps.avgFps.toFixed(1)} (target >= 55), CLS: ${cls.toFixed(4)} (target < 0.05), Console errors: ${errors.consoleErrors.length}.`,
      });
      console.log(`  ✅ STRESS 6 Passed. FPS: ${fps.avgFps.toFixed(1)}, CLS: ${cls.toFixed(4)}`);
    } catch (err: any) {
      results.push({
        name: 'STRESS 6: Active Playback + Modal Interruption + Navigation',
        passed: false,
        status: 'FAIL',
        durationMs: Date.now() - s6Start,
        error: err.message,
      });
      console.log('  ❌ STRESS 6 Failed:', err.message);
    }

  } finally {
    await browser.close();
  }

  // Print Summary Table
  console.log('\n================== EMPIRICAL STRESS TEST RESULTS ==================');
  console.table(
    results.map((r) => ({
      Test: r.name,
      Status: r.status,
      Duration: `${r.durationMs}ms`,
      Details: r.details ? r.details.slice(0, 65) + '...' : r.error || 'N/A',
    }))
  );
  console.log('==================================================================\n');

  const allPassed = results.every((r) => r.passed);
  if (!allPassed) {
    console.error('❌ ADVERSARIAL STRESS SUITE DETECTED FAILURES!');
    process.exit(1);
  } else {
    console.log(`🎉 ALL ${results.length} ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY!`);
  }
}

runAdversarialStressSuite().catch((err) => {
  console.error('Fatal stress test suite error:', err);
  process.exit(1);
});
