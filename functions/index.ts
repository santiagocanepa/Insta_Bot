import { init } from './login.js'
import main from './main.js'

async function run (): Promise<void> {
  const { browser, page } = await init()
  await main(browser, page)
}

run()

