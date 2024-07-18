import { Browser, Page } from 'puppeteer';
import { selectAction } from './Utils/utils.js';
import { getHumanizedWaitTime } from './Utils/timeUtils.js';
import { followGenerator } from './Follow/follow.js';
import { unfollowGenerator } from './Unfollow/unfollow.js';
import { browseAndInteractOnInstagram } from './Utils/interaction.js';

async function main(browser: Browser, page: Page): Promise<void> {
  const { action, subAction, genero_buscado, daysAgo } = await selectAction(browser, page);
  let generator;

  if (action === 'follow') {
    if (!subAction || genero_buscado === undefined) {
      console.log('Invalid follow type selected.');
      return;
    }
    generator = followGenerator(browser, page, subAction as 'followers' | 'following' | 'photo', genero_buscado);
  } else if (action === 'unfollow') {
    if (!subAction) {
      console.log('Invalid unfollow type selected.');
      return;
    }

    if (subAction === 'recent') {
      generator = unfollowGenerator(browser, page, subAction as 'recent', daysAgo);
    } else {
      generator = unfollowGenerator(browser, page, subAction as 'all');
    }
  }

  if (generator) {
    for await (const value of generator) {
      switch (value.action) {
        case 'wait': {
          await getHumanizedWaitTime(60000, 120000);
          break;
        }
        case 'error': {
          await page.close();
          await browser.close();
          throw new Error(value.error as string ?? 'Unknown Error');
        }
        case 'finish': {
          break;
        }
      }
    }
  }

  // Estas líneas no deberían cerrarse automáticamente si no se ha completado la acción
  await page.close();
  await browser.close();
}

export default main;
