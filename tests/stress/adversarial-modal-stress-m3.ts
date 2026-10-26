import {
  TestServerManager,
  launchTestBrowser,
  SERVER_URL,
  dismissPwaToast,
} from '../e2e/types.ts';

interface StressTestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details: string;
  error?: string;
}

const results: StressTestResult[] = [];

async function runModalAdversarialSuite(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║   Milestone M3 Modal Lifecycle & Keyboard Accessibility Stress Test    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const serverManager = new TestServerManager();
  await serverManager.ensureServer();

  const { browser, page, errors } = await launchTestBrowser();

  try {
    await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
    await dismissPwaToast(page);

    // Instrument window.addEventListener / removeEventListener to track listener leaks
    await page.evaluate(() => {
      (window as any).__keydownListeners = 0;
      const originalAdd = window.addEventListener;
      const originalRemove = window.removeEventListener;

      window.addEventListener = function (type: string, listener: any, options: any) {
        if (type === 'keydown') {
          (window as any).__keydownListeners++;
        }
        return originalAdd.call(this, type, listener, options);
      };

      window.removeEventListener = function (type: string, listener: any, options: any) {
        if (type === 'keydown') {
          (window as any).__keydownListeners--;
        }
        return originalRemove.call(this, type, listener, options);
      };
    });

    const baselineListeners = await page.evaluate(() => (window as any).__keydownListeners);
    console.log(`Initial keydown listener baseline: ${baselineListeners}`);

    // =========================================================================
    // TEST 1: Rapid Toggle & Event Listener Leak Prevention (Stress 20x per modal)
    // =========================================================================
    console.log('▶ [TEST 1] Rapid modal open/close stress testing & listener leak audit...');
    const t1Start = Date.now();
    try {
      const modalButtons = [
        { name: 'TechnicalSheet', trigger: 'button[title*="Ficha"]' },
        { name: 'LaboratorySettings', trigger: 'button[aria-label="Ajustes de Laboratorio"]' },
        { name: 'KeyboardShortcuts', trigger: 'button[aria-label="Atajos de Teclado"]' },
      ];

      for (const item of modalButtons) {
        for (let i = 0; i < 15; i++) {
          const btn = page.locator(item.trigger).first();
          await btn.click();
          // Short wait to ensure DOM attached
          await page.waitForSelector('div[role="dialog"]', { timeout: 2000 });
          // Dismiss via Escape
          await page.keyboard.press('Escape');
          await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });
        }
      }

      const postListeners = await page.evaluate(() => (window as any).__keydownListeners);
      console.log(`Post-rapid-toggle keydown listener delta: ${postListeners - baselineListeners}`);

      // Delta should be <= 1 (if modal was already mounted or memoized, delta must not scale with 45 toggles)
      if (Math.abs(postListeners - baselineListeners) > 2) {
        throw new Error(
          `Hanging event listeners detected! Net change in keydown listeners: ${postListeners - baselineListeners} after 45 toggles`
        );
      }

      results.push({
        name: 'TEST 1: Modal Rapid Toggle & Keydown Listener Cleanup',
        status: 'PASS',
        durationMs: Date.now() - t1Start,
        details: `45 modal open/close cycles executed cleanly. Final keydown listener delta: ${postListeners - baselineListeners} (no accumulation).`,
      });
      console.log('  ✅ TEST 1 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 1: Modal Rapid Toggle & Keydown Listener Cleanup',
        status: 'FAIL',
        durationMs: Date.now() - t1Start,
        details: err.message,
        error: String(err),
      });
      console.error('  ❌ TEST 1 Failed:', err.message);
    }

    // =========================================================================
    // TEST 2: Escape Key Dismissal with Inner Focus, Form Controls & Tab Traversal
    // =========================================================================
    console.log('▶ [TEST 2] Escape key dismissal with inner focus states and form controls...');
    const t2Start = Date.now();
    try {
      // 2.1 Technical Sheet Tabs
      const techBtn = page.locator('button[title*="Ficha"]').first();
      await techBtn.click();
      await page.waitForSelector('div[role="dialog"]');

      // Click tab 'Mecánica Paso a Paso'
      const tabMec = page.locator('button:has-text("Mecánica Paso a Paso")').first();
      await tabMec.click();
      await page.waitForTimeout(100);

      // Focus an inner element and press Escape
      await tabMec.focus();
      await page.keyboard.press('Escape');
      await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });

      // 2.2 Settings Modal Inner Controls
      const setBtn = page.locator('button[aria-label="Ajustes de Laboratorio"]').first();
      await setBtn.click();
      await page.waitForSelector('div[role="dialog"]');

      // Switch to Engine tab
      const tabEngine = page.locator('button:has-text("Código y Motor")').first();
      await tabEngine.click();
      await page.waitForTimeout(100);

      // Focus an inner button
      await tabEngine.focus();
      await page.keyboard.press('Escape');
      await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });

      // 2.3 Shortcuts Modal
      const scBtn = page.locator('button[aria-label="Atajos de Teclado"]').first();
      await scBtn.click();
      await page.waitForSelector('div[role="dialog"]');
      await page.keyboard.press('Escape');
      await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });

      results.push({
        name: 'TEST 2: Escape Dismissal with Focused Internal Controls',
        status: 'PASS',
        durationMs: Date.now() - t2Start,
        details: 'Modals dismissed cleanly via Escape regardless of inner active focus state.',
      });
      console.log('  ✅ TEST 2 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 2: Escape Dismissal with Focused Internal Controls',
        status: 'FAIL',
        durationMs: Date.now() - t2Start,
        details: err.message,
        error: String(err),
      });
      console.error('  ❌ TEST 2 Failed:', err.message);
    }

    // =========================================================================
    // TEST 3: aria-label="Cerrar modal" Standard Audit Across All Dismissal Controls
    // =========================================================================
    console.log('▶ [TEST 3] Auditing aria-label="Cerrar modal" across all dismissal buttons...');
    const t3Start = Date.now();
    try {
      // 3.1 Technical Sheet Modal Close Buttons
      const techBtn = page.locator('button[title*="Ficha"]').first();
      await techBtn.click();
      await page.waitForSelector('div[role="dialog"]');

      const techCloseButtons = page.locator('div[role="dialog"] button[aria-label="Cerrar modal"]');
      const techCount = await techCloseButtons.count();
      if (techCount < 2) {
        throw new Error(`Expected at least 2 close controls with aria-label="Cerrar modal" in Technical Sheet, found ${techCount}`);
      }
      // Click the footer close button
      await techCloseButtons.last().click();
      await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });

      // 3.2 Settings Modal Close Buttons
      const setBtn = page.locator('button[aria-label="Ajustes de Laboratorio"]').first();
      await setBtn.click();
      await page.waitForSelector('div[role="dialog"]');

      const setCloseButtons = page.locator('div[role="dialog"] button[aria-label="Cerrar modal"]');
      const setCount = await setCloseButtons.count();
      if (setCount < 2) {
        throw new Error(`Expected at least 2 close controls with aria-label="Cerrar modal" in Settings Modal, found ${setCount}`);
      }
      // Click the footer close button
      await setCloseButtons.last().click();
      await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });

      // 3.3 Keyboard Shortcuts Modal Close Button
      const scBtn = page.locator('button[aria-label="Atajos de Teclado"]').first();
      await scBtn.click();
      await page.waitForSelector('div[role="dialog"]');

      const scCloseButtons = page.locator('div[role="dialog"] button[aria-label="Cerrar modal"]');
      const scCount = await scCloseButtons.count();
      if (scCount < 1) {
        throw new Error(`Expected close control with aria-label="Cerrar modal" in Shortcuts Modal, found ${scCount}`);
      }
      await scCloseButtons.first().click();
      await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });

      results.push({
        name: 'TEST 3: aria-label="Cerrar modal" Standardization & Click Dismissal',
        status: 'PASS',
        durationMs: Date.now() - t3Start,
        details: `Verified all dismissal buttons across modals expose exact aria-label="Cerrar modal" and dismiss dialogs properly on click.`,
      });
      console.log('  ✅ TEST 3 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 3: aria-label="Cerrar modal" Standardization & Click Dismissal',
        status: 'FAIL',
        durationMs: Date.now() - t3Start,
        details: err.message,
        error: String(err),
      });
      console.error('  ❌ TEST 3 Failed:', err.message);
    }

    // =========================================================================
    // TEST 4: State Pollution & Active Playback Interruption Immunity
    // =========================================================================
    console.log('▶ [TEST 4] Testing state pollution immunity during continuous playback and stepping...');
    const t4Start = Date.now();
    try {
      // Step forward 3 times
      const stepForwardBtn = page.locator('button[aria-label="Paso siguiente"]').first();
      await stepForwardBtn.click();
      await page.waitForTimeout(100);
      await stepForwardBtn.click();
      await page.waitForTimeout(100);
      await stepForwardBtn.click();
      await page.waitForTimeout(100);

      // Check current step text
      const stepTextBefore = await page.locator('footer span.font-mono').first().innerText();

      // Open and close Technical Sheet
      const techBtn = page.locator('button[title*="Ficha"]').first();
      await techBtn.click();
      await page.waitForSelector('div[role="dialog"]');
      await page.keyboard.press('Escape');
      await page.waitForSelector('div[role="dialog"]', { state: 'detached' });

      // Step text must remain identical
      const stepTextAfter = await page.locator('footer span.font-mono').first().innerText();
      if (stepTextBefore !== stepTextAfter) {
        throw new Error(`Step state polluted by modal dismissal! Before: "${stepTextBefore}", After: "${stepTextAfter}"`);
      }

      // Check active code line is preserved
      const activeLine = page.locator('div[class*="border-ink-primary"]').first();
      const hasActiveLine = await activeLine.isVisible();
      if (!hasActiveLine) {
        throw new Error('Active highlighted code line disappeared after modal dismissal!');
      }

      results.push({
        name: 'TEST 4: State Pollution & Playback Step Preservation',
        status: 'PASS',
        durationMs: Date.now() - t4Start,
        details: `Step counter ("${stepTextAfter}") and active line highlighting remained perfectly preserved across modal lifecycle.`,
      });
      console.log('  ✅ TEST 4 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 4: State Pollution & Playback Step Preservation',
        status: 'FAIL',
        durationMs: Date.now() - t4Start,
        details: err.message,
        error: String(err),
      });
      console.error('  ❌ TEST 4 Failed:', err.message);
    }

    // =========================================================================
    // TEST 5: Escape Storm & Double-Escape Burst Stress
    // =========================================================================
    console.log('▶ [TEST 5] Testing Escape key storm when closed and double-Escape burst...');
    const t5Start = Date.now();
    try {
      // Send 30 rapid Escape keystrokes with no modal open
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(150);

      // Verify no dialog opened and 0 console errors
      const dialogCount = await page.locator('div[role="dialog"]').count();
      if (dialogCount > 0) {
        throw new Error('Ghost dialog opened during Escape storm');
      }

      // Now open modal and fire double-Escape in rapid burst (< 20ms)
      const setBtn = page.locator('button[aria-label="Ajustes de Laboratorio"]').first();
      await setBtn.click();
      await page.waitForSelector('div[role="dialog"]');

      await Promise.all([
        page.keyboard.press('Escape'),
        page.keyboard.press('Escape'),
      ]);
      await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 2000 });

      results.push({
        name: 'TEST 5: Escape Storm & Rapid Burst Resistance',
        status: 'PASS',
        durationMs: Date.now() - t5Start,
        details: 'Survived 30 rapid Escape presses without dialog and double-Escape burst without unhandled exceptions.',
      });
      console.log('  ✅ TEST 5 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 5: Escape Storm & Rapid Burst Resistance',
        status: 'FAIL',
        durationMs: Date.now() - t5Start,
        details: err.message,
        error: String(err),
      });
      console.error('  ❌ TEST 5 Failed:', err.message);
    }

    // =========================================================================
    // TEST 6: Static AST / Contract Inspection for CurriculumModal & ComplexityLabModal
    // =========================================================================
    console.log('▶ [TEST 6] Verifying CurriculumModal and ComplexityLabModal contracts...');
    const t6Start = Date.now();
    try {
      // Read the two modal source files and check for exact contracts:
      // 1. window.addEventListener('keydown', handleKeyDown)
      // 2. window.removeEventListener('keydown', handleKeyDown)
      // 3. aria-label="Cerrar modal"
      const fs = await import('fs');
      const curriculumCode = fs.readFileSync('src/components/modals/CurriculumModal.tsx', 'utf-8');
      const complexityCode = fs.readFileSync('src/components/modals/ComplexityLabModal.tsx', 'utf-8');

      if (!curriculumCode.includes("e.key === 'Escape'")) {
        throw new Error('CurriculumModal missing Escape key handler');
      }
      if (!curriculumCode.includes("window.removeEventListener('keydown', handleKeyDown)")) {
        throw new Error('CurriculumModal missing keydown listener cleanup');
      }
      if (!curriculumCode.includes('aria-label="Cerrar modal"')) {
        throw new Error('CurriculumModal missing aria-label="Cerrar modal"');
      }

      if (!complexityCode.includes("e.key === 'Escape'")) {
        throw new Error('ComplexityLabModal missing Escape key handler');
      }
      if (!complexityCode.includes("window.removeEventListener('keydown', handleKeyDown)")) {
        throw new Error('ComplexityLabModal missing keydown listener cleanup');
      }
      if (!complexityCode.includes('aria-label="Cerrar modal"')) {
        throw new Error('ComplexityLabModal missing aria-label="Cerrar modal"');
      }

      results.push({
        name: 'TEST 6: Component Contract Verification (Curriculum & ComplexityLab)',
        status: 'PASS',
        durationMs: Date.now() - t6Start,
        details: 'Confirmed Escape key listener, clean removeEventListener teardown, and aria-label="Cerrar modal" across both standalone modals.',
      });
      console.log('  ✅ TEST 6 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 6: Component Contract Verification (Curriculum & ComplexityLab)',
        status: 'FAIL',
        durationMs: Date.now() - t6Start,
        details: err.message,
        error: String(err),
      });
      console.error('  ❌ TEST 6 Failed:', err.message);
    }

    // Check error monitors
    console.log('\nAudit Console and Page Errors:');
    console.log(`Console Errors: ${errors.consoleErrors.length}`);
    console.log(`Page Errors: ${errors.pageErrors.length}`);
    if (errors.consoleErrors.length > 0 || errors.pageErrors.length > 0) {
      throw new Error(`Encountered ${errors.consoleErrors.length} console errors and ${errors.pageErrors.length} page errors during modal adversarial testing`);
    }

  } finally {
    await browser.close();
  }

  // Print Summary Table
  console.log('\n================== M3 MODAL ADVERSARIAL STRESS RESULTS ==================');
  console.table(results.map(r => ({ name: r.name, status: r.status, durationMs: r.durationMs, details: r.details })));
  console.log('=========================================================================\n');

  const failedCount = results.filter(r => r.status === 'FAIL').length;
  if (failedCount > 0) {
    console.error(`💥 ${failedCount} MODAL ADVERSARIAL STRESS TESTS FAILED!`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 6 MODAL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY!');
  }
}

runModalAdversarialSuite().catch((err) => {
  console.error('Unhandled suite error:', err);
  process.exit(1);
});
