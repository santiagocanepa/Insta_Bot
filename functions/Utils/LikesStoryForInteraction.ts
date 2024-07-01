import { Page } from 'puppeteer';
import { getHumanizedWaitTime } from './timeUtils.js';
import * as fs from 'fs';
import { selectors, url, } from '../../constants/selectors.js';
import * as path from 'path';


const dayLikeStoryListPath = './functions/List/NoLikeStoryList.json';
const noLikeStoryListPath = './functions/List/NoLikeStoryList.json';

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


const LikesStoryForInteraction = async (page: Page, endTime: number) => {
  const dateKey = getCurrentDate();

  // Asegurarnos de que el key del día existe en la lista
  if (!DayLikeStoryList[dateKey]) {
    DayLikeStoryList[dateKey] = [];
  }

  const extractUsername = async (): Promise<string | null> => {
    const username = await page.evaluate(() => {
      const modalContainer = document.querySelector('div[style*="height: 737px;"]') as HTMLAreaElement;
      if (modalContainer) {
        const usernameSpan = modalContainer.querySelector('span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft') as HTMLAreaElement;
        if (usernameSpan) {
          return usernameSpan.innerText.trim();
        }
      }
      return null;
    });
    return username;
  };

  const clickLikeButton = async () => {
    await page.evaluate(() => {
      const likeSVGs = document.querySelectorAll('svg[aria-label="Like"]');
      likeSVGs.forEach(svg => {
        const buttonAncestor = svg.closest('[role="button"]');
        if (buttonAncestor) {
          (buttonAncestor as HTMLElement).click();
        }
      });
    });
  };

  const clickNextButton = async (): Promise<boolean> => {
    return await page.evaluate(() => {
      const nextSvg = document.querySelector('svg[aria-label="Next"]');
      if (nextSvg) {
        const buttonAncestor = nextSvg.closest('[role="button"]') as HTMLElement;
        if (buttonAncestor) {
          buttonAncestor.click();
          return true;
        }
      }
      return false;
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
    await getHumanizedWaitTime(2000,4500);

    const username = await extractUsername();
    if (!username) {
      console.log("No se pudo extraer el nombre de usuario.");
      continue;
    }

    if (NoLikeStoryList.includes(username)) {
      console.log(`Usuario ${username} ya está en NoLikeStoryList.`);
    } else {
      // Comprobar si el usuario ya ha sido registrado hoy
      if (!DayLikeStoryList[dateKey].includes(username)) {
        // Definir probabilidad de dar like
        if (Math.random() < 0.6) {
          await clickLikeButton();
        }
        DayLikeStoryList[dateKey].push(username);
        saveListToFile(DayLikeStoryList, './DayLikeStoryList.json');
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
};

export { LikesStoryForInteraction };
