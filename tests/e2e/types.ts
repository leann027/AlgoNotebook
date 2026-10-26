import { chromium, type Browser, type Page } from 'playwright-core';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';

export interface TestResult {
  name: string;
  tier: 1 | 2 | 3 | 4;
  passed: boolean;
  status: 'PASS' | 'WARN' | 'FAIL';
  durationMs: number;
  details?: string;
  error?: string;
}

export interface FPSMeasurement {
  avgFps: number;
  slowFrames: number;
  frameCount: number;
  durationMs: number;
}

export const DEFAULT_CHROMIUM_PATHS = [
  process.env.CHROMIUM_PATH,
  '/home/leann027/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
  '/home/leann027/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean) as string[];

export function resolveChromiumPath(): string {
  for (const p of DEFAULT_CHROMIUM_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  throw new Error(
    `No usable Chromium binary found. Checked: ${DEFAULT_CHROMIUM_PATHS.join(', ')}. Set CHROMIUM_PATH env var.`
  );
}

export const PORT = 4173;
export const SERVER_URL = `http://localhost:${PORT}`;

export async function isServerReady(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.status === 200;
  } catch {
    return false;
  }
}

export class TestServerManager {
  private previewProcess: ChildProcess | null = null;
  private didSpawn = false;

  async ensureServer(): Promise<void> {
    const alreadyRunning = await isServerReady(SERVER_URL);
    if (alreadyRunning) {
      return;
    }

    this.previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
      stdio: 'pipe',
      detached: process.platform !== 'win32',
    });
    this.didSpawn = true;

    const start = Date.now();
    const timeout = 15000;
    while (Date.now() - start < timeout) {
      if (await isServerReady(SERVER_URL)) {
        return;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`Timeout starting Vite preview server on ${SERVER_URL}`);
  }

  stop(): void {
    if (this.previewProcess && this.previewProcess.pid && this.didSpawn) {
      try {
        if (process.platform !== 'win32') {
          process.kill(-this.previewProcess.pid, 'SIGTERM');
        } else {
          this.previewProcess.kill('SIGTERM');
        }
      } catch {
        // already stopped
      }
      this.previewProcess = null;
      this.didSpawn = false;
    }
  }
}

export async function launchTestBrowser(): Promise<{ browser: Browser; page: Page; errors: { consoleErrors: string[]; pageErrors: string[] } }> {
  const executablePath = resolveChromiumPath();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-gpu-rasterization'],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const errors = {
    consoleErrors: [] as string[],
    pageErrors: [] as string[],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    errors.pageErrors.push(err.message || String(err));
  });

  return { browser, page, errors };
}

export async function dismissPwaToast(page: Page): Promise<void> {
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

export async function measureCumulativeLayoutShift(page: Page, observationDurationMs = 1000): Promise<number> {
  // Use raw JS string to prevent tsx/esbuild helper injection (__name)
  return page.evaluate<number>(`
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
      }, ${observationDurationMs});
    })
  `);
}

export async function measureAnimationFPS(page: Page, targetFrames = 180): Promise<FPSMeasurement> {
  // Use raw JS string to prevent tsx/esbuild helper injection (__name)
  return page.evaluate<FPSMeasurement>(`
    new Promise((resolve) => {
      let frameCount = 0;
      let lastTime = performance.now();
      const deltas = [];
      const targetFrames = ${targetFrames};

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
}
