import { url } from '../../constants/selectors.js';
import { getHumanizedWaitTime } from '../Utils/timeUtils.js';
import { ScrollPage } from '../Utils/scrollUtils.js';
export async function clickFollowUser(browser, username) {
    const page = await browser.newPage();
    try {
        console.log(`Checking user: ${username}`);
        await page.goto(`${url.mainUrl}/${username}`);
        await getHumanizedWaitTime(400, 4300, 0.7, 5);
        await ScrollPage(page);
        await getHumanizedWaitTime(600, 3800, 0.7, 5);
        let button = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'))
                .filter(el => el.textContent?.trim() === 'Follow');
            return buttons.length > 0 ? buttons[0] : null;
        });
        if (button && button.asElement()) {
            await button.asElement().click();
            console.log(`Clicked Follow button for ${username}`);
            await getHumanizedWaitTime(82000, 18800, 0.7, 2, 0.15);
            // Verificar si el botón sigue diciendo "Follow"
            button = await page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button'))
                    .filter(el => el.textContent?.trim() === 'Follow');
                return buttons.length > 0 ? buttons[0] : null;
            });
            if (button && button.asElement()) {
                console.log(`Button still says Follow for ${username}`);
                return false;
            }
            else {
                console.log(`Button does not say Follow anymore for ${username}`);
                return true;
            }
        }
        else {
            console.log(`Follow button not found for ${username}`);
            return false;
        }
    }
    catch (error) {
        console.error(`Error clicking Follow button for ${username}:`, error);
        return false;
    }
    finally {
        await page.close();
    }
}
