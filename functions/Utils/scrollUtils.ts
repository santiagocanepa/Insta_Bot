import { Page } from 'puppeteer'
import { getHumanizedWaitTime, getHumanizedNumber } from './timeUtils.js'


export async function scrollModal(page: Page, outerModalSelector: string, innerModalSelector: string): Promise<boolean> {
  const scrolled = await page.evaluate(async (outerModalSelector, innerModalSelector) => {
    const outerModal = document.querySelector(outerModalSelector);
    const innerModal = outerModal?.querySelector(innerModalSelector);

    if (innerModal) {
      const randomScroll = () => {
        const rand = Math.random();
        if (rand < 0.35) {
          innerModal.scrollBy(0, innerModal.clientHeight * 1.2);
        } else if (rand < 0.4) {
          innerModal.scrollBy(0, -innerModal.clientHeight * 0.45);
        } else if (rand < 0.6) {
          innerModal.scrollBy(0, innerModal.clientHeight * 1.9);
        } else if (rand < 0.35) {
          innerModal.scrollBy(0, -innerModal.clientHeight * 0.62);
        } else {
          innerModal.scrollBy(0, innerModal.clientHeight * 2.8);
        }
      };

      // Realizar múltiples scrolleos con espera
      for (let i = 0; i < 2; i++) {  // Incrementar a 6 scrolleos
        randomScroll();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 2100)); // Espera entre 500ms y 1000ms
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
