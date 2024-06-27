// likeHandler.mjs
import { selectors } from '../../constants/selectors.js'
import { getHumanizedWaitTime, getHumanizedNumber } from './timeUtils.js'
import { Page } from 'puppeteer'

export async function handleLikes(page: Page, reviewedButtonsArray: string[], nextLikeTime:number) {
  console.log('Intentando dar like...');
    const ButtonLikes = selectors.actionsSelectors.ButtonLikes;
    const result = await page.evaluate((ButtonLikes, reviewedButtonsArray) => {
    const reviewedButtons = new Set(reviewedButtonsArray);
    const likeButtons = document.querySelectorAll(ButtonLikes);

    // Filtrar solo los botones de like válidos
    const validLikeButtons = Array.from(likeButtons).filter(svgElement => {
      const ariaLabel = svgElement.getAttribute('aria-label');
      return ariaLabel && (ariaLabel.toLowerCase().includes('me gusta') || ariaLabel.toLowerCase().includes('like'));
    });

    console.log('Botones de like válidos encontrados:', validLikeButtons.length);
    let clicked = false;

    for (let i = 0; i < validLikeButtons.length; i++) {
      const svgElement = validLikeButtons[i];
      const svgElementId = `${svgElement.getAttribute('aria-label')}-${i}`; // Usamos aria-label + índice para identificación única

      if (reviewedButtons.has(svgElementId)) {
        console.log('Elemento SVG ya revisado:', svgElementId);
        continue;
      }

      console.log('Elemento SVG de like encontrado:', svgElementId);
      const parentButton = svgElement.closest('div[role="button"], button') as HTMLElement;
      if (parentButton) {
        if (Math.random() < 0.75) {
          console.log('Botón padre encontrado:', parentButton);
          parentButton.scrollIntoView();
          parentButton.click();
          console.log('Click en el botón de like realizado.');
          clicked = true;
          reviewedButtons.add(svgElementId); // Añadir el elemento revisado al conjunto
          break; // Romper el bucle si se ha hecho clic
        } else {
          console.log('Probabilidad no cumplida, no se hace clic.');
          reviewedButtons.add(svgElementId); // Añadir el elemento revisado al conjunto
        }
      } else {
        console.log('No se encontró el botón padre.');
        reviewedButtons.add(svgElementId); // Añadir el elemento revisado al conjunto
      }
    }
    console.log('Botones revisados:', Array.from(reviewedButtons));
    return { clicked, reviewedButtons: Array.from(reviewedButtons) };
  }, ButtonLikes, Array.from(reviewedButtonsArray)); // Usamos el selector definido en selectors y pasamos el conjunto de elementos revisados

  if (result && result.clicked) {
    nextLikeTime = Date.now() + getHumanizedNumber(5000, 30000, 0.6, 3);
  }

  console.log('Reviewed buttons después de la evaluación:', result.reviewedButtons);

  return {
    nextLikeTime,
    reviewedButtons: new Set(result.reviewedButtons)
  };
}
