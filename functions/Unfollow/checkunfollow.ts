import { Page, Browser } from 'puppeteer'
import { selectors, credentials, url } from '../../constants/selectors.js'
import { saveUsernameUnfollowed } from '../Utils/jsonUtils.js'
import { timer } from '../Utils/utils.js'

const { actionsSelectors } = selectors

async function extractFollowerUsernames(page: Page): Promise<string[]> {
  const usernameSelector = 'div[role="dialog"] div.x1dm5mii.x16mil14.xiojian.x1yutycm.x1lliihq.x193iq5w.xh8yej3 a._a6hd span._ap3a'
  await page.waitForSelector(usernameSelector)
  
  const usernames = await page.$$eval(usernameSelector, elements => elements.map(el => el.textContent))

  return usernames.filter(username => username !== null) as string[]
}

export async function checkUnfollow(browser: Browser, username: string): Promise<boolean> {
  const botUsername = credentials.username
  const page = await browser.newPage()
  try {
    console.log(`Checking user: ${username}`)
    await page.goto(`${url.mainUrl}/${username}`)
    await timer(3000)

    await page.waitForSelector(actionsSelectors.followingButton)

    // Click en el botón de followers
    const button = await page.$(actionsSelectors.followingButton)
    if (button) {
      await button.click()
      await page.waitForSelector('div[role="dialog"]')
    } else {
      throw new Error(`Button for followers not found on ${username}'s profile`)
    }

    // Extraer usernames de los seguidores en la modal
    const followerUsernames = await extractFollowerUsernames(page)
    // Verificar si el bot está en la lista de seguidores
    const isFollowingBot = followerUsernames.includes(botUsername)
    console.log(`Does ${username} follow the bot (${botUsername})?`, isFollowingBot)
    if (isFollowingBot) {
      saveUsernameUnfollowed(username)
      console.log(`El usuario ${username} sigue al bot`)
      await timer(3000)
      await page.close()
      return true // No hacer unfollow
    }

    // Cerrar la modal de seguidores
    const closeButton = await page.$('button[aria-label="Close"]')
    if (closeButton) {
      await closeButton.click()
    }
    await timer(4000) // Espera de 2 segundos después de hacer clic en el botón de unfollow

    // Click en el botón de Unfollow
    const unfollowButton = await page.$(actionsSelectors.UnfollowProfileButton)
if (unfollowButton) {
 
  await page.evaluate(button => (button as unknown as HTMLElement).click(), unfollowButton)
  await timer(2000) // Espera de 2 segundos después de hacer clic en el botón de unfollow
  // Esperar hasta 10 segundos para que aparezca el botón de confirmación
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll("span")).some(button => button.innerText.includes("Unfollow")),
    { timeout: 10000 }
  )

  const confirmUnfollowButton = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll("span")).find(button => button.innerText.includes("Unfollow"))
  )
  
  if (confirmUnfollowButton) {
    // Evaluar clic en el contexto de la página
    await page.evaluate(button => (button as unknown as HTMLElement).click(), confirmUnfollowButton)
    console.log(`El usuario ${username} ha sido dejado de seguir`)
    await timer(3000) // Espera de 2 segundos después de hacer clic en el botón de unfollow
    await page.close()
    return false // Hacer unfollow
  } else {
    console.log(`No se pudo encontrar el botón de confirmación para dejar de seguir a ${username}`)
  }
} else {
  console.log(`No se pudo encontrar el botón de dejar de seguir para ${username}`)
}

    

    await page.close()
    return true // No hacer unfollow en caso de fallo
  } catch (error) {
    console.error(`Error processing user ${username}:`, error)
    await page.close()
    return true // No hacer unfollow en caso de fallo
  }
}
