import { Page } from 'puppeteer';
import { selectors } from '../../constants/selectors.js';

const { actionsSelectors } = selectors;

export async function extractUsers(page: Page, modalSelector: string) {
  const grids = await page.$$(modalSelector + ' div.x1dm5mii.x16mil14.xiojian.x1yutycm.x1lliihq.x193iq5w.xh8yej3');

  const followButtons = [];
  const usernames = [];
  const descriptions = [];
  const verifiedStatuses = [];

  for (const grid of grids) {
    const followButton = await grid.$(actionsSelectors.followButton);
    if (followButton) {
      const buttonText = await page.evaluate((button: Element | null) => {
        if (!(button instanceof HTMLElement)) {
          return ''; // Return empty string if button is not HTMLElement
        }
        return button.textContent?.trim() || '';
      }, followButton);

      if (buttonText.toLowerCase() === 'follow') {
        followButtons.push(followButton);

        const username = await grid.$eval(actionsSelectors.username, el => el.textContent).catch(() => null);
        if (username) {
          usernames.push(username);

          // Ensure that descriptions array stays in sync
          const description = await grid.$eval(actionsSelectors.descriptionSpan, el => el.textContent).catch(() => null);
          descriptions.push(description); // Always push, even if description is null

          // Check if the user is verified
          const isVerified = await grid.$eval('svg[aria-label="Verified"][role="img"]', () => true).catch(() => false);
          verifiedStatuses.push(isVerified);
        }
      }
    }
  }

  return { followButtons, usernames, descriptions, verifiedStatuses };
}

export function filterNewUsers(usernames: string[], followButtons: any[], descriptions: (string | null)[], verifiedStatuses: boolean[], processedUsernames: Set<string>) {
  const newFollowButtons = [];
  const newUsernames = [];
  const newDescriptions = [];
  const newVerifiedStatuses = [];

  for (let i = 0; i < usernames.length; i++) {
    if (!processedUsernames.has(usernames[i])) {
      newFollowButtons.push(followButtons[i]);
      newUsernames.push(usernames[i]);
      newDescriptions.push(descriptions[i]);
      newVerifiedStatuses.push(verifiedStatuses[i]);
      processedUsernames.add(usernames[i]);
    }
  }

  return { newFollowButtons, newUsernames, newDescriptions, newVerifiedStatuses };
}
