import { Page } from 'puppeteer'
import { selectors } from '../../constants/selectors.js'
import { getHumanizedWaitTime, getHumanizedNumber } from './timeUtils.js'
import{ ScrollPage } from '../Utils/scrollUtils.js'
import { handleLikes } from './LikesFeedForInteraction.js';
import { LikesStoryForInteraction } from '../Utils/LikesStoryForInteraction.js'


const ButtonLikes = selectors.actionsSelectors.ButtonLikes;
const NotificationsModal = selectors.actionsSelectors.NotificationsModal;
const reviewedButtons = new Set<string>();


async function timer(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  export async function browseAndInteractOnInstagram(page: Page) {
    const breakTime = getHumanizedNumber(300000, 730000, 0.9, 1.8, 0.1);
    const startTime = Date.now();
    const endTime = startTime + breakTime;

  await page.goto('https://www.instagram.com');
  try {
    await page.waitForFunction(
      (xpath) => {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return result !== null;
      },
      { timeout: 5000 },
      NotificationsModal
    );

    await page.evaluate((xpath) => {
      const notNowButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (notNowButton) {
        (notNowButton as HTMLElement).click();
      }
    }, NotificationsModal);

    console.log('Se hizo clic en el botón "Not Now".');
  } catch (error) {
    console.log('El modal de notificaciones no apareció dentro del tiempo esperado.');
  }
  let nextLikeTime = 0;


    
  if (Math.random() < 1) {
  
    while (Date.now() < endTime) {
      await getHumanizedWaitTime(400, 4300, 0.7, 5);
      await ScrollPage(page);
      await getHumanizedWaitTime(600, 3800, 0.7, 5);

      if (Date.now() > nextLikeTime) {
        const result = await handleLikes(page, Array.from(reviewedButtons), nextLikeTime);
    
        nextLikeTime = result.nextLikeTime;
    
        reviewedButtons.clear();
        result.reviewedButtons.forEach(el => reviewedButtons.add(el));
      }
    }
  }
  else{
    while (Date.now() < endTime) {
      const labelText = 'Story'; // Parte del texto estático que deseas buscar
      const ButtonStorySelector = 'button[aria-label*="Story"]';
      // Espera a que se carguen los botones
      await page.waitForSelector(ButtonStorySelector);

      // Evalúa en el contexto de la página para encontrar y hacer clic en el botón
      const buttonFound = await page.evaluate((selector, text) => {
          const buttons = document.querySelectorAll(selector);
          for (let button of buttons) {
              const ariaLabel = button.getAttribute('aria-label');
              if (ariaLabel && ariaLabel.includes(text)) {
                  (button as HTMLElement).click();
                  console.log('Se hizo clic en el botón:', button);
                  return true;
              }
          }
          
          console.log('No se encontró ningún botón con el texto en aria-label:', text);
          return false;
      }, ButtonStorySelector, labelText);

      if (!buttonFound) {
          throw new Error('No se encontró ningún botón con el texto "Story" en aria-label.');
      }
    await LikesStoryForInteraction (page, endTime);
    }
    
    
  } 
    console.log(`Esperando ${breakTime / 1000} segundos en la página de inicio de Instagram`);
}    