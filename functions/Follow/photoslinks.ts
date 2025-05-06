import { Page } from 'puppeteer';
import { selectors, url } from '../../constants/selectors.js';

export async function extractPhotoLinks(page: Page): Promise<string[]> {
  await page.goto(url.followUrl);  // Navega al perfil del usuario
  await page.waitForSelector('a'); // Espera que haya enlaces en la página

  const photoLinks = await page.evaluate(() => {
    const baseUrl = 'https://www.instagram.com/p/';
    return Array.from(document.querySelectorAll('a'))
      .map(a => (a as HTMLAnchorElement).href)
      .filter(href => href.startsWith(baseUrl));
  });

  console.log(`Enlaces de fotos encontrados: ${photoLinks.length}`);
  return photoLinks;
}
