import { readFileSync } from 'fs'
import { join } from 'path'

// just loads the fuzzy module into the window.fuzzy placeholder
require('../src/fuzzy')

// Load jQuery from node_modules
const JQUERY_JS = readFileSync(join(__dirname, '..', 'dist', 'external', 'js', 'jquery.slim.min.js'), 'utf-8')

describe('fuzzy', () => {
  beforeEach(() => {
    global.console = require('console')

    if (process.env.DEBUG == null) { 
      console.debug = () => {}
    }
    window.eval(JQUERY_JS)
  });

  function fuzzy (
    name: string,
    tags: string[],
    attributes: string[] = [],
    options: {
      direction?: string
      filterBy?: string
      root?: Element
    } = {}
  ) {
    // in jsdom the visibility method doesn't work right
    options.filterBy = ''
    return (window as any).fuzzy(name, tags, attributes, options)
  }

  describe('basic element matching', () => {
    it('should fail to find element', () => {
      document.body.innerHTML = `<button>click me</button>`
      expect(fuzzy('click you', ['button'], []).length).toBe(0)
    })

    it('should find element with text content that is equal', () => {
      document.body.innerHTML = `
        <button>click me</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [ button ] = fuzzy('click me', ['button'], [])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('click me')
    })

    it('should find element with text content that contains', () => {
      document.body.innerHTML = `
        <button>click me, please</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [ button ] = fuzzy('please', ['button'], [])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('click me, please')
    })

    it('should find element with attribute value that is equal', () => {
      document.body.innerHTML = `
        <button value="click me">some button</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [ button ] = fuzzy('click me', ['button'], ['value'])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('some button')
    })

    it('should find element with attribute value that contains', () => {
      document.body.innerHTML = `
        <button value="click me, please">some button</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [ button ] = fuzzy('please', ['button'], ['value'])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('some button')
    })

    it('should find element with with label element using for attribute', () => {
      document.body.innerHTML = `
        <div>
          <label for="dacheckbox">da checkbox</label>
        </div>
        <div>
          <div>
            <input id="dacheckbox" type="checkbox"></input>
          </div>
        </div>
      `

      const [ checkbox ] = fuzzy('da checkbox', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('dacheckbox')
    })

    it('should find element with with sibling element with text content that is equal', () => {
      document.body.innerHTML = `
        <label>da checkbox</label><input type="checkbox" id="you found me"></input>
      `

      const [ checkbox ] = fuzzy('da checkbox', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with with sibling element with text content that contains', () => {
      document.body.innerHTML = `
        <label>da checkbox</label><input type="checkbox" id="you found me"></input>
      `

      const [ checkbox ] = fuzzy('da check', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with with descendant element with text content that is equal', () => {
      document.body.innerHTML = `
        <label>da checkbox<div><input type="checkbox" id="you found me"></input></div></label>
      `

      const [ checkbox ] = fuzzy('da checkbox', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with with descendant element with text content that contains', () => {
      document.body.innerHTML = `
        <label>da checkbox that booms
          <div>
            <input type="checkbox" id="you found me"></input>
          </div>
        </label>
      `

      const [ checkbox ] = fuzzy('da check', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

  })
})
