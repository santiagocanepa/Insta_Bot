import { Page, Browser } from 'puppeteer'
import { GeneratorType } from '../../constants/types.js'
import { selectors, url } from '../../constants/selectors.js'
import { getusersFollowingChekAndFollowers, saveusersFollowingAndGenderchek, updateDailyCount, checkDailyLimit, getUsernamesOnlyFollow } from '../Utils/jsonUtils.js'
import { scrollModal } from '../Utils/scrollUtils.js'
import { extractUsers, filterNewUsers } from './userUtils.js'
import { getHumanizedWaitTime, getHumanizedNumber, timer } from '../Utils/timeUtils.js'
import { checkUnfollow } from './checkunfollow.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { browseAndInteractOnInstagram } from '../Utils/interaction.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { actionsSelectors } = selectors

const outerModalSelector = actionsSelectors.outerModalSelector
const innerModalSelector = actionsSelectors.innerModalSelectorF

const usernamesUnfollowed = new Set(getusersFollowingChekAndFollowers())
const processedUsernames = new Set<string>()

const dailyUnfollowsPath = path.resolve(__dirname, '../../dailyunfollows.json') 
const unfollowLimit = 100 

function getDateKey(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString('es-ES') // Formato DD/MM/AAAA
}

export async function* unfollowGenerator(browser: Browser, page: Page, subAction: 'all' | 'recent', daysAgo?: number): AsyncGenerator<GeneratorType, void, void> {
  let unfollowCount = 0;
  let nextBreakCount = getHumanizedNumber(7, 13);

  try {
    if (subAction === 'all') {
      const targetUrl = url.unfollowUrl;
      console.log(`Navigating to ${targetUrl}`);
      await page.goto(targetUrl);
      await getHumanizedWaitTime();

      const buttonSelector = actionsSelectors.followingButton;
      console.log(`Waiting for selector: ${buttonSelector}`);
      await page.waitForSelector(buttonSelector, { visible: true, timeout: 8000 });
      const button = await page.$(buttonSelector);

      if (button) {
        await button.click();
        await getHumanizedWaitTime();
      } else {
        throw new Error(`Button for following not found`);
      }

      await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 });
      await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 });

      do {
        console.log('Extracting users...');
        const { followButtons, usernames } = await extractUsers(page, innerModalSelector);
        const { newFollowButtons, newUsernames } = filterNewUsers(usernames, followButtons, [], processedUsernames);

        if (newFollowButtons.length === 0) {
          const scrolled = await scrollModal(page, outerModalSelector, innerModalSelector);
          console.log(`Scrolled: ${scrolled}`);
          await getHumanizedWaitTime();
          continue;
        }

        try {
          for (let i = 0; i < newFollowButtons.length; i++) {
            if (checkDailyLimit(dailyUnfollowsPath, unfollowLimit)) {
              console.log(`Daily unfollow limit (${unfollowLimit}) reached. Terminating bot.`);
              process.exit(1);
            }

            const username = newUsernames[i];

            if (usernamesUnfollowed.has(username)) {
              console.log(`User ${username} already processed, skipping...`);
              continue;
            }

            const shouldUnfollow = await checkUnfollow(browser, username);

            if (shouldUnfollow) {
              const waitTime = getHumanizedNumber(2400, 8500, 0.7, 4);
              console.log(`Waiting ${waitTime / 1000} seconds before proceeding to the next user`);
              await timer(waitTime);
            } else {
              unfollowCount++;
              updateDailyCount(dailyUnfollowsPath);
              await getHumanizedWaitTime(6800, 28000, 0.5, 3, 0.3);

              if (unfollowCount >= nextBreakCount) {
                console.log(`Taking a break after ${unfollowCount} unfollows`);
                if (Math.random() < 0.6) {
                  await browseAndInteractOnInstagram(page);
                } else {
                  await page.goto(url.urlRandom);
                  const breakTime = getHumanizedNumber(230000, 750000, 0.8, 6, 0.4);
                  console.log(`Waiting ${breakTime / 1000} seconds on random page`);
                  await timer(breakTime);
                }

                unfollowCount = 0;
                nextBreakCount = getHumanizedNumber(6, 14, 0.7);

                await page.goto(url.unfollowUrl);
                await getHumanizedWaitTime();
                const buttonSelector = actionsSelectors.followingButton;
                await page.waitForSelector(buttonSelector, { visible: true, timeout: 8000 });
                const button = await page.$(buttonSelector);
                if (button) {
                  await button.click();
                  await getHumanizedWaitTime();
                } else {
                  console.log('Following button selector not found');
                  process.exit(1);
                }
                await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 });
                await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 });
              } else {
                const waitTime = getHumanizedNumber(4000, 14000, 0.7, 4, 0.4);
                console.log(`Waiting ${waitTime / 1000} seconds before proceeding to the next user`);
                await timer(waitTime);
              }
            }
          }
        } catch (err) {
          console.error('Error processing users:', err);
        }
      } while (true);
    } else if (subAction === 'recent') {
      if (daysAgo === undefined) {
        throw new Error("Must provide 'daysAgo' for 'recent' option");
      }
      await page.goto(url.urlRandom);

      const dateKey = getDateKey(daysAgo);
      const usernamesByDate = getUsernamesOnlyFollow();
      const recentUsernames = usernamesByDate[dateKey] || [];

      for (const username of recentUsernames) {
        if (checkDailyLimit(dailyUnfollowsPath, unfollowLimit)) {
          console.log(`Daily unfollow limit (${unfollowLimit}) reached. Terminating bot.`);
          process.exit(1);
        }

        if (usernamesUnfollowed.has(username)) {
          console.log(`User ${username} already processed, skipping...`);
          continue;
        }

        const shouldUnfollow = await checkUnfollow(browser, username);

        if (shouldUnfollow) {
          const waitTime = getHumanizedNumber(2000, 4000, 0.7, 4);
          console.log(`Waiting ${waitTime / 1000} seconds before proceeding to the next user`);
          await timer(waitTime);
        } else {
          unfollowCount++;
          updateDailyCount(dailyUnfollowsPath);
          saveusersFollowingAndGenderchek(username); // Save the username to the appropriate list

          if (unfollowCount >= nextBreakCount) {
            console.log(`Taking a break after ${unfollowCount} unfollows`);
            if (Math.random() < 0.7) {
              await browseAndInteractOnInstagram(page);
            } else {
              await page.goto(url.urlRandom);
              const breakTime = getHumanizedNumber(230000, 750000, 0.8, 6, 0.4);
              console.log(`Waiting ${breakTime / 1000} seconds on profile page`);
              await timer(breakTime);
            }

            unfollowCount = 0;
            nextBreakCount = getHumanizedNumber(6, 14, 0.7);
          } else {
            const waitTime = getHumanizedNumber(4000, 14000, 0.7, 4, 0.4);
            console.log(`Waiting ${waitTime / 1000} seconds before proceeding to the next user`);
            await timer(waitTime);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in unfollowGenerator:', error);
    await page.close();
    await browser.close();
    throw error;
  }
}
