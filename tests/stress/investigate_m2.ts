import { chromium } from 'playwright-core';
import { resolveChromiumPath, SERVER_URL, TestServerManager } from '../e2e/types.ts';

async function investigate() {
  const serverManager = new TestServerManager();
  await serverManager.ensureServer();

  const executablePath = resolveChromiumPath();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();

  console.log('--- 1. Investigating 1024x768 Scroll & CallStackWidget ---');
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto(SERVER_URL, { waitUntil: 'networkidle' });

  const scrollHierarchy = await page.evaluate(() => {
    const root = document.getElementById('root');
    const appContainer = root?.firstElementChild as HTMLElement | null;
    const flexContainer = appContainer?.children[1] as HTMLElement | null;
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const callStack = Array.from(document.querySelectorAll('h3, h4, span, div')).find(el => el.textContent?.includes('Pila de Llamadas'))?.closest('.border') as HTMLElement | null;

    return {
      windowInnerHeight: window.innerHeight,
      documentScrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      appHeight: appContainer?.offsetHeight,
      appClass: appContainer?.className,
      flexHeight: flexContainer?.offsetHeight,
      flexClass: flexContainer?.className,
      mainScrollHeight: main?.scrollHeight,
      mainClientHeight: main?.clientHeight,
      mainOffsetHeight: main?.offsetHeight,
      mainClass: main?.className,
      footerTop: footer?.getBoundingClientRect().top,
      callStackTop: callStack?.getBoundingClientRect().top,
      callStackBottom: callStack ? callStack.getBoundingClientRect().bottom : null,
    };
  });

  console.log('Scroll hierarchy on 1024x768:', JSON.stringify(scrollHierarchy, null, 2));

  console.log('\n--- 2. Investigating Navigation to Curriculum, Cuadernos, Lab Complejidad on 375px ---');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(SERVER_URL, { waitUntil: 'networkidle' });

  const mobileNav = page.locator('nav[aria-label="Navegación móvil"]');
  const tabs = ['Currículum', 'Cuadernos', 'Lab Complejidad', 'Visualizador'];

  for (const tab of tabs) {
    const btn = mobileNav.locator(`button:has-text("${tab}")`);
    await btn.click();
    await page.waitForTimeout(200);

    const metrics = await page.evaluate((tabName) => {
      const doc = document.documentElement;
      const body = document.body;
      const leaking = Array.from(document.querySelectorAll('*'))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          return r.right > window.innerWidth + 1;
        })
        .map((el) => ({
          tag: el.tagName,
          className: el.className?.toString().substring(0, 50),
          right: el.getBoundingClientRect().right,
        }));

      return {
        tab: tabName,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        windowInnerWidth: window.innerWidth,
        bodyScrollWidth: body.scrollWidth,
        hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
        leakingCount: leaking.length,
        leakers: leaking.slice(0, 3),
      };
    }, tab);

    console.log(`Tab [${tab}] on 375px:`, JSON.stringify(metrics, null, 2));
  }

  console.log('\n--- 3. Investigating Navigation on 768px ---');
  await page.setViewportSize({ width: 768, height: 1024 });
  for (const tab of tabs) {
    const btn = mobileNav.locator(`button:has-text("${tab}")`);
    await btn.click();
    await page.waitForTimeout(200);

    const metrics = await page.evaluate((tabName) => {
      const doc = document.documentElement;
      return {
        tab: tabName,
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        windowInnerWidth: window.innerWidth,
        hasHorizontalScroll: doc.scrollWidth > doc.clientWidth,
      };
    }, tab);

    console.log(`Tab [${tab}] on 768px:`, JSON.stringify(metrics, null, 2));
  }

  await browser.close();
  await serverManager.stopServer();
}

investigate();
