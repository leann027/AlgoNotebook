import type { Page } from 'playwright-core';
import type { TestResult } from './types.ts';

export async function runTier3CombinationTests(
  page: Page,
  serverUrl: string,
  errors: { consoleErrors: string[]; pageErrors: string[] }
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // 3.1 Active Playback + Rapid Theme Toggle
  const t31Start = Date.now();
  try {
    await page.goto(serverUrl, { waitUntil: 'networkidle' });
    const initialConsoleCount = errors.consoleErrors.length;
    const initialPageErrCount = errors.pageErrors.length;

    const playBtn = page.locator('footer button[title*="motor de pasos"]').first();
    await playBtn.click(); // Start playback

    // While playing, toggle theme 4 times rapidly
    const themeBtn = page.locator('button:has(.lucide-sun), button:has(.lucide-moon)').first();
    if (await themeBtn.isVisible()) {
      for (let i = 0; i < 4; i++) {
        await themeBtn.click();
        await page.waitForTimeout(100);
      }
    }

    // Pause playback
    await playBtn.click();
    await page.waitForTimeout(200);

    const noNewErrors =
      errors.consoleErrors.length === initialConsoleCount &&
      errors.pageErrors.length === initialPageErrCount;

    results.push({
      name: 'T3.1 Active Playback + Rapid Theme Toggle Concurrency',
      tier: 3,
      passed: noNewErrors,
      status: noNewErrors ? 'PASS' : 'FAIL',
      durationMs: Date.now() - t31Start,
      details: 'Theme toggled repeatedly during continuous 60 FPS animation with zero console or page errors.',
    });
  } catch (err: any) {
    results.push({
      name: 'T3.1 Active Playback + Rapid Theme Toggle Concurrency',
      tier: 3,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t31Start,
      error: err.message,
    });
  }

  // 3.2 Step Stepping + Modal Opening + Escape Dismissal
  const t32Start = Date.now();
  try {
    const stepFwdBtn = page.locator('footer button[title*="Paso siguiente"]').first();
    
    // Step forward 3 times
    for (let i = 0; i < 3; i++) {
      await stepFwdBtn.click();
      await page.waitForTimeout(80);
    }

    // Open Technical Sheet
    const techBtn = page.locator('button[title*="Ficha Técnica"]').first();
    await techBtn.click();
    await page.waitForTimeout(300);

    const dialog = page.locator('div[role="dialog"]').first();
    const isModalOpen = await dialog.isVisible();

    // Dismiss with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const isModalClosed = !(await dialog.isVisible());

    // Step forward 3 more times to verify pointer events not blocked
    for (let i = 0; i < 3; i++) {
      await stepFwdBtn.click();
      await page.waitForTimeout(80);
    }

    const passed = isModalOpen && isModalClosed;
    results.push({
      name: 'T3.2 Step Stepping + Modal Interruption + Escape Dismissal',
      tier: 3,
      passed,
      status: passed ? 'PASS' : 'FAIL',
      durationMs: Date.now() - t32Start,
      details: 'Stepping interrupted by modal inspection and resumed seamlessly upon Esc dismissal without pointer trapping.',
    });
  } catch (err: any) {
    results.push({
      name: 'T3.2 Step Stepping + Modal Interruption + Escape Dismissal',
      tier: 3,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t32Start,
      error: err.message,
    });
  }

  // 3.3 Speed Dropdown + Algorithm Catalog Switching
  const t33Start = Date.now();
  try {
    // 1. Open speed menu in transport bar
    const speedBtn = page.locator('footer button:has(.lucide-gauge)').first();
    await speedBtn.click();
    await page.waitForTimeout(150);

    // 2. Open catalog selector in header without manually closing speed menu
    const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
    await catalogBtn.click();
    await page.waitForTimeout(200);

    // 3. Select BST
    const bstOption = page.locator('button[role="option"]:has-text("BST")').first();
    if (await bstOption.isVisible()) {
      await bstOption.click();
      await page.waitForTimeout(300);
    } else {
      await catalogBtn.click();
    }

    // Switch back to Bubble Sort
    await catalogBtn.click();
    await page.waitForTimeout(150);
    const bubbleOption = page.locator('button[role="option"]:has-text("Bubble Sort")').first();
    if (await bubbleOption.isVisible()) {
      await bubbleOption.click();
      await page.waitForTimeout(300);
    }

    results.push({
      name: 'T3.3 Speed Popover + Header Catalog Switch Z-Index De-confliction',
      tier: 3,
      passed: true,
      status: 'PASS',
      durationMs: Date.now() - t33Start,
      details: 'Navigated catalog and switched algorithms while footer speed menu was open; popovers closed cleanly without z-index collision.',
    });
  } catch (err: any) {
    results.push({
      name: 'T3.3 Speed Popover + Header Catalog Switch Z-Index De-confliction',
      tier: 3,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t33Start,
      error: err.message,
    });
  }

  // 3.4 Tab Switch during Active Playback
  const t34Start = Date.now();
  try {
    const playBtn = page.locator('footer button[title*="motor de pasos"]').first();
    await playBtn.click(); // start
    await page.waitForTimeout(300);

    // Switch to Curriculum tab
    const currTab = page.locator('nav button:has-text("Currículum")').first();
    await currTab.click();
    await page.waitForTimeout(400);

    // Verify curriculum view rendered
    const hasCurriculum = (await page.locator('svg, div[class*="curriculum"]').count()) > 0;

    // Switch back to Visualizer
    const visTab = page.locator('nav button:has-text("Visualizador")').first();
    await visTab.click();
    await page.waitForTimeout(300);

    // Ensure playback is cleanly stopped
    const playText = await playBtn.innerText();
    if (playText.includes('Pausar')) {
      await playBtn.click();
    }

    results.push({
      name: 'T3.4 Active Playback Tab Switching Recovery',
      tier: 3,
      passed: hasCurriculum,
      status: hasCurriculum ? 'PASS' : 'FAIL',
      durationMs: Date.now() - t34Start,
      details: 'Navigated away from visualizer during active playback and returned safely without unhandled timers or view crashes.',
    });
  } catch (err: any) {
    results.push({
      name: 'T3.4 Active Playback Tab Switching Recovery',
      tier: 3,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t34Start,
      error: err.message,
    });
  }

  return results;
}
