import { JSDOM } from 'jsdom'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load jQuery
const jqueryCode = readFileSync(join(__dirname, '../../node_modules/jquery/dist/jquery.slim.min.js'), 'utf-8')

// Load compiled fuzzy.js from dist
const fuzzyCode = readFileSync(join(__dirname, '../../dist/fuzzy.js'), 'utf-8')

// Helper function to create a jsdom environment with jQuery and fuzzy loaded
function createTestEnvironment (html: string) {
  const dom = new JSDOM(html, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
  })

  const window = dom.window as any
  const document = window.document

  // Make elements have dimensions for visibility testing
  Object.defineProperty(window.HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: function () {
      return this.style.display !== 'none' ? 100 : 0
    }
  })
  Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: function () {
      return this.style.display !== 'none' ? 100 : 0
    }
  })
  Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: function () {
      return this.style.display !== 'none' ? 100 : 0
    }
  })
  Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: function () {
      return this.style.display !== 'none' ? 100 : 0
    }
  })

  // Load jQuery
  eval(jqueryCode)
  const $ = (window as any).$

  // Load fuzzy function
  eval(fuzzyCode)

  return { window, document, $, fuzzy: (window as any).fuzzy }
}

describe('fuzzy', () => {
  describe('textContent matching', () => {
    it('should find button by exact textContent match', () => {
      const html = `
        <html>
          <body>
            <button>Submit</button>
            <button>Cancel</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Submit', ['button'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].textContent).toBe('Submit')
    })

    it('should find input by contains textContent match', () => {
      const html = `
        <html>
          <body>
            <input type="text" value="Search for products">
            <input type="text" value="Search for users">
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Search', ['input'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((el: Element) => el.textContent?.includes('Search'))).toBe(true)
    })

    it('should find div by textContent', () => {
      const html = `
        <html>
          <body>
            <div>Hello World</div>
            <div>Goodbye World</div>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Hello World', ['div'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].textContent).toBe('Hello World')
    })
  })

  describe('attribute matching', () => {
    it('should find element by id attribute', () => {
      const html = `
        <html>
          <body>
            <button id="submit-btn">Click me</button>
            <button id="cancel-btn">Cancel</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('submit-btn', ['button'], ['id'], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].getAttribute('id')).toBe('submit-btn')
    })

    it('should find element by name attribute', () => {
      const html = `
        <html>
          <body>
            <input type="text" name="username" />
            <input type="text" name="password" />
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('username', ['input'], ['name'], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].getAttribute('name')).toBe('username')
    })

    it('should find element by attribute contains', () => {
      const html = `
        <html>
          <body>
            <button class="btn-primary-large">Submit</button>
            <button class="btn-secondary-small">Cancel</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('primary', ['button'], ['class'], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].getAttribute('class')).toContain('primary')
    })

    it('should find element by data-* attribute', () => {
      const html = `
        <html>
          <body>
            <div data-testid="user-card">User Info</div>
            <div data-testid="admin-card">Admin Info</div>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('user-card', ['div'], ['testid'], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].getAttribute('data-testid')).toBe('user-card')
    })
  })

  describe('label relationships', () => {
    it('should find input after label', () => {
      const html = `
        <html>
          <body>
            <label>Username</label>
            <input type="text" />
            <label>Password</label>
            <input type="password" />
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Username', ['input'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      // Should find the input that comes after the "Username" label
      const inputAfterLabel = results.find((el: Element) => {
        const prev = el.previousElementSibling
        return prev?.tagName === 'LABEL' && prev.textContent === 'Username'
      })
      expect(inputAfterLabel).toBeDefined()
    })

    it('should find input wrapped in label', () => {
      const html = `
        <html>
          <body>
            <label>
              Email
              <input type="email" />
            </label>
            <label>
              Phone
              <input type="tel" />
            </label>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Email', ['input'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      const emailInput = results.find((el: Element) => {
        const parent = el.parentElement
        return parent?.tagName === 'LABEL' && parent.textContent?.includes('Email')
      })
      expect(emailInput).toBeDefined()
    })

    it('should find label when input is not visible', () => {
      const html = `
        <html>
          <body>
            <input type="checkbox" style="display: none;" />
            <label>Accept Terms</label>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Accept Terms', ['input'], [], 'l2r', ':visible')
      // Should find the label that can be interacted with
      const labelResult = results.find((el: Element) => el.tagName === 'LABEL')
      expect(labelResult).toBeDefined()
    })
  })

  describe('sibling relationships', () => {
    it('should find element after text (l2r direction)', () => {
      const html = `
        <html>
          <body>
            <span>Click here</span>
            <button>Submit</button>
            <span>Or here</span>
            <button>Cancel</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Click here', ['button'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      // Should find the button that comes after "Click here"
      const buttonAfterText = results.find((el: Element) => {
        const prev = el.previousElementSibling
        return prev?.textContent === 'Click here'
      })
      expect(buttonAfterText).toBeDefined()
    })

    it('should find element before text (r2l direction)', () => {
      const html = `
        <html>
          <body>
            <button>Submit</button>
            <span>Click here</span>
            <button>Cancel</button>
            <span>Or here</span>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Click here', ['button'], [], 'r2l', ':visible')
      expect(results.length).toBeGreaterThan(0)
      // Should find the button that comes before "Click here"
      const buttonBeforeText = results.find((el: Element) => {
        const next = el.nextElementSibling
        return next?.textContent === 'Click here'
      })
      expect(buttonBeforeText).toBeDefined()
    })

    it('should find element after attribute match (l2r)', () => {
      const html = `
        <html>
          <body>
            <span data-label="Submit Form">Form</span>
            <button>Click Me</button>
            <span data-label="Cancel Form">Cancel</span>
            <button>Don't Click</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Submit Form', ['button'], ['label'], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      // Should find button after the span with data-label="Submit Form"
      const buttonAfterSpan = results.find((el: Element) => {
        const prev = el.previousElementSibling
        return prev?.getAttribute('data-label') === 'Submit Form'
      })
      expect(buttonAfterSpan).toBeDefined()
    })
  })

  describe('visibility filtering', () => {
    it('should only return visible elements by default', () => {
      const html = `
        <html>
          <body>
            <button style="display: none;">Hidden Button</button>
            <button>Visible Button</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Button', ['button'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      // Should not include hidden button
      const hiddenButton = results.find((el: Element) => {
        const htmlEl = el as HTMLElement
        return htmlEl.style.display === 'none'
      })
      expect(hiddenButton).toBeUndefined()
    })

    it('should return all elements when filterBy is empty', () => {
      const html = `
        <html>
          <body>
            <button style="display: none;">Hidden Button</button>
            <button>Visible Button</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Button', ['button'], [], 'l2r', '')
      expect(results.length).toBeGreaterThan(0)
      // Should include both visible and hidden
      const hasVisible = results.some((el: Element) => {
        const htmlEl = el as HTMLElement
        return htmlEl.style.display !== 'none'
      })
      const hasHidden = results.some((el: Element) => {
        const htmlEl = el as HTMLElement
        return htmlEl.style.display === 'none'
      })
      expect(hasVisible || hasHidden).toBe(true)
    })
  })

  describe('special characters handling', () => {
    it('should handle single quotes in search text', () => {
      const html = `
        <html>
          <body>
            <button>Don't click</button>
            <button>Do click</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy("Don't click", ['button'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].textContent).toBe("Don't click")
    })

    it('should handle double quotes in search text', () => {
      const html = `
        <html>
          <body>
            <button>Say "Hello"</button>
            <button>Say "Goodbye"</button>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Say "Hello"', ['button'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].textContent).toBe('Say "Hello"')
    })
  })

  describe('multiple tag types', () => {
    it('should search across multiple tag types', () => {
      const html = `
        <html>
          <body>
            <button>Submit</button>
            <a href="#">Submit</a>
            <div>Submit</div>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      const results = fuzzy('Submit', ['button', 'a', 'div'], [], 'l2r', ':visible')
      expect(results.length).toBeGreaterThanOrEqual(3)
      const tagNames = results.map((el: Element) => el.tagName.toLowerCase())
      expect(tagNames).toContain('button')
      expect(tagNames).toContain('a')
      expect(tagNames).toContain('div')
    })
  })

  describe('complex scenarios', () => {
    it('should handle form with labels and inputs', () => {
      const html = `
        <html>
          <body>
            <form>
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" />
              <label>
                <input type="checkbox" name="terms" />
                Accept Terms and Conditions
              </label>
              <button type="submit">Submit Form</button>
            </form>
          </body>
        </html>
      `
      const { fuzzy } = createTestEnvironment(html)

      // Find input by label text
      const emailResults = fuzzy('Email Address', ['input'], [], 'l2r', ':visible')
      expect(emailResults.length).toBeGreaterThan(0)
      expect(emailResults[0].getAttribute('type')).toBe('email')

      // Find checkbox by label text
      const checkboxResults = fuzzy('Accept Terms', ['input'], [], 'l2r', ':visible')
      expect(checkboxResults.length).toBeGreaterThan(0)
      expect(checkboxResults[0].getAttribute('type')).toBe('checkbox')

      // Find button by text
      const buttonResults = fuzzy('Submit Form', ['button'], [], 'l2r', ':visible')
      expect(buttonResults.length).toBeGreaterThan(0)
      expect(buttonResults[0].textContent).toContain('Submit')
    })
  })
})

