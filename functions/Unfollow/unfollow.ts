import { Page, Browser } from 'puppeteer'
import { GeneratorType } from '../../constants/types.js'
import { selectors, url } from '../../constants/selectors.js'
import { getUsernamesUnfollowed, updateDailyCount, checkDailyLimit } from '../Utils/jsonUtils.js'
import { scrollModal } from '../Utils/scrollUtils.js'
import { extractUsers, filterNewUsers } from './userUtils.js'
import { getHumanizedWaitTime, getHumanizedNumber, timer } from '../Utils/timeUtils.js'
import { checkUnfollow } from './checkunfollow.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { browseAndInteractOnInstagram } from '../Utils/interaction.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { actionsSelectors } = selectors

const outerModalSelector = actionsSelectors.outerModalSelector
const innerModalSelector = actionsSelectors.innerModalSelectorF


const usernamesUnfollowed = new Set(getUsernamesUnfollowed())
const processedUsernames = new Set<string>()

const dailyUnfollowsPath = path.resolve(__dirname, '../../dailyunfollows.json') 
const unfollowLimit = 100 

export async function * unfollowGenerator (browser: Browser, page: Page, subAction: 'all' | 'recent'): AsyncGenerator<GeneratorType, void, void> {
  // Seleccionar la URL correcta basado en el subAction
  const targetUrl = subAction === 'all' ? url.unfollowUrl : url.unfollowUrl
  await page.goto(targetUrl)
  await getHumanizedWaitTime()

  const buttonSelector = actionsSelectors.followingButton
  await page.waitForSelector(buttonSelector, { visible: true, timeout: 8000 })
  const button = await page.$(buttonSelector)

  if (button) {
    await button.click()
    await getHumanizedWaitTime()
  } else {
    throw new Error(`Button for following not found`)
  }

  await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 })
  await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 })

  let unfollowCount = 0
  let nextBreakCount = getHumanizedNumber(7, 13)

  do {
    const { followButtons, usernames } = await extractUsers(page, innerModalSelector)
    const { newFollowButtons, newUsernames } = filterNewUsers(usernames, followButtons, [], processedUsernames)



    if (newFollowButtons.length === 0) {
      const scrolled = await scrollModal(page, outerModalSelector, innerModalSelector)
      console.log(`Scrolled: ${scrolled}`)
      await getHumanizedWaitTime()
      continue
    }

    try {
      for (let i = 0; i < newFollowButtons.length; i++) {
        if (checkDailyLimit(dailyUnfollowsPath, unfollowLimit)) {
          console.log(`Se ha llegado al límite de unfollows diarios (${unfollowLimit}). Terminando el bot.`);
          process.exit(1);
          
        }

        const username = newUsernames[i]

        if (usernamesUnfollowed.has(username)) {
          console.log(`Usuario ${username} ya procesado, saltando...`)
          continue
        }

        const shouldUnfollow = await checkUnfollow(browser, username)

        if (shouldUnfollow) {
          const waitTime = getHumanizedNumber(2000,4000,0.7,4)// Esperar entre 2 y 5 segundos
          console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
          await timer(waitTime)
        } else {
          unfollowCount++
          
          updateDailyCount(dailyUnfollowsPath) // Actualizar el recuento diario de unfollows

          if (unfollowCount >= nextBreakCount) {
            console.log(`Tomando un descanso después de ${unfollowCount} unfollows`)
            if (Math.random() < 0.6) {
              await browseAndInteractOnInstagram(page);}
            else {
              await page.goto(url.urlRandom) // Redirigir a pagina random
              const breakTime = getHumanizedNumber(230000, 750000, 0.8, 6, 0.4) // Esperar 
              console.log(`Esperando ${breakTime / 1000} segundos en la página de perfil`)
              await timer(breakTime) 
            }

            unfollowCount = 0
            nextBreakCount = getHumanizedNumber(6, 14, 0.7) // Nuevo rango para el siguiente descanso
            
            await page.goto(url.unfollowUrl) // Volver a la página de unfollows
            await getHumanizedWaitTime()
            const buttonSelector = actionsSelectors.followingButton
            await page.waitForSelector(buttonSelector, { visible: true, timeout: 8000 })
            const button = await page.$(buttonSelector)
            if (button) {
              await button.click()
              await getHumanizedWaitTime()
            } 
            else {
              await page.goto(url.unfollowUrl) // Volver a la página de unfollows
              await getHumanizedWaitTime()
              const buttonSelector = actionsSelectors.followingButton
              await page.waitForSelector(buttonSelector, { visible: true, timeout: 8000 })
              const button = await page.$(buttonSelector)
              if (button) {
                await button.click()
                await getHumanizedWaitTime()
              } 
            
              else {  
                console.log ('Selector Following no encontrado')
                process.exit(1);
              }
            }
            await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 })
            await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 })
          } else {
            const waitTime = getHumanizedNumber(4000,1400,0.7,4,0.4)
            console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
            await timer(waitTime)
          }
        }
      }
    } catch (err) {
      console.error('Error processing users:', err)
    }
  } while (true)
}
