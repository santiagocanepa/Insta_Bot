import { selectors } from '../../constants/selectors.js';
const { actionsSelectors } = selectors;
export async function extractUsers(page, modalSelector) {
    const grids = await page.$$(modalSelector + ' div.x1dm5mii.x16mil14.xiojian.x1yutycm.x1lliihq.x193iq5w.xh8yej3');
    const followButtonsPromises = grids.map(async (grid) => {
        const followButton = await grid.$(actionsSelectors.followButton);
        if (followButton) {
            const buttonText = await page.evaluate((button) => {
                if (!(button instanceof HTMLElement)) {
                    return ''; // Return empty string if button is not HTMLElement
                }
                return button.textContent?.trim() || '';
            }, followButton);
            if (buttonText.toLowerCase() === 'follow') {
                const usernamePromise = grid.$eval(actionsSelectors.username, el => el.textContent).catch(() => null);
                const descriptionPromise = grid.$eval(actionsSelectors.descriptionSpan, el => el.textContent).catch(() => null);
                const isVerifiedPromise = grid.$eval('svg[aria-label="Verified"][role="img"]', () => true).catch(() => false);
                return Promise.all([followButton, usernamePromise, descriptionPromise, isVerifiedPromise]);
            }
        }
        return null;
    });
    const followButtonsData = (await Promise.all(followButtonsPromises)).filter(data => data !== null);
    const followButtons = followButtonsData.map(data => data[0]);
    const usernames = followButtonsData.map(data => data[1]).filter((username) => username !== null);
    const descriptions = followButtonsData.map(data => data[2]);
    const verifiedStatuses = followButtonsData.map(data => data[3]);
    return { followButtons, usernames, descriptions, verifiedStatuses };
}
export function filterNewUsers(usernames, followButtons, descriptions, verifiedStatuses, processedUsernames) {
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
