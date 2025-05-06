import { Page, Browser } from 'puppeteer';
import { selectors, credentials, url } from '../../constants/selectors.js';
import { saveusersFollowingChekAndFollowers, saveUserRequestPendiente, saveUserUnfollowed } from '../Utils/jsonUtils.js';
import { getHumanizedWaitTime } from '../Utils/timeUtils.js';

const { actionsSelectors } = selectors;

async function extractFollowerUsernames(page: Page): Promise<string[]> {
  const usernameSelector = actionsSelectors.usernameSelector;
  await page.waitForSelector(usernameSelector);
  
  const usernames = await page.$$eval(usernameSelector, elements => elements.map(el => el.textContent));

  return usernames.filter(username => username !== null) as string[];
}

export async function checkUnfollow(browser: Browser, username: string): Promise<boolean> {
  const botUsername = credentials.username;
  const page = await browser.newPage();
  try {
    console.log(`Checking user: ${username}`);
    await page.goto(`${url.mainUrl}/${username}`);
    await getHumanizedWaitTime(900, 4800, 0.7, 2, 0.35);
    
    // Verificar la existencia del botón de unfollow
    const unfollowButtonSelector = actionsSelectors.UnfollowProfileButton;
    try {
      await page.waitForSelector(unfollowButtonSelector, { timeout: 15000 });
      const buttons = await page.$$(unfollowButtonSelector);
      
      let buttonFound = false;
      for (const button of buttons) {
        const text = await page.evaluate(element => element.textContent, button);
        if (text && text.trim() === 'Following') {
          console.log('Botón de unfollow encontrado');
          buttonFound = true;
          break;
        } else if (text && text.trim() === 'Requested') {
          console.log(`Solicitud pendiente para el usuario ${username}`);
          saveUserRequestPendiente(username);
          await page.close();
          return false; // Salir de la función si se encuentra una solicitud pendiente
        }
      }
      
      if (!buttonFound) {
        console.log(`No se pudo encontrar el botón de unfollow en el perfil de ${username}`);
        saveUserUnfollowed(username);
        await page.close();
        return false; // Salir de la función si no se encuentra el botón de unfollow
      }
    } catch (error) {
      console.log(`No se pudo encontrar el botón de unfollow en el perfil de ${username} en 15 segundos`);
      saveUserUnfollowed(username);
      await page.close();
      return false; // Salir de la función si no se encuentra el botón de unfollow
    }


    // Verificar la existencia del botón de followings
    try {
      await page.waitForSelector(actionsSelectors.followingButton, { timeout: 10000 });
    } catch (error) {
      console.log(`No se pudo encontrar el botón de followings en el perfil de ${username} en 10 segundos`);
      await page.close();
      return false; // Salir de la función si no se encuentra el botón de followings
    }

    // Click en el botón de followers
    const button = await page.$(actionsSelectors.followingButton);
    if (button) {
      await button.click();
      await page.waitForSelector('div[role="dialog"]');
    } else {
      throw new Error(`Button for followers not found on ${username}'s profile`);
    }

    // Extraer usernames de los seguidores en la modal
    const followerUsernames = await extractFollowerUsernames(page);
    // Verificar si el bot está en la lista de seguidores
    const isFollowingBot = followerUsernames.includes(botUsername);
    console.log(`Does ${username} follow the bot (${botUsername})?`, isFollowingBot);
    if (isFollowingBot) {
      saveusersFollowingChekAndFollowers(username);
      console.log(`El usuario ${username} sigue al bot`);
      await getHumanizedWaitTime(700, 2800, 0.5, 2, 0.35);
      await page.close();
      return true; // No hacer unfollow
    }

    // Cerrar la modal de seguidores
    const closeButton = await page.$('button[type="button"] svg[aria-label="Close"]');
    if (closeButton) {
      await page.evaluate(el => {
        const button = el.parentElement;
        if (button) {
          button.click();
        }
      }, closeButton);
    }


    await getHumanizedWaitTime(900, 3800, 0.5, 2, 0.35);

    // Click en el botón de Unfollow
    const buttons = await page.$$(unfollowButtonSelector);
    for (const button of buttons) {
      const text = await page.evaluate(element => element.textContent, button);
      if (text && text.trim() === 'Following') {
        console.log('Botón de unfollow encontrado');
        await page.evaluate(button => (button as unknown as HTMLElement).click(), button);
        await getHumanizedWaitTime(900, 3800, 0.5, 2, 0.35);

        // Esperar hasta 10 segundos para que aparezca el botón de confirmación
        await page.waitForFunction(
          () => Array.from(document.querySelectorAll("span")).some(button => button.innerText.includes("Unfollow")),
          { timeout: 10000 }
        );
        
        const confirmUnfollowButton = await page.evaluateHandle(() =>
          Array.from(document.querySelectorAll("span")).find(button => button.innerText.includes("Unfollow"))
        );
        await getHumanizedWaitTime(900, 3800, 0.5, 2, 0.35);

        if (confirmUnfollowButton) {
          // Evaluar clic en el contexto de la página
          await page.evaluate(button => (button as unknown as HTMLElement).click(), confirmUnfollowButton);
          saveUserUnfollowed(username);
          console.log(`El usuario ${username} ha sido dejado de seguir`);
          await getHumanizedWaitTime(2200, 5700, 0.7, 2, 0.1);
          // Espera después de hacer clic en el botón de unfollow
          await page.close();
          return false; // Hacer unfollow
        } else {
          console.log(`No se pudo encontrar el botón de confirmación para dejar de seguir a ${username}`);
        }
      } else {
        console.log(`No se pudo encontrar el botón de dejar de seguir para ${username}`);
      }
    }
    await page.close();
    return true; // No hacer unfollow en caso de fallo
  } catch (error) {
    console.error(`Error processing user ${username}:`, error);
    await page.close();
    return true; // No hacer unfollow en caso de fallo
  }
}
