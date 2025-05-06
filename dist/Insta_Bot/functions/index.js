import { init } from './login.js';
import main from './main.js';
async function run() {
    const { browser, page } = await init();
    await main(browser, page);
}
run();
