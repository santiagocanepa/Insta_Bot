import puppeteer, { Browser, Page } from 'puppeteer'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'

import { selectors, credentials, paths, url } from '../constants/selectors.js'
import { puppeteerOptions } from '../constants/options.js'
import { timer } from './Utils/utils.js'

const { loginSelectors } = selectors

async function loadCookies (page: Page): Promise<void> {
  if (existsSync(paths.cookiesPath)) {
    const cookies = JSON.parse(await readFile(paths.cookiesPath, 'utf-8'))
    await page.setCookie(...cookies)
  }
  await page.goto(url.mainUrl)
  await timer()
}

async function saveCookies (page: Page): Promise<void> {
  const cookies = await page.cookies()
  await writeFile(paths.cookiesPath, JSON.stringify(cookies), 'utf-8')
}

async function login (page: Page): Promise<void> {
  await page.waitForSelector(loginSelectors.usernameInput, { timeout: 5000, visible: true }).then(async () => {
    await page.type(loginSelectors.usernameInput, credentials.username)
    await page.type(loginSelectors.passwordInput, credentials.password)
    await page.keyboard.press('Enter')
    await timer()
  })
  const isSuccessfully = await page.waitForSelector(loginSelectors.isLoginSelector, { timeout: 5000, visible: true })
  if (!isSuccessfully) throw new Error('Login failed')
  await saveCookies(page)
}

async function isLogin (page: Page): Promise<void> {
  try {
    await page.waitForSelector(loginSelectors.isLoginSelector, { timeout: 5000, visible: true })
  } catch (err) {
    await login(page)
  }
}

export async function init (): Promise<{ browser: Browser, page: Page }> {
  const browser = await puppeteer.launch(puppeteerOptions)
  const page = await browser.newPage()
  await loadCookies(page)
  await isLogin(page)

  return { browser, page }
}
