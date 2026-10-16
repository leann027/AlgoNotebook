import { chromium } from 'playwright-core';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';

const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  '/home/leann027/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';

const PORT = 4173;
const SERVER_URL = `http://localhost:${PORT}`;

interface FPSMeasurement {
  avgFps: number;
  slowFrames: number;
  frameCount: number;
  durationMs: number;
}

async function isServerReady(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function runRuntimeAudit(): Promise<void> {
  console.log('🚀 Starting AlgoNotebook Automated Headless Runtime Audit...\n');

  // Verify Chromium binary existence
  if (!fs.existsSync(CHROMIUM_PATH)) {
    console.error(`❌ Chromium binary not found at: ${CHROMIUM_PATH}`);
    process.exit(1);
  }

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

  let browser;
  let exitCode = 0;

  try {
    // 1. Check if server is already running, or spawn Vite preview
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
    console.log(`Launching headless Chromium (${CHROMIUM_PATH})...`);
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
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

    // 4. Measure Cumulative Layout Shift (CLS) via PerformanceObserver
    console.log('Measuring Cumulative Layout Shift (CLS)...');
    const initialCls = await page.evaluate<number>(`
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

    // 5. Trigger Playback and Measure FPS over 180 continuous frames
    console.log('Initiating playback and sampling 180 animation frames...');
    const playButton = page
      .locator(
        'button[title*="motor de pasos"], button[title*="Ejecutar"], button[title*="Pausar"]'
      )
      .first();

    await playButton.waitFor({ state: 'visible', timeout: 5000 });
    await playButton.click();

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

    // 6. Modal / Sheet interaction verification
    console.log('Verifying Technical Sheet modal lifecycle...');
    const techSheetBtn = page.locator('button[title*="Ficha Técnica"]').first();
    if (await techSheetBtn.isVisible().catch(() => false)) {
      await techSheetBtn.click();
      await page.waitForTimeout(300);
      const closeBtn = page
        .locator('button[aria-label="Cerrar Ficha Técnica"], button[title*="Cerrar Ficha Técnica"]')
        .first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
      }
      await page.waitForTimeout(200);
    }

    // 7. Validate results against required thresholds
    const fpsPass = fpsResult.avgFps >= 55.0;
    const consolePass = consoleErrors.length === 0;
    const pageErrorsPass = pageErrors.length === 0;
    const clsPass = initialCls < 0.05;

    const passed = fpsPass && consolePass && pageErrorsPass && clsPass;

    console.log('\n================ AUDIT METRICS REPORT ================');
    console.table([
      {
        Metric: 'Average Playback FPS',
        Target: '>= 55.0 FPS',
        Measured: `${fpsResult.avgFps.toFixed(1)} FPS (${fpsResult.frameCount} frames in ${Math.round(fpsResult.durationMs)}ms)`,
        Status: fpsPass ? 'PASS' : 'FAIL',
      },
      {
        Metric: 'Dropped Frames (>33.3ms)',
        Target: '0 frames',
        Measured: `${fpsResult.slowFrames} frames`,
        Status: fpsResult.slowFrames === 0 ? 'PASS' : 'WARN',
      },
      {
        Metric: 'Console Errors',
        Target: '0 errors',
        Measured: `${consoleErrors.length} errors`,
        Status: consolePass ? 'PASS' : 'FAIL',
      },
      {
        Metric: 'Unhandled Exceptions',
        Target: '0 errors',
        Measured: `${pageErrors.length} errors`,
        Status: pageErrorsPass ? 'PASS' : 'FAIL',
      },
      {
        Metric: 'Cumulative Layout Shift',
        Target: '< 0.05',
        Measured: initialCls.toFixed(4),
        Status: clsPass ? 'PASS' : 'FAIL',
      },
    ]);
    console.log('======================================================\n');

    if (!passed) {
      if (consoleErrors.length > 0) {
        console.error('Console errors logged:', consoleErrors);
      }
      if (pageErrors.length > 0) {
        console.error('Page errors logged:', pageErrors);
      }
      console.error('❌ RUNTIME AUDIT FAILED: Acceptance criteria not satisfied.');
      exitCode = 1;
    } else {
      console.log('✅ ALL RUNTIME AUDIT CRITERIA SATISFIED!');
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
