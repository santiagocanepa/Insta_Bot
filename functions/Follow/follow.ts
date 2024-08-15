import { Browser, Page } from 'puppeteer'
import { GeneratorType } from '../../constants/types.js'
import { selectors, url, credentials } from '../../constants/selectors.js'
import { embedding } from './embedding.js'
import { getusersFollowingAndGenderchek, getUsernamesOnlyFollow, saveusersFollowingAndGenderchek, saveUsernameOnlyFollow, updateDailyCount, checkDailyLimit } from '../Utils/jsonUtils.js'
import { scrollModal } from '../Utils/scrollUtils.js'
import { clickFollowUser } from './clickFollowUser.js'
import { extractUsers, filterNewUsers } from './userUtils.js'
import { getHumanizedWaitTime, timer, getHumanizedNumber } from '../Utils/timeUtils.js'
import { browseAndInteractOnInstagram } from '../Utils/interaction.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { actionsSelectors } = selectors

const outerModalSelector = actionsSelectors.outerModalSelector

//const usernamesNoFollow = new Set(getusersFollowingAndGenderchek())  Lista de Seguidos y chekeados con el modelo
// Obtener el diccionario de usuarios
const usernamesDict = getUsernamesOnlyFollow();

// Crear un nuevo Set con los valores (nombres de usuario) del diccionario
const usernamesNoFollow = new Set<string>();
for (const usernames of Object.values(usernamesDict)) {
  usernames.forEach(username => usernamesNoFollow.add(username));
}

const processedUsernames = new Set<string>();

const dailyFollowsPath = path.resolve(__dirname, '../../dailyfollows.json') // Asegurarse de que la ruta es correcta
const followLimit = 120 // Ejemplo de límite diario asignable

export async function* followGenerator(browser: Browser, page: Page, action: 'followers' | 'following' | 'photo', genero_buscado: number): AsyncGenerator<GeneratorType, void, void> {
  // Seleccionar la URL correcta
  const targetUrl = action === 'photo' ? url.photoUrl : url.followUrl
  await page.goto(targetUrl)
  await getHumanizedWaitTime()

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
    await getHumanizedWaitTime(350, 3200, 0.5, 1.6, 0.15) // Espera 

    const button = await page.$(buttonSelector)
    if (button) {
      await button.click()
      await getHumanizedWaitTime()
    } else {
      throw new Error(`Button for ${action} not found`)
    }
  }

  await page.waitForSelector(outerModalSelector, { visible: true, timeout: 10000 })
  await page.waitForSelector(innerModalSelector, { visible: true, timeout: 10000 })

  let followCount = 0
  let nextBreakCount = getHumanizedNumber(7, 14, 0.8, 1, 0)
  let consecutiveFailures = 0

  do {
    const { followButtons, usernames, descriptions, verifiedStatuses } = await extractUsers(page, innerModalSelector)
    const { newFollowButtons, newUsernames, newDescriptions, newVerifiedStatuses } = filterNewUsers(usernames, followButtons, descriptions, verifiedStatuses, processedUsernames)

    if (newFollowButtons.length === 0) {
      let scrolled = await scrollModal(page, outerModalSelector, innerModalSelector)
      console.log(`Scrolled: ${scrolled}`)
      await getHumanizedWaitTime(350, 3200, 0.5, 1.6, 0.15) // Espera 
      continue
    }

    try {
      for (let i = 0; i < newFollowButtons.length; i++) {
        if (checkDailyLimit(dailyFollowsPath, followLimit)) {
          console.log(`Se ha llegado al límite de follows diarios (${followLimit}). Terminando el bot.`)
          process.exit(1)
        }

        const btn = newFollowButtons[i]
        const username = newUsernames[i]
        const description = newDescriptions[i] ? newDescriptions[i]!.split(' ')[0] : 'No description'
        const verified = newVerifiedStatuses[i]

        console.log(`User: ${username}, Name: ${description}, Verified: ${verified}`)

        // Verificar si la cuenta es verificada
        if (verified) {
          console.log(`${username} es una cuenta verificada, saltando...`)
          continue
        }

        // Verificar si la descripción tiene menos de 3 letras
        if (description.length < 3) {
          console.log(`${username} tiene una descripción muy corta ("${description}"), saltando...`)
          continue
        }

        // Verificar si el usuario ya fue procesado
        if (usernamesNoFollow.has(username)) {
          console.log(`${username} ya procesado, saltando...`)
          continue
        }

        const embeddingResult = genero_buscado !== 2 ? await embedding(description) : 2 // Si genero_buscado es 2, asigna directamente 2 a embeddingResult
        console.log(`Embedding result for ${username}: ${embeddingResult}`)

        usernamesNoFollow.add(username)
        saveusersFollowingAndGenderchek(username)

        if (genero_buscado === 2 || embeddingResult === genero_buscado) {
          const followSuccess = await clickFollowUser(browser, username)

          if (followSuccess) {
            console.log(`Siguiendo a ${username}`)
            followCount++
            consecutiveFailures = 0 // Reset the consecutive failures counter

            updateDailyCount(dailyFollowsPath) // Actualizar el recuento diario de follows
            saveUsernameOnlyFollow(username)

            if (followCount >= nextBreakCount) {
              console.log(`Tomando un descanso después de ${followCount} follows`)
              if (Math.random() < credentials.probInteractions) {
                await browseAndInteractOnInstagram(page)
              } else {
                await page.goto(url.urlRandom) // Redirigir a pagina random
                const breakTime = getHumanizedNumber(230000, 750000, 0.6, 5, 0.25)
                console.log(`Esperando ${breakTime / 1000} segundos en la página de perfil`)
                await timer(breakTime)
              }

              followCount = 0
              nextBreakCount = getHumanizedNumber(7, 14, 0.8, 1, 0) // Nuevo rango para el siguiente descanso

              // Seleccionar la URL correcta después del descanso
              const returnUrl = action === 'photo' ? url.photoUrl : url.followUrl
              await page.goto(returnUrl)
              await getHumanizedWaitTime()

              // Manejar el clic en el botón según la acción
              if (action === 'photo') {
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
                const button = await page.$(buttonSelector!)
                if (button) {
                  await button.click()
                  await getHumanizedWaitTime()
                } else {
                  throw new Error(`Button for ${action} not found`)
                }
              }

              await page.waitForSelector(outerModalSelector, { visible: true, timeout: 5000 })
              await page.waitForSelector(innerModalSelector, { visible: true, timeout: 5000 })
            } else {
              const waitTime = getHumanizedNumber(4000, 14000, 0.6, 5, 0.4)
              console.log(`Esperando ${waitTime / 1000} segundos antes de proceder con el siguiente usuario`)
              await timer(waitTime)
            }
          } else {
            console.log(`Error al seguir a ${username}`)
            consecutiveFailures++
            if (consecutiveFailures >= 2) {
              console.log(`Se encontraron dos fallos consecutivos. Terminando el bot.`)
              process.exit(1)
            }
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
