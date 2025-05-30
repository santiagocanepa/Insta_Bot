import { Page } from 'puppeteer';
import { getHumanizedWaitTime } from './timeUtils.js';
import * as fs from 'fs';
import * as path from 'path';
import { selectors, url } from '../../constants/selectors.js';

const dayLikeStoryListPath = 'dist/functions/List/DayLikeStoryList.json';
const noLikeStoryListPath = 'dist/functions/List/NoLikeStoryList.json';

let DayLikeStoryList: { [date: string]: string[] } = {};
let NoLikeStoryList: string[] = [];

if (fs.existsSync(dayLikeStoryListPath)) {
  DayLikeStoryList = JSON.parse(fs.readFileSync(dayLikeStoryListPath, 'utf8'));
}

if (fs.existsSync(noLikeStoryListPath)) {
  NoLikeStoryList = JSON.parse(fs.readFileSync(noLikeStoryListPath, 'utf8'));
}

// Función para obtener la fecha actual en formato dd/mm/yy
const getCurrentDate = (): string => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0!
  const yy = String(today.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

// Función para guardar la lista en un archivo JSON
const saveListToFile = (list: object, filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
};

// Nueva función para clickear el botón "Like" dentro del modal
const clickModalLikeButton = async (page: Page): Promise<boolean> => {
  return await page.evaluate(() => {
    const heights = ['737px', '864px', '900px']; // Ajusta según las alturas posibles del modal
    let modalContainer: HTMLDivElement | null = null;

    for (const height of heights) {
      modalContainer = document.querySelector(`div[style*="height: ${height};"]`) as HTMLDivElement;
      if (modalContainer) break;
    }

    if (modalContainer) {
      // Buscar el botón de Like dentro del modal
      const likeButton = modalContainer.querySelector('svg[aria-label="Like"]');
      if (likeButton) {
        const buttonAncestor = likeButton.closest('div[role="button"]');
        if (buttonAncestor) {
          (buttonAncestor as HTMLElement).click();
          return true; // Botón clickeado
        }
      }
    }
    return false; // No se encontró el botón Like en el modal
  });
};

const LikesStoryForInteraction = async (page: Page, endTime: number) => {
  const dateKey = getCurrentDate();

  // Asegurarnos de que el key del día existe en la lista
  if (!DayLikeStoryList[dateKey]) {
    DayLikeStoryList[dateKey] = [];
  }

  const extractUsername = async (): Promise<string | null> => {
    const username = await page.evaluate(() => {
      const heights = ['737px', '864px', '900px']; // Añade aquí todas las alturas posibles
      let modalContainer: HTMLDivElement | null = null;

      for (const height of heights) {
        modalContainer = document.querySelector(`div[style*="height: ${height};"]`) as HTMLDivElement;
        if (modalContainer) break;
      }

      if (modalContainer) {
        const usernameSpan = modalContainer.querySelector('span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft') as HTMLSpanElement;
        if (usernameSpan) {
          return usernameSpan.innerText.trim();
        }
      }
      return null;
    });
    return username;
  };

  const clickNextButton = async (): Promise<boolean> => {
    return await page.evaluate(() => {
      try {
        // Buscar el SVG primero
        const nextSvg = document.querySelector('svg[aria-label="Next"]');
        if (!nextSvg) {
          console.log('SVG con aria-label="Next" no encontrado');
          return false;
        }
        
        // Si el SVG se encuentra, buscar el elemento div con role="button" más cercano
        const nextButton = nextSvg.closest('div[role="button"]') as HTMLElement;
        if (!nextButton) {
          console.log('Botón contenedor no encontrado');
          return false;
        }
        
        // Intentar hacer click
        console.log('Botón Next encontrado, intentando hacer click...');
        nextButton.click();
        console.log('Click realizado correctamente');
        return true;
      } catch (error) {
        console.log('Error al intentar hacer click en Next:', error);
        return false;
      }
    });
  };

  const clickCloseButton = async () => {
    await page.evaluate(() => {
      const closeButtons = document.querySelectorAll('svg[role="img"]');
      const validCloseButtons = Array.from(closeButtons).filter(svgElement => {
        const ariaLabel = svgElement.getAttribute('aria-label');
        return ariaLabel && ariaLabel.toLowerCase() === 'close';
      });

      validCloseButtons.forEach(svgElement => {
        const parentButton = svgElement.closest('[role="button"]') as HTMLElement;
        if (parentButton) {
          parentButton.scrollIntoView();
          parentButton.click();
        }
      });
    });
  };

  // Bucle principal
  while (Date.now() < endTime) {
    await getHumanizedWaitTime(600, 2500);

    const username = await extractUsername();
    if (!username) {
      continue;
    }

    // Nuevo if inicial
    if (username.includes("Sponsored")) {
      const nextClicked = await clickNextButton();
      if (!nextClicked) {
        console.log("No hay más publicaciones. Cerrando el modal.");
        await clickCloseButton();
        await getHumanizedWaitTime();
        return;
      }
      await getHumanizedWaitTime();
    } else {
      // La lógica existente solo se ejecutará si el username no incluye "Sponsored"
      if (NoLikeStoryList.includes(username)) {
      } else {
        // Comprobar si el usuario ya ha sido registrado hoy
        if (!DayLikeStoryList[dateKey].includes(username)) {
          // Definir probabilidad de dar like
          if (Math.random() < 0.2) {
            const likeClicked = await clickModalLikeButton(page);
            if (likeClicked) {
              console.log(`Like dado a ${username}.`);
            } else {
              console.log(`No se pudo dar Like a ${username}.`);
            }
          }
          DayLikeStoryList[dateKey].push(username);
          saveListToFile(DayLikeStoryList, dayLikeStoryListPath);
        }
      }

      const nextClicked = await clickNextButton();
      if (!nextClicked) {
        console.log("No hay más publicaciones. Cerrando el modal.");
        await clickCloseButton();
        await getHumanizedWaitTime();
        return;
      }
      await getHumanizedWaitTime();
    }
  }
};

export { LikesStoryForInteraction };
