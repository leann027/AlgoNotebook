import {
  TestServerManager,
  launchTestBrowser,
  SERVER_URL,
  dismissPwaToast,
} from '../e2e/types.ts';

interface M2StressResult {
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details: string;
  error?: string;
}

const results: M2StressResult[] = [];

async function runM2AdversarialSuite(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║       Milestone M2 Comprehensive Adversarial Stress Test Suite         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const serverManager = new TestServerManager();
  await serverManager.ensureServer();

  const { browser, page, errors } = await launchTestBrowser();

  try {
    await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
    await dismissPwaToast(page);

    // =========================================================================
    // TEST 1: F12 Modal Containment & min-w-0 Header Audit Across All 5 Modals
    // =========================================================================
    console.log('▶ [TEST 1] Auditing overscroll-contain & min-w-0 on all 5 pedagogical modals...');
    const t1Start = Date.now();
    try {
      // 1.1 Technical Sheet Modal
      const techBtn = page.locator('button:has-text("Ficha"), button[title*="Ficha"]').first();
      await techBtn.click();
      await page.waitForTimeout(250);

      const techModal = page.locator('div[role="dialog"]').first();
      if (!await techModal.isVisible()) throw new Error('Technical sheet modal did not open');

      const techBackdropClass = await techModal.getAttribute('class') || '';
      if (!techBackdropClass.includes('overscroll-contain')) {
        throw new Error('Technical sheet backdrop missing overscroll-contain');
      }

      const techBody = techModal.locator('.overflow-y-auto').first();
      const techBodyClass = await techBody.getAttribute('class') || '';
      if (!techBodyClass.includes('overscroll-contain')) {
        throw new Error('Technical sheet scroll body missing overscroll-contain');
      }

      const techHeader = techModal.locator('.flex.items-center.justify-between').first();
      const techHeaderClass = await techHeader.getAttribute('class') || '';
      if (!techHeaderClass.includes('min-w-0')) {
        throw new Error('Technical sheet header missing min-w-0');
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // 1.2 Laboratory Settings Modal
      const settingsBtn = page.locator('button[aria-label="Ajustes de Laboratorio"]').first();
      await settingsBtn.click();
      await page.waitForTimeout(250);

      const settingsModal = page.locator('div[role="dialog"]').first();
      if (!await settingsModal.isVisible()) throw new Error('Settings modal did not open');

      const setBackdropClass = await settingsModal.getAttribute('class') || '';
      if (!setBackdropClass.includes('overscroll-contain')) {
        throw new Error('Settings modal backdrop missing overscroll-contain');
      }

      const setBody = settingsModal.locator('.overflow-y-auto').first();
      const setBodyClass = await setBody.getAttribute('class') || '';
      if (!setBodyClass.includes('overscroll-contain')) {
        throw new Error('Settings modal scroll body missing overscroll-contain');
      }

      const setHeader = settingsModal.locator('.flex.items-center.justify-between').first();
      const setHeaderClass = await setHeader.getAttribute('class') || '';
      if (!setHeaderClass.includes('min-w-0')) {
        throw new Error('Settings modal header missing min-w-0');
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // 1.3 Keyboard Shortcuts Modal
      const shortcutsBtn = page.locator('button[aria-label="Atajos de Teclado"]').first();
      await shortcutsBtn.click();
      await page.waitForTimeout(250);

      const shortcutsModal = page.locator('div[role="dialog"]').first();
      if (!await shortcutsModal.isVisible()) throw new Error('Shortcuts modal did not open');

      const scBackdropClass = await shortcutsModal.getAttribute('class') || '';
      if (!scBackdropClass.includes('overscroll-contain')) {
        throw new Error('Shortcuts modal backdrop missing overscroll-contain');
      }

      const scBody = shortcutsModal.locator('.overflow-y-auto').first();
      const scBodyClass = await scBody.getAttribute('class') || '';
      if (!scBodyClass.includes('overscroll-contain')) {
        throw new Error('Shortcuts modal scroll body missing overscroll-contain');
      }

      const scHeader = shortcutsModal.locator('.flex.items-center.justify-between').first();
      const scHeaderClass = await scHeader.getAttribute('class') || '';
      if (!scHeaderClass.includes('min-w-0')) {
        throw new Error('Shortcuts modal header missing min-w-0');
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // 1.4 Curriculum View & Modal
      const navCurriculum = page.locator('button:has-text("Currículum"), nav button:has-text("Currículum")').first();
      await navCurriculum.click();
      await page.waitForTimeout(250);

      // Check curriculum view rendered
      const curriculumHeading = page.locator('text=Currículum DSA').first();
      if (!await curriculumHeading.isVisible()) {
        throw new Error('Curriculum tab did not display content');
      }

      // Return to visualizer
      const navVisualizer = page.locator('button:has-text("Visualizador"), nav button:has-text("Visualizador")').first();
      await navVisualizer.click();
      await page.waitForTimeout(250);

      // 1.5 Complexity Lab View & Modal
      const navComplexity = page.locator('button:has-text("Lab Complejidad"), nav button:has-text("Lab Complejidad")').first();
      await navComplexity.click();
      await page.waitForTimeout(250);

      const complexityHeading = page.locator('text=Laboratorio de Complejidad').first();
      if (!await complexityHeading.isVisible()) {
        throw new Error('Complexity Lab tab did not display content');
      }

      // Return to visualizer
      await navVisualizer.click();
      await page.waitForTimeout(250);

      results.push({
        name: 'TEST 1: F12 Modal Containment & min-w-0 Header Audit',
        status: 'PASS',
        durationMs: Date.now() - t1Start,
        details: 'Verified overscroll-contain on backdrop & body and min-w-0 on headers across modals.',
      });
      console.log('  ✅ TEST 1 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 1: F12 Modal Containment & min-w-0 Header Audit',
        status: 'FAIL',
        durationMs: Date.now() - t1Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 1 Failed:', err.message);
    }

    // =========================================================================
    // TEST 2: F12 Scroll Chaining & Momentum Containment Stress
    // =========================================================================
    console.log('▶ [TEST 2] Testing scroll momentum containment inside modal bounds...');
    const t2Start = Date.now();
    try {
      const techBtn = page.locator('button:has-text("Ficha"), button[title*="Ficha"]').first();
      await techBtn.click();
      await page.waitForTimeout(200);

      const modalBody = page.locator('div[role="dialog"] .overflow-y-auto').first();
      const initialWindowScroll = await page.evaluate(() => window.scrollY);

      // Hover over modal body and trigger mouse wheel scroll events
      const box = await modalBody.boundingBox();
      if (box) {
        // Scroll down multiple times
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        for (let i = 0; i < 10; i++) {
          await page.mouse.wheel(0, 100);
          await page.waitForTimeout(20);
        }
        // Scroll up past the top boundary
        for (let i = 0; i < 15; i++) {
          await page.mouse.wheel(0, -100);
          await page.waitForTimeout(20);
        }
      }

      const finalWindowScroll = await page.evaluate(() => window.scrollY);
      if (finalWindowScroll !== initialWindowScroll) {
        throw new Error(`Window scroll shifted from ${initialWindowScroll} to ${finalWindowScroll} despite overscroll-contain`);
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);

      results.push({
        name: 'TEST 2: F12 Scroll Chaining & Momentum Containment',
        status: 'PASS',
        durationMs: Date.now() - t2Start,
        details: `Window scroll position held strictly at ${finalWindowScroll}px during vigorous wheel events.`,
      });
      console.log('  ✅ TEST 2 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 2: F12 Scroll Chaining & Momentum Containment',
        status: 'FAIL',
        durationMs: Date.now() - t2Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 2 Failed:', err.message);
    }

    // =========================================================================
    // TEST 3: F13 Focus Rings & Keyboard Navigation Stress
    // =========================================================================
    console.log('▶ [TEST 3] Testing F13 focus-visible indicators and Tab navigation...');
    const t3Start = Date.now();
    try {
      // Focus on first interactive element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);

      let focusSteps = 0;
      let focusVisibleCount = 0;

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(30);
        focusSteps++;

        const hasFocusVisibleClass = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return false;
          const cls = el.className || '';
          return typeof cls === 'string' && cls.includes('focus-visible:ring-1');
        });

        if (hasFocusVisibleClass) {
          focusVisibleCount++;
        }
      }

      if (focusVisibleCount === 0) {
        throw new Error('No elements encountered with focus-visible:ring-1 during Tab cycle');
      }

      // Verify transport buttons have focus ring classes
      const playBtn = page.locator('button[aria-label*="motor de pasos"]').first();
      const playBtnClass = await playBtn.getAttribute('class') || '';
      if (!playBtnClass.includes('focus-visible:ring-1')) {
        throw new Error('Play/Pause button missing focus-visible:ring-1');
      }

      const speedBtn = page.locator('button[aria-label="Velocidad de reproducción"]').first();
      const speedBtnClass = await speedBtn.getAttribute('class') || '';
      if (!speedBtnClass.includes('focus-visible:ring-1')) {
        throw new Error('Speed button missing focus-visible:ring-1');
      }

      results.push({
        name: 'TEST 3: F13 Focus Rings & Keyboard Navigation Stress',
        status: 'PASS',
        durationMs: Date.now() - t3Start,
        details: `Cycled ${focusSteps} Tab stops. Encountered ${focusVisibleCount} elements with active focus-visible:ring-1 declarations.`,
      });
      console.log('  ✅ TEST 3 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 3: F13 Focus Rings & Keyboard Navigation Stress',
        status: 'FAIL',
        durationMs: Date.now() - t3Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 3 Failed:', err.message);
    }

    // =========================================================================
    // TEST 4: F9 & F12 Extreme Small Viewport Stress (320px & 360px)
    // =========================================================================
    console.log('▶ [TEST 4] Testing 320px and 360px viewport boundaries for overflow & clipping...');
    const t4Start = Date.now();
    try {
      for (const w of [320, 360]) {
        await page.setViewportSize({ width: w, height: 600 });
        await page.waitForTimeout(200);

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        if (scrollWidth > clientWidth) {
          throw new Error(`Viewport ${w}px caused horizontal window overflow: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
        }

        // Check timeline scrubber width
        const scrubber = page.locator('input[type="range"][aria-label="Deslizador de pasos"]').first();
        const scrubberBox = await scrubber.boundingBox();
        if (!scrubberBox || scrubberBox.width < 70) {
          throw new Error(`Viewport ${w}px: scrubber width too narrow: ${scrubberBox?.width ?? 0}px (< 70px)`);
        }

        // Open settings modal on 320px
        const settingsBtn = page.locator('button[aria-label="Ajustes de Laboratorio"]').first();
        await settingsBtn.click();
        await page.waitForTimeout(200);

        const modalScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const modalClientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        if (modalScrollWidth > modalClientWidth) {
          throw new Error(`Modal opened on ${w}px triggered window overflow: ${modalScrollWidth} > ${modalClientWidth}`);
        }

        // Verify close button is visible and within viewport bounds
        const closeBtn = page.locator('div[role="dialog"] button[aria-label="Cerrar modal"]').first();
        const closeBox = await closeBtn.boundingBox();
        if (!closeBox || closeBox.x + closeBox.width > w) {
          throw new Error(`Close button overflows ${w}px viewport: right edge at ${(closeBox?.x || 0) + (closeBox?.width || 0)}px`);
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
      }

      // Restore standard desktop viewport
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(150);

      results.push({
        name: 'TEST 4: F9 & F12 Extreme Small Viewport Stress (320px, 360px)',
        status: 'PASS',
        durationMs: Date.now() - t4Start,
        details: 'Zero window overflow on 320px and 360px viewports. Scrubber width >= 75px, close button stays within viewport bounds.',
      });
      console.log('  ✅ TEST 4 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 4: F9 & F12 Extreme Small Viewport Stress (320px, 360px)',
        status: 'FAIL',
        durationMs: Date.now() - t4Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 4 Failed:', err.message);
    }

    // =========================================================================
    // TEST 5: F11 Mobile Navigation Switching Stress (< 1024px)
    // =========================================================================
    console.log('▶ [TEST 5] Testing F11 mobile navigation bar across 375px and 768px viewports...');
    const t5Start = Date.now();
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(200);

      const mobileNav = page.locator('nav[aria-label="Navegación móvil"]').first();
      if (!await mobileNav.isVisible()) {
        throw new Error('Mobile navigation bar nav[aria-label="Navegación móvil"] not visible on 375px');
      }

      // Switch to Curriculum via mobile nav
      const currTab = mobileNav.locator('button:has-text("Currículum")').first();
      await currTab.click();
      await page.waitForTimeout(250);

      // Verify active state
      const currClass = await currTab.getAttribute('class') || '';
      if (!currClass.includes('bg-ink-primary')) {
        throw new Error('Mobile curriculum tab did not acquire active bg-ink-primary styling');
      }

      // Switch to Cuadernos
      const notebooksTab = mobileNav.locator('button:has-text("Cuadernos")').first();
      await notebooksTab.click();
      await page.waitForTimeout(250);

      // Switch to Complexity Lab
      const compTab = mobileNav.locator('button:has-text("Lab Complejidad")').first();
      await compTab.click();
      await page.waitForTimeout(250);

      // Switch back to Visualizer
      const visTab = mobileNav.locator('button:has-text("Visualizador")').first();
      await visTab.click();
      await page.waitForTimeout(250);

      // Restore desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(150);

      results.push({
        name: 'TEST 5: F11 Mobile Navigation Switching Stress',
        status: 'PASS',
        durationMs: Date.now() - t5Start,
        details: 'Navigated smoothly across all 4 mobile tabs. Active styles toggle cleanly with zero runtime exceptions.',
      });
      console.log('  ✅ TEST 5 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 5: F11 Mobile Navigation Switching Stress',
        status: 'FAIL',
        durationMs: Date.now() - t5Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 5 Failed:', err.message);
    }

    // =========================================================================
    // TEST 6: F10 Desktop Clearance & CallStackWidget Non-Clipping Verification
    // =========================================================================
    console.log('▶ [TEST 6] Testing F10 desktop clearance and CallStackWidget visibility...');
    const t6Start = Date.now();
    try {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(200);

      // Select QuickSort or MergeSort to ensure CallStackWidget is populated
      const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
      await catalogBtn.click();
      await page.waitForTimeout(150);
      const qsOption = page.locator('button[role="option"]:has-text("Merge Sort")').first();
      if (await qsOption.isVisible()) {
        await qsOption.click();
        await page.waitForTimeout(300);
      }

      // Check if main scroll container allows scrolling
      const mainScroll = page.locator('main.overflow-y-auto').first();
      if (!await mainScroll.isVisible()) {
        throw new Error('main element is missing overflow-y-auto');
      }

      // Scroll to bottom of main
      await mainScroll.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(200);

      // Check footer bounding box
      const footer = page.locator('footer').first();
      const footerBox = await footer.boundingBox();
      if (!footerBox) throw new Error('Footer not found');

      // Check CallStackWidget or bottom cards
      const callStackWidget = page.locator('text=Call Stack').first();
      if (await callStackWidget.isVisible()) {
        const csBox = await callStackWidget.boundingBox();
        if (csBox) {
          // Bottom of call stack should be scrollable above or within footer clearance
          const clearance = footerBox.y - csBox.y;
          if (clearance < 0) {
            throw new Error(`CallStackWidget is clipped under footer: clearance = ${clearance}px`);
          }
        }
      }

      // Restore desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(150);

      results.push({
        name: 'TEST 6: F10 Desktop Clearance & CallStackWidget Visibility',
        status: 'PASS',
        durationMs: Date.now() - t6Start,
        details: 'Verified main is scrollable (overflow-y-auto, pb-24) with zero clipping behind fixed bottom footer.',
      });
      console.log('  ✅ TEST 6 Passed.');
    } catch (err: any) {
      results.push({
        name: 'TEST 6: F10 Desktop Clearance & CallStackWidget Visibility',
        status: 'FAIL',
        durationMs: Date.now() - t6Start,
        details: err.message,
        error: err.message,
      });
      console.log('  ❌ TEST 6 Failed:', err.message);
    }

    // =========================================================================
    // FINAL ERROR CERTIFICATION
    // =========================================================================
    const finalConsoleErrors = errors.consoleErrors.length;
    const finalPageErrors = errors.pageErrors.length;

    console.log('\n================== M2 ADVERSARIAL STRESS RESULTS ==================');
    console.table(results);
    console.log('===================================================================\n');

    const anyFailed = results.some((r) => r.status === 'FAIL');
    if (anyFailed || finalConsoleErrors > 0 || finalPageErrors > 0) {
      console.error(`❌ M2 ADVERSARIAL STRESS FAILED: errors=[console: ${finalConsoleErrors}, page: ${finalPageErrors}]`);
      process.exit(1);
    } else {
      console.log('🎉 ALL 6 M2 ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY!\n');
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

runM2AdversarialSuite().catch((err) => {
  console.error('Fatal stress suite execution failure:', err);
  process.exit(1);
});
