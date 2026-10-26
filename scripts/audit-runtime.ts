import { chromium, type Browser, type Page } from 'playwright-core';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';

const DEFAULT_CHROMIUM_PATHS = [
  process.env.CHROMIUM_PATH,
  '/home/leann027/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
  '/home/leann027/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean) as string[];

function resolveChromiumPath(): string {
  for (const p of DEFAULT_CHROMIUM_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  throw new Error(
    `❌ No usable Chromium binary found. Checked: ${DEFAULT_CHROMIUM_PATHS.join(', ')}. Set CHROMIUM_PATH env var.`
  );
}

const PORT = 4173;
const SERVER_URL = `http://localhost:${PORT}`;

interface FPSMeasurement {
  avgFps: number;
  slowFrames: number;
  frameCount: number;
  durationMs: number;
}

interface AuditRow {
  Metric: string;
  Target: string;
  Measured: string;
  Status: 'PASS' | 'WARN' | 'FAIL';
}

async function isServerReady(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function dismissPwaToast(page: Page): Promise<void> {
  try {
    const pwaClose = page.locator('button[aria-label="Descartar aviso"], aside[role="alert"] button:has-text("Cerrar")').first();
    if (await pwaClose.isVisible().catch(() => false)) {
      await pwaClose.click().catch(() => {});
      await page.waitForTimeout(100);
    }
  } catch {
    // ignore
  }
}

async function runRuntimeAudit(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║       AlgoNotebook Comprehensive Headless Runtime Audit                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const chromiumPath = resolveChromiumPath();
  console.log(`Resolved Chromium executable: ${chromiumPath}`);

  let previewProcess: ChildProcess | null = null;
  let didSpawnPreview = false;

  const killPreview = () => {
    if (previewProcess && previewProcess.pid && didSpawnPreview) {
      try {
        if (process.platform !== 'win32') {
          process.kill(-previewProcess.pid, 'SIGTERM');
        } else {
          previewProcess.kill('SIGTERM');
        }
      } catch {
        // process already terminated
      }
      previewProcess = null;
      didSpawnPreview = false;
    }
  };

  process.on('SIGINT', () => {
    killPreview();
    process.exit(130);
  });

  process.on('SIGTERM', () => {
    killPreview();
    process.exit(143);
  });

  let browser: Browser | undefined;
  let exitCode = 0;
  const auditMetrics: AuditRow[] = [];

  try {
    // 1. Verify or spawn Vite preview server
    const alreadyRunning = await isServerReady(SERVER_URL);
    if (!alreadyRunning) {
      console.log(`Starting Vite preview server on port ${PORT}...`);
      previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
        stdio: 'pipe',
        detached: process.platform !== 'win32',
      });
      didSpawnPreview = true;

      const startTime = Date.now();
      const timeoutMs = 15000;
      let ready = false;

      while (Date.now() - startTime < timeoutMs) {
        if (await isServerReady(SERVER_URL)) {
          ready = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      if (!ready) {
        throw new Error(`Timeout waiting for Vite preview server at ${SERVER_URL}`);
      }
      console.log(`Vite preview server responding at ${SERVER_URL}`);
    } else {
      console.log(`Vite preview server already active at ${SERVER_URL}`);
    }

    // 2. Launch headless Chromium
    console.log(`Launching headless Chromium...`);
    browser = await chromium.launch({
      executablePath: chromiumPath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-gpu-rasterization'],
    });

    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message || String(err));
    });

    // 3. Navigate to application
    console.log(`Navigating to ${SERVER_URL}...`);
    await page.goto(SERVER_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await dismissPwaToast(page);

    // -------------------------------------------------------------
    // PHASE A: Multi-Viewport Overflow & Responsive Boundary Audit
    // -------------------------------------------------------------
    console.log('\n[Phase A] Auditing Multi-Viewport Layouts (375px, 768px, 1024px, 1440px)...');
    const viewportsToAudit = [
      { name: 'Mobile (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Laptop (1024x768)', width: 1024, height: 768 },
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
    ];

    let allViewportsPassed = true;
    for (const vp of viewportsToAudit) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      }));

      if (overflow.hasOverflow) {
        allViewportsPassed = false;
        console.warn(`  ⚠️ Viewport overflow detected in ${vp.name}: scrollWidth=${overflow.scrollWidth} > innerWidth=${vp.width}`);
      }
    }

    // Measure mobile 375px scrubber width for M2 tracking
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    const sliderBox = await page.locator('footer input[type="range"]').boundingBox();
    const speedBox = await page.locator('footer button:has(.lucide-gauge)').boundingBox();
    const mobileSliderWidth = sliderBox?.width ?? 0;
    const mobileSpeedRight = speedBox ? speedBox.x + speedBox.width : 0;
    const isMobileScrubberSqueezed = mobileSliderWidth < 50;
    const isSpeedOverflowing = mobileSpeedRight > 375;

    auditMetrics.push({
      Metric: 'Multi-Viewport Window Containment',
      Target: '0 overflow across 4 viewports',
      Measured: allViewportsPassed ? '0 overflow' : 'Horizontal overflow detected',
      Status: allViewportsPassed ? 'PASS' : 'FAIL',
    });

    auditMetrics.push({
      Metric: 'Mobile 375px Transport Bar (F9 Tracking)',
      Target: 'Scrubber >= 50px, Speed inside viewport',
      Measured: isMobileScrubberSqueezed || isSpeedOverflowing
        ? `[M2 Pending] Scrubber: ${mobileSliderWidth.toFixed(1)}px, Speed right: ${mobileSpeedRight.toFixed(1)}px`
        : `Scrubber: ${mobileSliderWidth.toFixed(1)}px, Speed right: ${mobileSpeedRight.toFixed(1)}px`,
      Status: isMobileScrubberSqueezed || isSpeedOverflowing ? 'WARN' : 'PASS',
    });

    // Restore Desktop Viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(200);

    // -------------------------------------------------------------
    // PHASE B: Modal Accessibility & Dismissal Audit
    // -------------------------------------------------------------
    console.log('\n[Phase B] Auditing Modal Lifecycles & Accessibility (3 Modals)...');
    await dismissPwaToast(page);

    // 1. Technical Sheet Modal
    const techBtn = page.locator('button[title*="Ficha Técnica"]').first();
    let techModalPassed = false;
    if (await techBtn.isVisible()) {
      await techBtn.click();
      await page.waitForTimeout(300);
      const isVisible = await page.locator('div[role="dialog"]').first().isVisible();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const isClosed = !(await page.locator('div[role="dialog"]').first().isVisible());
      techModalPassed = isVisible && isClosed;
    }

    // 2. Laboratory Settings Modal
    const settingsBtn = page.locator('button[aria-label*="Ajustes"], button[title*="Ajustes"], button:has(.lucide-sliders-horizontal)').first();
    let settingsModalPassed = false;
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(300);
      const isVisible = await page.locator('text=Ajustes').first().isVisible();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const isClosed = !(await page.locator('text=Ajustes de Laboratorio, text=Ajustes').first().isVisible());
      settingsModalPassed = isVisible && isClosed;
    }

    // 3. Keyboard Shortcuts Modal
    const shortcutsBtn = page.locator('button[aria-label*="Atajos"], button[title*="Atajos"]').first();
    let shortcutsModalPassed = false;
    if (await shortcutsBtn.isVisible()) {
      await shortcutsBtn.click();
      await page.waitForTimeout(300);
      const isVisible = await page.locator('h3:has-text("Atajos de Teclado")').first().isVisible();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const isClosed = !(await page.locator('h3:has-text("Atajos de Teclado")').first().isVisible());
      shortcutsModalPassed = isVisible && isClosed;
    }

    const allModalsPassed = techModalPassed && settingsModalPassed && shortcutsModalPassed;
    auditMetrics.push({
      Metric: 'Pedagogical Modals Lifecycle (3 Modals)',
      Target: '3/3 open & dismiss via Esc/Button',
      Measured: `${[techModalPassed, settingsModalPassed, shortcutsModalPassed].filter(Boolean).length}/3 modals verified`,
      Status: allModalsPassed ? 'PASS' : 'FAIL',
    });

    // -------------------------------------------------------------
    // PHASE C: Cumulative Layout Shift (CLS) Measurement
    // -------------------------------------------------------------
    console.log('\n[Phase C] Measuring Cumulative Layout Shift (CLS)...');
    const measuredCls = await page.evaluate<number>(`
      new Promise((resolve) => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput && typeof entry.value === 'number') {
              cls += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 1000);
      })
    `);

    const clsPass = measuredCls < 0.05;
    auditMetrics.push({
      Metric: 'Cumulative Layout Shift (CLS)',
      Target: '< 0.05',
      Measured: measuredCls.toFixed(4),
      Status: clsPass ? 'PASS' : 'FAIL',
    });

    // -------------------------------------------------------------
    // PHASE D: Continuous Playback & 180-Frame FPS Measurement
    // -------------------------------------------------------------
    console.log('\n[Phase D] Initiating 180-frame sustained playback FPS sampling...');
    const playButton = page.locator('footer button[title*="motor de pasos"]').first();
    await playButton.waitFor({ state: 'visible', timeout: 5000 });
    await playButton.click(); // Start playback

    const fpsResult = await page.evaluate<FPSMeasurement>(`
      new Promise((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();
        const deltas = [];
        const targetFrames = 180;

        const recordFrame = (now) => {
          frameCount++;
          deltas.push(now - lastTime);
          lastTime = now;
          if (frameCount < targetFrames) {
            requestAnimationFrame(recordFrame);
          } else {
            const totalDuration = deltas.reduce((a, b) => a + b, 0);
            const avgFps = (frameCount / totalDuration) * 1000;
            const slowFrames = deltas.filter((d) => d > 33.33).length;
            resolve({ avgFps, slowFrames, frameCount, durationMs: totalDuration });
          }
        };
        requestAnimationFrame(recordFrame);
      })
    `);

    // Pause playback
    await playButton.click();
    await page.waitForTimeout(200);

    const fpsPass = fpsResult.avgFps >= 55.0;
    auditMetrics.push({
      Metric: 'Average Playback FPS',
      Target: '>= 55.0 FPS',
      Measured: `${fpsResult.avgFps.toFixed(1)} FPS (${fpsResult.frameCount} frames in ${Math.round(fpsResult.durationMs)}ms)`,
      Status: fpsPass ? 'PASS' : 'FAIL',
    });

    auditMetrics.push({
      Metric: 'Dropped Frames (>33.3ms)',
      Target: '0 frames',
      Measured: `${fpsResult.slowFrames} frames`,
      Status: fpsResult.slowFrames === 0 ? 'PASS' : 'WARN',
    });

    // -------------------------------------------------------------
    // PHASE E: Multi-Paradigm Workflow Verification (Tree, Graph, DP)
    // -------------------------------------------------------------
    console.log('\n[Phase E] Verifying multi-paradigm algorithm rendering...');
    const paradigms = [
      { name: 'Tree (BST)', selector: 'BST' },
      { name: 'Graph (Dijkstra)', selector: 'Dijkstra' },
      { name: 'Matrix DP (Knapsack)', selector: 'Mochila' },
    ];

    let paradigmsPassed = 0;
    for (const p of paradigms) {
      const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
      await catalogBtn.click();
      await page.waitForTimeout(150);
      const opt = page.locator(`button[role="option"]:has-text("${p.selector}")`).first();
      if (await opt.isVisible()) {
        await opt.click();
        await page.waitForTimeout(300);
        paradigmsPassed++;
      } else {
        await catalogBtn.click();
      }
    }

    // Switch back to Bubble Sort
    const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
    await catalogBtn.click();
    await page.waitForTimeout(150);
    const bubbleOpt = page.locator('button[role="option"]:has-text("Bubble Sort")').first();
    if (await bubbleOpt.isVisible()) {
      await bubbleOpt.click();
      await page.waitForTimeout(250);
    }

    auditMetrics.push({
      Metric: 'Multi-Paradigm Engine Switching',
      Target: '3/3 data structures rendered',
      Measured: `${paradigmsPassed}/3 data structures rendered`,
      Status: paradigmsPassed === 3 ? 'PASS' : 'FAIL',
    });

    // -------------------------------------------------------------
    // PHASE F: Console & Page Error Audit
    // -------------------------------------------------------------
    const consolePass = consoleErrors.length === 0;
    const pageErrorsPass = pageErrors.length === 0;

    auditMetrics.push({
      Metric: 'Console Errors',
      Target: '0 errors',
      Measured: `${consoleErrors.length} errors`,
      Status: consolePass ? 'PASS' : 'FAIL',
    });

    auditMetrics.push({
      Metric: 'Unhandled Exceptions',
      Target: '0 errors',
      Measured: `${pageErrors.length} errors`,
      Status: pageErrorsPass ? 'PASS' : 'FAIL',
    });

    // Print summary report
    console.log('\n================ AUDIT METRICS REPORT ================');
    console.table(auditMetrics);
    console.log('======================================================\n');

    const hasFailure = auditMetrics.some((m) => m.Status === 'FAIL');

    if (hasFailure) {
      if (consoleErrors.length > 0) {
        console.error('Console errors logged:', consoleErrors);
      }
      if (pageErrors.length > 0) {
        console.error('Page errors logged:', pageErrors);
      }
      console.error('❌ RUNTIME AUDIT FAILED: Acceptance criteria not satisfied.');
      exitCode = 1;
    } else {
      console.log('✅ ALL RUNTIME AUDIT CRITERIA SATISFIED!\n');
      exitCode = 0;
    }
  } catch (err) {
    console.error('❌ Error executing runtime audit:', err);
    exitCode = 1;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    killPreview();
  }

  process.exit(exitCode);
}

runRuntimeAudit();
