import { Browser, Page } from 'puppeteer'
import readline from 'readline'

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

export async function selectAction (browser: Browser, page: Page): Promise<{ action: string, subAction?: string, genero_buscado?: number,   daysAgo?: number;}> {
  const action = await askQuestion('Select an action: \n 1. Follow \n 2. Unfollow \n 3. Exit \n')

  let subAction, genero_buscado
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
      
      genero_buscado = parseInt(await askQuestion('Select gender: \n 0. Men \n 1. Women \n 2. All \n 3. Businesses \n'), 10)
      
      return { action: 'follow', subAction, genero_buscado }
    }
    case '2': {
      subAction = await askQuestion('Select unfollow type: \n 1. All followed \n 2. Recent followers \n');
      switch (subAction) {
        case '1':
          subAction = 'all';
          return { action: 'unfollow', subAction };
        case '2':
          subAction = 'recent';
          const daysAgoString = await askQuestion('How many days back should we check the recent followers? (0 for today, 1 for yesterday, etc.): ');
          const daysAgo = parseInt(daysAgoString, 10);
          if (isNaN(daysAgo) || daysAgo < 0) {
            console.log('Invalid number of days. Please enter a valid number.');
            return { action: 'unfollow', subAction: undefined };
          }
          return { action: 'unfollow', subAction, daysAgo };
        default:
          subAction = undefined;
      }
      return { action: 'unfollow', subAction };
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
