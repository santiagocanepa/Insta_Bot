import { Page } from 'puppeteer'

export async function scrollModal(page: Page, outerModalSelector: string, innerModalSelector: string): Promise<boolean> {
  const scrolled = await page.evaluate((outerModalSelector, innerModalSelector) => {
    const outerModal = document.querySelector(outerModalSelector)
    const innerModal = outerModal?.querySelector(innerModalSelector)
    if (innerModal) {
      innerModal.scrollBy(0, innerModal.clientHeight)
      return true
    }
    return false
  }, outerModalSelector, innerModalSelector)
  return scrolled
}

