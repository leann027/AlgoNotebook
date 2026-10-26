import type { Page } from 'playwright-core';
import {
  type TestResult,
  measureAnimationFPS,
  measureCumulativeLayoutShift,
} from './types.ts';

export async function runTier4ScenarioTests(
  page: Page,
  serverUrl: string,
  errors: { consoleErrors: string[]; pageErrors: string[] }
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // 4.1 End-to-End Sorting Workflow (Linear Array: Bubble Sort)
  const t41Start = Date.now();
  try {
    await page.goto(serverUrl, { waitUntil: 'networkidle' });

    // Select Bubble Sort
    const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
    await catalogBtn.click();
    await page.waitForTimeout(150);
    const bubbleOpt = page.locator('button[role="option"]:has-text("Bubble Sort")').first();
    if (await bubbleOpt.isVisible()) {
      await bubbleOpt.click();
      await page.waitForTimeout(250);
    }

    // Measure baseline CLS
    const initialCls = await measureCumulativeLayoutShift(page, 500);

    // Start playback
    const playBtn = page.locator('footer button[title*="motor de pasos"]').first();
    await playBtn.click();

    // Sample 180 frames during playback
    const fps = await measureAnimationFPS(page, 180);

    // Pause playback
    await playBtn.click();
    await page.waitForTimeout(200);

    // Measure post-playback CLS
    const postCls = await measureCumulativeLayoutShift(page, 500);
    const totalCls = initialCls + postCls;

    const fpsPass = fps.avgFps >= 55.0;
    const clsPass = totalCls < 0.05;
    const errorsPass = errors.consoleErrors.length === 0 && errors.pageErrors.length === 0;

    const passed = fpsPass && clsPass && errorsPass;
    results.push({
      name: 'T4.1 End-to-End Sorting Workflow (Linear Array)',
      tier: 4,
      passed,
      status: passed ? 'PASS' : 'FAIL',
      durationMs: Date.now() - t41Start,
      details: `FPS: ${fps.avgFps.toFixed(1)} (target >= 55.0), Dropped frames: ${fps.slowFrames}, CLS: ${totalCls.toFixed(4)} (target < 0.05), Errors: console=${errors.consoleErrors.length}, page=${errors.pageErrors.length}.`,
    });
  } catch (err: any) {
    results.push({
      name: 'T4.1 End-to-End Sorting Workflow (Linear Array)',
      tier: 4,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t41Start,
      error: err.message,
    });
  }

  // 4.2 End-to-End Tree Hierarchy Workflow (Tree Structure: BST)
  const t42Start = Date.now();
  try {
    const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
    await catalogBtn.click();
    await page.waitForTimeout(150);
    const bstOpt = page.locator('button[role="option"]:has-text("BST")').first();
    await bstOpt.click();
    await page.waitForTimeout(300);

    // Play 90 frames on tree
    const playBtn = page.locator('footer button[title*="motor de pasos"]').first();
    await playBtn.click();
    const fps = await measureAnimationFPS(page, 90);
    await playBtn.click();
    await page.waitForTimeout(200);

    const hasTreeSvg = (await page.locator('svg').count()) > 0;
    const passed = fps.avgFps >= 50.0 && hasTreeSvg;

    results.push({
      name: 'T4.2 End-to-End Tree Hierarchy Workflow (BST Inserción)',
      tier: 4,
      passed,
      status: passed ? 'PASS' : 'FAIL',
      durationMs: Date.now() - t42Start,
      details: `Tree hierarchy animation rendered at ${fps.avgFps.toFixed(1)} FPS with SVG node layout.`,
    });
  } catch (err: any) {
    results.push({
      name: 'T4.2 End-to-End Tree Hierarchy Workflow (BST Inserción)',
      tier: 4,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t42Start,
      error: err.message,
    });
  }

  // 4.3 End-to-End Graph Search Workflow (Graph Structure: Dijkstra)
  const t43Start = Date.now();
  try {
    const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
    await catalogBtn.click();
    await page.waitForTimeout(150);
    const dijkstraOpt = page.locator('button[role="option"]:has-text("Dijkstra")').first();
    await dijkstraOpt.click();
    await page.waitForTimeout(300);

    // Play 90 frames on graph
    const playBtn = page.locator('footer button[title*="motor de pasos"]').first();
    await playBtn.click();
    const fps = await measureAnimationFPS(page, 90);
    await playBtn.click();
    await page.waitForTimeout(200);

    const hasGraphSvg = (await page.locator('svg').count()) > 0;
    const passed = fps.avgFps >= 50.0 && hasGraphSvg;

    results.push({
      name: 'T4.3 End-to-End Graph Search Workflow (Dijkstra)',
      tier: 4,
      passed,
      status: passed ? 'PASS' : 'FAIL',
      durationMs: Date.now() - t43Start,
      details: `Graph topology and edge relaxation animation rendered at ${fps.avgFps.toFixed(1)} FPS.`,
    });
  } catch (err: any) {
    results.push({
      name: 'T4.3 End-to-End Graph Search Workflow (Dijkstra)',
      tier: 4,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t43Start,
      error: err.message,
    });
  }

  // 4.4 End-to-End Dynamic Programming Matrix Workflow (Grid Structure: Mochila 0/1)
  const t44Start = Date.now();
  try {
    const catalogBtn = page.locator('button[aria-haspopup="listbox"]').first();
    await catalogBtn.click();
    await page.waitForTimeout(150);
    const knapsackOpt = page.locator('button[role="option"]:has-text("Mochila")').first();
    await knapsackOpt.click();
    await page.waitForTimeout(300);

    // Play 90 frames on DP matrix
    const playBtn = page.locator('footer button[title*="motor de pasos"]').first();
    await playBtn.click();
    const fps = await measureAnimationFPS(page, 90);
    await playBtn.click();
    await page.waitForTimeout(200);

    const hasMatrixGrid = (await page.locator('table, div[class*="grid"], div[class*="matrix"]').count()) > 0;
    const passed = fps.avgFps >= 50.0 && hasMatrixGrid;

    results.push({
      name: 'T4.4 End-to-End Matrix DP Workflow (Mochila 0/1)',
      tier: 4,
      passed,
      status: passed ? 'PASS' : 'FAIL',
      durationMs: Date.now() - t44Start,
      details: `DP 2D grid memoization matrix and cell activation rendered at ${fps.avgFps.toFixed(1)} FPS.`,
    });
  } catch (err: any) {
    results.push({
      name: 'T4.4 End-to-End Matrix DP Workflow (Mochila 0/1)',
      tier: 4,
      passed: false,
      status: 'FAIL',
      durationMs: Date.now() - t44Start,
      error: err.message,
    });
  }

  // 4.5 Global Runtime Integrity Certification
  const t45Start = Date.now();
  const totalConsoleErrors = errors.consoleErrors.length;
  const totalPageErrors = errors.pageErrors.length;
  const zeroErrors = totalConsoleErrors === 0 && totalPageErrors === 0;

  results.push({
    name: 'T4.5 Global Runtime Error-Freedom Certification',
    tier: 4,
    passed: zeroErrors,
    status: zeroErrors ? 'PASS' : 'FAIL',
    durationMs: Date.now() - t45Start,
    details: `Total unhandled console errors: ${totalConsoleErrors}, Total unhandled page errors: ${totalPageErrors}. Target: 0.`,
    ...(zeroErrors ? {} : { error: `Errors detected: console=${errors.consoleErrors.join(' | ')}, page=${errors.pageErrors.join(' | ')}` }),
  });

  return results;
}
