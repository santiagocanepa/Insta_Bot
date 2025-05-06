import puppeteer from 'puppeteer';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { selectors, credentials, paths, url } from '../constants/selectors.js';
import { puppeteerOptions } from '../constants/options.js';
import { getHumanizedWaitTime } from './Utils/timeUtils.js';
const { loginSelectors } = selectors;
async function loadCookies(page) {
    if (existsSync(paths.cookiesPath)) {
        const cookies = JSON.parse(await readFile(paths.cookiesPath, 'utf-8'));
        await page.setCookie(...cookies);
    }
    await page.goto(url.mainUrl);
    await getHumanizedWaitTime(10000, 25000);
}
async function saveCookies(page) {
    const cookies = await page.cookies();
    await writeFile(paths.cookiesPath, JSON.stringify(cookies), 'utf-8');
}
async function login(page) {
    await page.waitForSelector(loginSelectors.usernameInput, { timeout: 15000, visible: true }).then(async () => {
        await page.type(loginSelectors.usernameInput, credentials.username);
        await page.type(loginSelectors.passwordInput, credentials.password);
        await page.keyboard.press('Enter');
        await getHumanizedWaitTime();
    });
    const isSuccessfully = await page.waitForSelector(loginSelectors.isLoginSelector, { timeout: 15000, visible: true });
    if (!isSuccessfully)
        throw new Error('Login failed');
    await saveCookies(page);
}
async function isLogin(page) {
    try {
        await page.waitForSelector(loginSelectors.isLoginSelector, { timeout: 15000, visible: true });
    }
    catch (err) {
        await login(page);
    }
}
export async function init() {
    const browser = await puppeteer.launch(puppeteerOptions);
    const page = await browser.newPage();
    await loadCookies(page);
    await isLogin(page);
    return { browser, page };
}
