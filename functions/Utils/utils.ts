import { Browser, Page } from 'puppeteer'
import readline from 'readline'

export const timer = (min: number = 3000, max: number = 9000): Promise<void> => {
  const waitingTime = Math.floor(Math.random() * (max - min) + min)
  return new Promise((resolve) => setTimeout(resolve, waitingTime))
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

export async function selectAction (browser: Browser, page: Page): Promise<{ action: string, subAction?: string }> {
  const action = await askQuestion('Select an action: \n 1. Follow \n 2. Unfollow \n 3. Exit \n')
  let subAction
  switch (action) {
    case '1': {
      subAction = await askQuestion('Select follow type: \n 1. Followers \n 2. Following \n 3. Photo \n')
      switch (subAction) {
        case '1':
          subAction = 'followers'
          break
        case '2':
          subAction = 'following'
          break
        case '3':
          subAction = 'photo'
          break
        default:
          subAction = undefined
      }
      return { action: 'follow', subAction }
    }
    case '2': {
      subAction = await askQuestion('Select unfollow type: \n 1. All followed \n 2. Recent followers \n')
      switch (subAction) {
        case '1':
          subAction = 'all'
          break
        case '2':
          subAction = 'recent'
          break
        default:
          subAction = undefined
      }
      return { action: 'unfollow', subAction }
    }
    case '3': {
      await browser.close()
      await page.close()
      rl.close()
      process.exit(0)
      break
    }
    default: {
      rl.close()
      throw new Error('Invalid action')
    }
  }
}