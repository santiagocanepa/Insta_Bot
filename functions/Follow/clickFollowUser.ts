import puppeteer, { Browser } from 'puppeteer';
import { selectors, url } from '../../constants/selectors.js';
import { getHumanizedWaitTime } from '../Utils/timeUtils.js';
import { ScrollPage } from '../Utils/scrollUtils.js'


export async function clickFollowUser(browser: Browser, username: string): Promise<void> {
  const page = await browser.newPage();
  try {
    console.log(`Checking user: ${username}`);
    await page.goto(`${url.mainUrl}/${username}`);

    await getHumanizedWaitTime(400, 4300, 0.7, 5);
    await ScrollPage(page);
    await getHumanizedWaitTime(600, 3800, 0.7, 5);

    const button = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
        .filter(el => el.textContent?.trim() === 'Follow');
      return buttons.length > 0 ? buttons[0] : null;
    });

    if (button && button.asElement()) {
      await (button.asElement() as puppeteer.ElementHandle).click();
      console.log(`Clicked Follow button for ${username}`);
      await getHumanizedWaitTime(900,3800,0.7,2,0.35)

    } else {
      console.log(`Follow button not found for ${username}`);
    }
  } catch (error) {
    console.error(`Error clicking Follow button for ${username}:`, error);
  } finally {
    await page.close();
  }
}
