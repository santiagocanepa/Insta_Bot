import { Page } from 'puppeteer'
import { selectors } from '../../constants/selectors.js'

const { actionsSelectors } = selectors

export async function extractUsers(page: Page, modalSelector: string) {
  const grids = await page.$$(modalSelector + ' div.x1dm5mii.x16mil14.xiojian.x1yutycm.x1lliihq.x193iq5w.xh8yej3')

  const followButtons = []
  const usernames = []
  const descriptions = []

  for (const grid of grids) {
    const followButton = await grid.$(actionsSelectors.followButton)
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
        if (username) usernames.push(username);

        const description = await grid.$eval(actionsSelectors.descriptionSpan, el => el.textContent).catch(() => null);
        if (description) descriptions.push(description);
      }
    }
  }

  return { followButtons, usernames, descriptions };
}

export function filterNewUsers(usernames: string[], followButtons: any[], descriptions: (string | null)[], processedUsernames: Set<string>) {
  const newFollowButtons = []
  const newUsernames = []
  const newDescriptions = []

  for (let i = 0; i < usernames.length; i++) {
    if (!processedUsernames.has(usernames[i])) {
      newFollowButtons.push(followButtons[i])
      newUsernames.push(usernames[i])
      newDescriptions.push(descriptions[i])
      processedUsernames.add(usernames[i])
    }
  }

  return { newFollowButtons, newUsernames, newDescriptions }
}
