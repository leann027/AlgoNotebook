import { chromium } from 'playwright-core';
import { resolveChromiumPath, SERVER_URL, TestServerManager } from './types.ts';

async function diagnose() {
  const serverManager = new TestServerManager();
  await serverManager.ensureServer();

  const executablePath = resolveChromiumPath();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();

  console.log('=== EXACT CALLSTACK WIDGET POSITION ON 1024x768 ===');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const initial = await page.evaluate(() => {
    const titleSpan = Array.from(document.querySelectorAll('span')).find(
      (el) => el.textContent?.trim() === 'Pila de Llamadas: Traza Recursiva'
    );
    const widget = titleSpan?.closest('div.shadow-tactile-card') as HTMLElement | null;
    const footer = document.querySelector('footer') as HTMLElement | null;
    const main = document.querySelector('main') as HTMLElement | null;

    const wRect = widget?.getBoundingClientRect();
    const fRect = footer?.getBoundingClientRect();

    return {
      widgetFound: !!widget,
      initialScrollY: window.scrollY,
      docScrollHeight: document.documentElement.scrollHeight,
      docClientHeight: document.documentElement.clientHeight,
      mainScrollHeight: main?.scrollHeight,
      mainClientHeight: main?.clientHeight,
      wRect: wRect ? { y: wRect.y, bottom: wRect.bottom, height: wRect.height } : null,
      fRect: fRect ? { y: fRect.y, bottom: fRect.bottom, height: fRect.height } : null,
    };
  });
  console.log('Initial state:', JSON.stringify(initial, null, 2));

  // Scroll window to bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(200);

  const scrolledWindow = await page.evaluate(() => {
    const titleSpan = Array.from(document.querySelectorAll('span')).find(
      (el) => el.textContent?.trim() === 'Pila de Llamadas: Traza Recursiva'
    );
    const widget = titleSpan?.closest('div.shadow-tactile-card') as HTMLElement | null;
    const footer = document.querySelector('footer') as HTMLElement | null;

    const wRect = widget?.getBoundingClientRect();
    const fRect = footer?.getBoundingClientRect();

    return {
      windowScrollY: window.scrollY,
      wRect: wRect ? { y: wRect.y, bottom: wRect.bottom, height: wRect.height } : null,
      fRect: fRect ? { y: fRect.y, bottom: fRect.bottom, height: fRect.height } : null,
      clearance: (fRect?.y ?? 0) - (wRect?.bottom ?? 0),
    };
  });
  console.log('Scrolled window to bottom:', JSON.stringify(scrolledWindow, null, 2));

  console.log('\n=== EXACT CALLSTACK WIDGET POSITION ON 1280x800 ===');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(200);

  const scrolled1280 = await page.evaluate(() => {
    const titleSpan = Array.from(document.querySelectorAll('span')).find(
      (el) => el.textContent?.trim() === 'Pila de Llamadas: Traza Recursiva'
    );
    const widget = titleSpan?.closest('div.shadow-tactile-card') as HTMLElement | null;
    const footer = document.querySelector('footer') as HTMLElement | null;

    const wRect = widget?.getBoundingClientRect();
    const fRect = footer?.getBoundingClientRect();

    return {
      windowScrollY: window.scrollY,
      wRect: wRect ? { y: wRect.y, bottom: wRect.bottom, height: wRect.height } : null,
      fRect: fRect ? { y: fRect.y, bottom: fRect.bottom, height: fRect.height } : null,
      clearance: (fRect?.y ?? 0) - (wRect?.bottom ?? 0),
    };
  });
  console.log('Scrolled 1280x800 window to bottom:', JSON.stringify(scrolled1280, null, 2));

  await browser.close();
}

diagnose();
