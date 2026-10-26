import { chromium } from 'playwright-core';
import { resolveChromiumPath, SERVER_URL, TestServerManager } from './types.ts';

interface ViewportSpec {
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'laptop' | 'desktop';
}

const TARGET_VIEWPORTS: ViewportSpec[] = [
  { name: 'Mobile 375x667 (iPhone SE)', width: 375, height: 667, type: 'mobile' },
  { name: 'Mobile 390x844 (iPhone 14)', width: 390, height: 844, type: 'mobile' },
  { name: 'Tablet 768x1024 (iPad Portrait)', width: 768, height: 1024, type: 'tablet' },
  { name: 'Tablet 820x1180 (iPad Air)', width: 820, height: 1180, type: 'tablet' },
  { name: 'Laptop 1024x768 (XGA)', width: 1024, height: 768, type: 'laptop' },
  { name: 'Desktop 1280x800 (WXGA)', width: 1280, height: 800, type: 'laptop' },
  { name: 'Desktop 1440x900 (Standard)', width: 1440, height: 900, type: 'desktop' },
];

export interface ChallengerResult {
  suite: string;
  test: string;
  passed: boolean;
  measurement: string;
  target: string;
}

async function runEmpiricalHarness() {
  console.log('========================================================================');
  console.log('🔍 ALGONOTEBOOK M2 EMPIRICAL CHALLENGER VERIFICATION HARNESS');
  console.log('========================================================================\n');

  const serverManager = new TestServerManager();
  await serverManager.ensureServer();

  const executablePath = resolveChromiumPath();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const results: ChallengerResult[] = [];

  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  function record(suite: string, test: string, passed: boolean, measurement: string, target: string) {
    results.push({ suite, test, passed, measurement, target });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [${suite}] ${test}`);
    console.log(`    Target:      ${target}`);
    console.log(`    Measured:    ${measurement}`);
  }

  try {
    // -------------------------------------------------------------------------
    // 1. DISPATCH TASK 1: Responsive Layout & 0 Horizontal Overflow Across Viewports
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Multi-Viewport Layout Integrity & Document 0-Overflow ---');

    for (const vp of TARGET_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

      const docOverflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          bodyScrollWidth: body.scrollWidth,
          innerWidth: window.innerWidth,
          hasDocOverflow: doc.scrollWidth > window.innerWidth,
          hasBodyOverflow: body.scrollWidth > window.innerWidth,
        };
      });

      record(
        'Layout Overflow',
        `0 Horizontal Overflow on ${vp.name}`,
        !docOverflow.hasDocOverflow && !docOverflow.hasBodyOverflow,
        `scrollWidth=${docOverflow.scrollWidth}px, clientWidth=${docOverflow.clientWidth}px, innerWidth=${docOverflow.innerWidth}px`,
        `scrollWidth === clientWidth === ${vp.width}px`
      );

      // Measure Transport Bar (Speed Button & Scrubber)
      const speedBtn = page.locator('footer button:has(.lucide-gauge)').first();
      const speedBox = await speedBtn.boundingBox();
      const scrubber = page.locator('footer input[type="range"]').first();
      const scrubberBox = await scrubber.boundingBox();

      if (speedBox) {
        const speedRight = speedBox.x + speedBox.width;
        record(
          'Transport Bar',
          `Speed Button Boundary on ${vp.name}`,
          speedRight <= vp.width,
          `right=${speedRight.toFixed(1)}px (x=${speedBox.x.toFixed(1)}px, w=${speedBox.width.toFixed(1)}px)`,
          `right <= ${vp.width}px`
        );
      }

      if (scrubberBox) {
        const targetWidth = vp.width <= 375 ? 80 : 80;
        record(
          'Transport Bar',
          `Timeline Scrubber Width on ${vp.name}`,
          scrubberBox.width >= targetWidth,
          `width=${scrubberBox.width.toFixed(1)}px`,
          `width >= ${targetWidth}px`
        );
      }
    }

    // -------------------------------------------------------------------------
    // 2. DISPATCH TASK 1: F10 CallStackWidget Clearance & Scrollability on 1024x768 & 1280x800
    // -------------------------------------------------------------------------
    console.log('\n--- 2. F10 CallStackWidget Vertical Clearance & Scrollability ---');
    const clearanceTargets = [
      { name: 'Laptop 1024x768 (XGA)', width: 1024, height: 768 },
      { name: 'Desktop 1280x800 (WXGA)', width: 1280, height: 800 },
    ];

    for (const vp of clearanceTargets) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

      const initialMetrics = await page.evaluate(() => {
        const titleSpan = Array.from(document.querySelectorAll('span')).find(
          (el) => el.textContent?.trim() === 'Pila de Llamadas: Traza Recursiva'
        );
        const widget = titleSpan?.closest('div.shadow-tactile-card') as HTMLElement | null;
        const footer = document.querySelector('footer') as HTMLElement | null;

        const wRect = widget?.getBoundingClientRect();
        const fRect = footer?.getBoundingClientRect();

        return {
          foundWidget: !!widget,
          docScrollHeight: document.documentElement.scrollHeight,
          docClientHeight: document.documentElement.clientHeight,
          wBottom: wRect ? wRect.bottom : 0,
          fTop: fRect ? fRect.y : 0,
          canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
        };
      });

      record(
        'F10 Clearance',
        `Document Scrollability on ${vp.name}`,
        initialMetrics.canScroll,
        `scrollHeight=${initialMetrics.docScrollHeight}px > clientHeight=${initialMetrics.docClientHeight}px`,
        'Document allows vertical scrolling to reveal lower components'
      );

      // Scroll document to bottom to reveal CallStackWidget
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForTimeout(200);

      const scrolledMetrics = await page.evaluate(() => {
        const titleSpan = Array.from(document.querySelectorAll('span')).find(
          (el) => el.textContent?.trim() === 'Pila de Llamadas: Traza Recursiva'
        );
        const widget = titleSpan?.closest('div.shadow-tactile-card') as HTMLElement | null;
        const footer = document.querySelector('footer') as HTMLElement | null;

        const wRect = widget?.getBoundingClientRect();
        const fRect = footer?.getBoundingClientRect();

        const wBottom = wRect ? wRect.bottom : 0;
        const fTop = fRect ? fRect.y : 0;
        const clearance = fTop - wBottom;

        return {
          wBottom,
          fTop,
          clearance,
          isClear: wBottom <= fTop,
        };
      });

      record(
        'F10 Clearance',
        `CallStackWidget Clearance Above Footer on ${vp.name}`,
        scrolledMetrics.isClear,
        `widgetBottom=${scrolledMetrics.wBottom.toFixed(1)}px, footerTop=${scrolledMetrics.fTop.toFixed(1)}px (clearance=${scrolledMetrics.clearance.toFixed(1)}px)`,
        `widgetBottom <= footerTop (clearance >= 0px)`
      );
    }

    // -------------------------------------------------------------------------
    // 3. F11 Mobile Navigation Navigation Flow (< 1024px)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. F11 Mobile & Tablet Navigation Accessibility ---');
    const mobileNavSizes = [
      { name: '375x667', width: 375, height: 667 },
      { name: '768x1024', width: 768, height: 1024 },
    ];

    for (const vp of mobileNavSizes) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

      const mobileNav = page.locator('nav[aria-label="Navegación móvil"]');
      const isVisible = await mobileNav.isVisible();
      record(
        'F11 Mobile Nav',
        `Mobile Nav Visible on ${vp.name}`,
        isVisible,
        isVisible ? 'Visible in DOM' : 'Not visible',
        'Visible on viewports < 1024px'
      );

      // Verify all 4 tabs switch and produce 0 horizontal overflow
      const tabs = [
        { label: 'Currículum', signature: 'Unidades Temáticas' },
        { label: 'Cuadernos', signature: 'Laboratorio de Práctica' },
        { label: 'Lab Complejidad', signature: 'Laboratorio Asintótico' },
        { label: 'Visualizador', signature: 'footer' },
      ];

      for (const tab of tabs) {
        await mobileNav.locator(`button:has-text("${tab.label}")`).click();
        await page.waitForTimeout(150);

        const tabCheck = await page.evaluate(() => {
          const doc = document.documentElement;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            noOverflow: doc.scrollWidth <= window.innerWidth,
          };
        });

        record(
          'F11 Mobile Nav',
          `Tab [${tab.label}] 0-Overflow on ${vp.name}`,
          tabCheck.noOverflow,
          `scrollWidth=${tabCheck.scrollWidth}px, clientWidth=${tabCheck.clientWidth}px`,
          `scrollWidth <= ${vp.width}px`
        );
      }
    }

    // Verify Mobile Nav is hidden on desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(100);
    const isMobileNavHiddenDesktop = !(await page.locator('nav[aria-label="Navegación móvil"]').isVisible());
    record(
      'F11 Mobile Nav',
      'Mobile Nav Hidden on Desktop (1440x900)',
      isMobileNavHiddenDesktop,
      isMobileNavHiddenDesktop ? 'Hidden (lg:hidden)' : 'Still visible on desktop',
      'Hidden on >= 1024px'
    );

    // -------------------------------------------------------------------------
    // 4. F12 Modal Containment & Accessibility
    // -------------------------------------------------------------------------
    console.log('\n--- 4. F12 Modal Containment & Lifecycle ---');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(200);

    // 4.1 Technical Sheet Modal
    await page.locator('button:has-text("Ficha Técnica")').first().click();
    await page.waitForTimeout(200);

    const techSheetDialog = page.locator('div[role="dialog"]');
    const isTechOpen = (await techSheetDialog.count()) > 0;
    const techOverscroll = await page.evaluate(() => {
      const scrollableBody = document.querySelector('div[role="dialog"] .overflow-y-auto');
      return scrollableBody ? window.getComputedStyle(scrollableBody).overscrollBehavior : '';
    });
    record(
      'F12 Modals',
      'Technical Sheet overscroll-contain Active',
      isTechOpen && techOverscroll === 'contain',
      `open=${isTechOpen}, overscrollBehavior="${techOverscroll}"`,
      'overscroll-behavior: contain'
    );

    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    record(
      'F12 Modals',
      'Technical Sheet Dismissed via Escape',
      (await techSheetDialog.count()) === 0,
      `dialogCount=${await techSheetDialog.count()}`,
      '0 dialogs mounted after Escape'
    );

    // 4.2 Laboratory Settings Modal
    const settingsBtn = page.locator('button[aria-label="Ajustes de Laboratorio"]').first();
    await settingsBtn.click();
    await page.waitForTimeout(200);

    const settingsDialog = page.locator('div[role="dialog"]');
    const isSettingsOpen = (await settingsDialog.count()) > 0;
    const settingsOverscroll = await page.evaluate(() => {
      const scrollableBody = document.querySelector('div[role="dialog"] .overflow-y-auto');
      return scrollableBody ? window.getComputedStyle(scrollableBody).overscrollBehavior : '';
    });
    record(
      'F12 Modals',
      'Laboratory Settings overscroll-contain Active',
      isSettingsOpen && settingsOverscroll === 'contain',
      `open=${isSettingsOpen}, overscrollBehavior="${settingsOverscroll}"`,
      'overscroll-behavior: contain'
    );

    const settingsCloseBtn = page.locator('div[role="dialog"] button[aria-label="Cerrar modal"]').first();
    await settingsCloseBtn.click();
    await page.waitForTimeout(150);
    record(
      'F12 Modals',
      'Laboratory Settings Dismissed via Close Button',
      (await settingsDialog.count()) === 0,
      `dialogCount=${await settingsDialog.count()}`,
      '0 dialogs mounted after close button'
    );

    // 4.3 Keyboard Shortcuts Modal
    await page.keyboard.press('?');
    await page.waitForTimeout(200);
    const shortcutsDialog = page.locator('div[role="dialog"]');
    const isShortcutsOpen = (await shortcutsDialog.count()) > 0;
    const shortcutsOverscroll = await page.evaluate(() => {
      const scrollableBody = document.querySelector('div[role="dialog"] .overflow-y-auto');
      return scrollableBody ? window.getComputedStyle(scrollableBody).overscrollBehavior : '';
    });
    record(
      'F12 Modals',
      'Keyboard Shortcuts overscroll-contain Active',
      isShortcutsOpen && shortcutsOverscroll === 'contain',
      `open=${isShortcutsOpen}, overscrollBehavior="${shortcutsOverscroll}"`,
      'overscroll-behavior: contain'
    );

    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);

    // -------------------------------------------------------------------------
    // 5. F13 Focus Rings on Interactive Controls
    // -------------------------------------------------------------------------
    console.log('\n--- 5. F13 Accessible Focus Indicators ---');
    const focusSelectors = [
      'footer button[aria-label="Paso anterior"]',
      'footer button[aria-label="Paso siguiente"]',
      'footer button[aria-label="Velocidad de reproducción"]',
      'header button[aria-label="Ajustes de Laboratorio"]',
      'header button[aria-label="Atajos de Teclado"]',
    ];

    for (const sel of focusSelectors) {
      const el = page.locator(sel).first();
      const hasFocusStyles = await el.evaluate((btn) => {
        const cls = btn.className;
        return (
          cls.includes('focus-visible:ring-1') &&
          cls.includes('focus-visible:ring-ink-primary') &&
          cls.includes('focus-visible:outline-none')
        );
      });
      record(
        'F13 Focus Rings',
        `Focus Ring on ${sel}`,
        hasFocusStyles,
        hasFocusStyles ? 'Classes populated' : 'Missing focus-visible classes',
        'focus-visible:ring-1 focus-visible:ring-ink-primary focus-visible:outline-none'
      );
    }

    // -------------------------------------------------------------------------
    // 6. Global Error-Freedom
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Runtime Error-Freedom ---');
    record(
      'Runtime Errors',
      'Console Errors',
      consoleErrors.length === 0,
      `${consoleErrors.length} errors: ${consoleErrors.join(', ')}`,
      '0 console errors'
    );
    record(
      'Runtime Errors',
      'Page Exceptions',
      pageErrors.length === 0,
      `${pageErrors.length} exceptions: ${pageErrors.join(', ')}`,
      '0 unhandled exceptions'
    );

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n========================================================================');
    console.log('📊 EMPIRICAL HARNESS RESULTS SUMMARY');
    console.log('========================================================================');
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;
    console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${failed}`);

    if (failed === 0) {
      console.log('🎉 ALL EMPIRICAL CHALLENGER ASSERTIONS PASSED WITH ZERO DEFECTS!');
      process.exit(0);
    } else {
      console.error(`💥 ${failed} EMPIRICAL ASSERTIONS FAILED!`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal harness error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runEmpiricalHarness();
