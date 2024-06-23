import { Page } from 'puppeteer'
import { GeneratorType } from '../../constants/types.js'
import { timer } from '../Utils/utils.js'
import { selectors, url } from '../../constants/selectors.js'
import { embedding } from './embedding.js'
import { getUsernamesNoFollow, saveUsernameNoFollow, saveUsernameOnlyFollow, updateDailyCount, checkDailyLimit } from '../Utils/jsonUtils.js'
import { scrollModal } from '../Utils/scrollUtils.js'
import { extractUsers, filterNewUsers } from './userUtils.js'
import { getHumanizedWaitTime, getRandomWaitTime } from '../Utils/timeUtils.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { actionsSelectors } = selectors

const outerModalSelector = actionsSelectors.outerModalSelector

const usernamesNoFollow = new Set(getUsernamesNoFollow())
const processedUsernames = new Set<string>()

const dailyFollowsPath = path.resolve(__dirname, '../../dailyfollows.json') // Asegurarse de que la ruta es correcta
const followLimit = 120 // Ejemplo de límite diario asignable

export async function * followGenerator (page: Page, action: 'followers' | 'following' | 'photo'): AsyncGenerator<GeneratorType, void, void> {
  // Seleccionar la URL correcta
  const targetUrl = action === 'photo' ? url.photoUrl : url.userUrl
  await page.goto(targetUrl)
  await timer()

  // Seleccionar el botón y el modal selector correcto
  let buttonSelector: string | undefined
  let innerModalSelector: string
  if (action === 'followers') {
    buttonSelector = actionsSelectors.followersButton
    innerModalSelector = actionsSelectors.innerModalSelectorF
  } else if (action === 'following') {
    buttonSelector = actionsSelectors.followingButton
    innerModalSelector = actionsSelectors.innerModalSelectorF
  } else if (action === 'photo') {
    innerModalSelector = actionsSelectors.innerModalSelectorPhoto
    // Lógica adicional para encontrar y hacer clic en el botón correcto para "photo"
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('a span')
      for (const button of buttons) {
        if (button.textContent && /personas más|others|likes/.test(button.textContent)) {
          (button as HTMLElement).click()
          break
        }
      }
    })
  } else {
    throw new Error(`Unknown action: ${action}`)
  }

  // Click en el botón de followers, following o likes
  if (buttonSelector) {
    const button = await page.$(buttonSelector)
    if (button) {
      await button.click()
      await timer()
    } else {
      throw new Error(`Button for ${action} not found`)
    }
  }

  await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 })
  await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 })


  let followCount = 0
  let nextBreakCount = getRandomWaitTime(7, 13)

  do {
    const { followButtons, usernames, descriptions } = await extractUsers(page, innerModalSelector)
    const { newFollowButtons, newUsernames, newDescriptions } = filterNewUsers(usernames, followButtons, descriptions, processedUsernames)

    if (newFollowButtons.length === 0) {
      const scrolled = await scrollModal(page, outerModalSelector, innerModalSelector)
      console.log(`Scrolled: ${scrolled}`)
      await timer(3000)
      continue
    }

    try {
      for (let i = 0; i < newFollowButtons.length; i++) {
        if (checkDailyLimit(dailyFollowsPath, followLimit)) {
          console.log(`Se ha llegado al límite de follows diarios (${followLimit}). Terminando el bot.`)
          return
        }

        const btn = newFollowButtons[i]
        const username = newUsernames[i]
        const description = newDescriptions[i] ? newDescriptions[i]!.split(' ')[0] : 'No description'

        console.log(`User: ${username}, Name: ${description}`)

        if (usernamesNoFollow.has(username)) {
          console.log(`${username} ya procesado, saltando..`)
          continue
        }

        const embeddingResult = await embedding(description)
        console.log(`Embedding result for ${username}: ${embeddingResult}`)

        usernamesNoFollow.add(username)
        saveUsernameNoFollow(username)

        if (embeddingResult === 1) {
          await btn.click()
          console.log(`Siguiendo a ${username}`)
          followCount++
          
          updateDailyCount(dailyFollowsPath) // Actualizar el recuento diario de follows

          saveUsernameOnlyFollow(username)

          if (followCount >= nextBreakCount) {
            console.log(`Tomando un descanso después de ${followCount} follows`)
            await page.goto(url.userUrl) // Redirigir a la página de perfil
            const breakTime = getHumanizedWaitTime(180000, 500000) // Esperar entre 180 y 500 segundos
            console.log(`Esperando ${breakTime / 1000} segundos en la página de perfil`)
            await timer(breakTime)

            followCount = 0
            nextBreakCount = getRandomWaitTime(7, 13) // Nuevo rango para el siguiente descanso

            // Seleccionar la URL correcta después del descanso
            const returnUrl = action === 'photo' ? url.photoUrl : url.userUrl
            await page.goto(returnUrl)
            await timer()

            // Si no es acción 'photo', manejar el clic en el botón
            if (action !== 'photo') {
              const button = await page.$(buttonSelector!)
              if (button) {
                await button.click()
                await timer()
              } else {
                throw new Error(`Button for ${action} not found`)
              }
            }

            await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 })
            await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 })
          } else {
            const waitTime = getHumanizedWaitTime(5000, 35000) // Esperar entre 5 y 35 segundos
            console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
            await timer(waitTime)
          }
        } else {
          console.log(`No se sigue a ${username} basado en embedding`)
        }
      }
    } catch (err) {
      console.error('Error processing users:', err)
    }
  } while (true)
}
