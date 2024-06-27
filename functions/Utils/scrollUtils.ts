import { Page } from 'puppeteer'

export async function scrollModal(page: Page, outerModalSelector: string, innerModalSelector: string): Promise<boolean> {
  const scrolled = await page.evaluate((outerModalSelector, innerModalSelector) => {
    const outerModal = document.querySelector(outerModalSelector);
    const innerModal = outerModal?.querySelector(innerModalSelector);

    if (innerModal) {
      const randomScroll = Math.random();
      if (randomScroll < 0.2) {
        // 20% de probabilidad de scroll lento
        innerModal.scrollBy(0, innerModal.clientHeight * 0.8);
      } else if (randomScroll < 0.5) {
        // 50% de probabilidad de scroll medio
        innerModal.scrollBy(0, innerModal.clientHeight * 1.4);
      } else {
        // 30% de probabilidad de scroll rápido
        innerModal.scrollBy(0, innerModal.clientHeight * 3);
      }
      return true;
    }
    return false;
  }, outerModalSelector, innerModalSelector);
  return scrolled;
}


// scrollUtils.ts

export async function ScrollPage(page: Page) {
  if (Math.random() < 0.85) {
    if (Math.random() < 0.5) {
      await page.evaluate(() => {
        window.scrollBy(0, -window.innerHeight / 2);
      });
    } else {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 0.8);
      });
    }
  } else {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 2.3);
    });
  }
}
