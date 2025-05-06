import { selectAction } from './Utils/utils.js';
import { getHumanizedWaitTime } from './Utils/timeUtils.js';
import { followGenerator } from './Follow/follow.js';
import { unfollowGenerator } from './Unfollow/unfollow.js';
async function main(browser, page) {
    const { action, subAction, genero_buscado, daysAgo } = await selectAction(browser, page);
    let generator;
    if (action === 'follow') {
        if (!subAction || genero_buscado === undefined) {
            console.log('Invalid follow type selected.');
            return;
        }
        generator = followGenerator(browser, page, subAction, genero_buscado);
    }
    else if (action === 'unfollow') {
        if (!subAction) {
            console.log('Invalid unfollow type selected.');
            return;
        }
        if (subAction === 'recent') {
            generator = unfollowGenerator(browser, page, subAction, daysAgo);
        }
        else {
            generator = unfollowGenerator(browser, page, subAction);
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
                    throw new Error(value.error ?? 'Unknown Error');
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
    process.exit(1);
}
export default main;
