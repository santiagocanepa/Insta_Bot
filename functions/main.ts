import { Browser, Page } from 'puppeteer'
import { selectAction, timer } from './Utils/utils.js'
import { followGenerator } from './Follow/follow.js'
import { unfollowGenerator } from './Unfollow/unfollow.js'

async function main (browser: Browser, page: Page): Promise<void> {
  const { action, subAction, genero_buscado } = await selectAction(browser, page)

  let generator
  if (action === 'follow') {
    if (!subAction || genero_buscado === undefined) {
      console.log('Invalid follow type selected.')
      return
    }
    generator = followGenerator(page, subAction as 'followers' | 'following' | 'photo', genero_buscado)
  } else if (action === 'unfollow') {
    if (!subAction) {
      console.log('Invalid unfollow type selected.')
      return
    }
    generator = unfollowGenerator(browser, page, subAction as 'all' | 'recent')
  }

  if (generator) {
    for await (const value of generator) {
      switch (value.action) {
        case 'wait': {
          await timer(60000, 120000)
          break
        }
        case 'error': {
          await page.close()
          await browser.close()
          throw new Error(value.error as string ?? 'Unknown Error')
        }
        case 'finish': {
          break
        }
      }
    }
  }

  await page.close()
  await browser.close()
}

export default main
