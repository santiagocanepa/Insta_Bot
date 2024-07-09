import { Page, Browser } from 'puppeteer'
import { GeneratorType } from '../../constants/types.js'
import { selectors, url } from '../../constants/selectors.js'
import { getusersFollowingChekAndFollowers, saveusersFollowingAndGenderchek, updateDailyCount, checkDailyLimit, getUsernamesOnlyFollow } from '../Utils/jsonUtils.js'
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

const usernamesUnfollowed = new Set(getusersFollowingChekAndFollowers())
const processedUsernames = new Set<string>()

const dailyUnfollowsPath = path.resolve(__dirname, '../../dailyunfollows.json') 
const unfollowLimit = 100 

function getDateKey(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString('es-ES') // Formato DD/MM/AAAA
}

export async function* unfollowGenerator(browser: Browser, page: Page, subAction: 'all' | 'recent', daysAgo?: number): AsyncGenerator<GeneratorType, void, void> {
  let unfollowCount = 0
  let nextBreakCount = getHumanizedNumber(7, 13)

  if (subAction === 'all') {
    const targetUrl = url.unfollowUrl
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
            console.log(`Se ha llegado al límite de unfollows diarios (${unfollowLimit}). Terminando el bot.`)
            process.exit(1)
          }

          const username = newUsernames[i]

          if (usernamesUnfollowed.has(username)) {
            console.log(`Usuario ${username} ya procesado, saltando...`)
            continue
          }

          const shouldUnfollow = await checkUnfollow(browser, username)

          if (shouldUnfollow) {
            const waitTime = getHumanizedNumber(2000, 4000, 0.7, 4)
            console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
            await timer(waitTime)
          } else {
            unfollowCount++
            updateDailyCount(dailyUnfollowsPath)

            if (unfollowCount >= nextBreakCount) {
              console.log(`Tomando un descanso después de ${unfollowCount} unfollows`)
              if (Math.random() < 0.6) {
                await browseAndInteractOnInstagram(page)
              } else {
                await page.goto(url.urlRandom)
                const breakTime = getHumanizedNumber(230000, 750000, 0.8, 6, 0.4)
                console.log(`Esperando ${breakTime / 1000} segundos pagina random`)
                await timer(breakTime)
              }

              unfollowCount = 0
              nextBreakCount = getHumanizedNumber(6, 14, 0.7)

              await page.goto(url.unfollowUrl)
              await getHumanizedWaitTime()
              const buttonSelector = actionsSelectors.followingButton
              await page.waitForSelector(buttonSelector, { visible: true, timeout: 8000 })
              const button = await page.$(buttonSelector)
              if (button) {
                await button.click()
                await getHumanizedWaitTime()
              } else {
                console.log('Selector Following no encontrado')
                process.exit(1)
              }
              await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 })
              await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 })
            } else {
              const waitTime = getHumanizedNumber(4000, 14000, 0.7, 4, 0.4)
              console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
              await timer(waitTime)
            }
          }
        }
      } catch (err) {
        console.error('Error processing users:', err)
      }
    } while (true)
  } else if (subAction === 'recent') {
    if (daysAgo === undefined) {
      throw new Error("Debe proporcionar 'daysAgo' para la opción 'recent'")
    }
    await page.goto(url.urlRandom)

    const dateKey = getDateKey(daysAgo)
    const usernamesByDate = getUsernamesOnlyFollow()
    const recentUsernames = usernamesByDate[dateKey] || []

    for (const username of recentUsernames) {
      if (checkDailyLimit(dailyUnfollowsPath, unfollowLimit)) {
        console.log(`Se ha llegado al límite de unfollows diarios (${unfollowLimit}). Terminando el bot.`)
        process.exit(1)
      }

      if (usernamesUnfollowed.has(username)) {
        console.log(`Usuario ${username} ya procesado, saltando...`)
        continue
      }

      const shouldUnfollow = await checkUnfollow(browser, username)

      if (shouldUnfollow) {
        const waitTime = getHumanizedNumber(2000, 4000, 0.7, 4)
        console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
        await timer(waitTime)
      } else {
        unfollowCount++
        updateDailyCount(dailyUnfollowsPath)
        saveusersFollowingAndGenderchek(username) // Guardar el username en la lista correspondiente


        if (unfollowCount >= nextBreakCount) {
          console.log(`Tomando un descanso después de ${unfollowCount} unfollows`)
          if (Math.random() < 0.6) {
            await browseAndInteractOnInstagram(page)
          } else {
            await page.goto(url.urlRandom)
            const breakTime = getHumanizedNumber(230000, 750000, 0.8, 6, 0.4)
            console.log(`Esperando ${breakTime / 1000} segundos en la página de perfil`)
            await timer(breakTime)
          }

          unfollowCount = 0
          nextBreakCount = getHumanizedNumber(6, 14, 0.7)
        } else {
          const waitTime = getHumanizedNumber(4000, 14000, 0.7, 4, 0.4)
          console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
          await timer(waitTime)
        }
      }
    }
  }
}