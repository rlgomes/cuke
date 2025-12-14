import { CukeWorld } from '../src/step-definitions/world'

const platformNames = ['playwright', 'selenium']

describe('CukeWorld Unit Tests', () => {
  for (const platformName of platformNames) {
    describe(`In ${platformName} mode`, () => {
      let world: CukeWorld

      beforeAll(() => {
        process.env.CUKE_BROWSER_PLATFORM = platformName
        process.env.CUKE_HEADLESS = 'true'
        world = new CukeWorld()
      })
      
      afterAll(async () => {
        await world.quit()
      })

      it('should open a browser on a page', async () => {
        await world.openBrowser(`file://${process.cwd()}/data/buttons.html`)
        await world.quit()
      })

      it('should be able to find an element using fuzzyFind', async () => {
        await world.openBrowser(`file://${process.cwd()}/data/buttons.html`)
        const button = await world.fuzzyFind('button that becomes enabled', ['button'], [])
        expect(button).not.toBeNull()
        const id = await button.getAttribute('id')
        expect(id).toBe('disabled-button')
      })

      it('should be able to find an element using findElement', async () => {
        await world.openBrowser(`file://${process.cwd()}/data/buttons.html`)
        const buttons = await world.findElements('#disabled-button')
        const button = buttons[0]
        expect(button).not.toBeNull()
        const id = await button.getAttribute('id')
        expect(id).toBe('disabled-button')
      })

      it('should be able to get the outerHTML attribute for an element', async () => {
        await world.openBrowser(`file://${process.cwd()}/data/buttons.html`)
        const buttons = await world.findElements('#disabled-button')
        const button = buttons[0]
        expect(button).not.toBeNull()
        const outerHTML = await button.getAttribute('outerHTML')
        expect(outerHTML).toBe(`<button onclick="touched('button that becomes enabled')" id="disabled-button" disabled="">button that becomes enabled</button>`)
      })
    })
  }
})
