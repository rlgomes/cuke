/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'fs'
import { join } from 'path'

// just loads the fuzzy module into the window.fuzzy placeholder
require('../src/fuzzy')

// Load jQuery from node_modules
const JQUERY_JS = readFileSync(
  join(__dirname, '..', 'node_modules', 'jquery', 'dist', 'jquery.slim.min.js'),
  'utf-8')

describe('fuzzy', () => {
  beforeEach(() => {
    global.console = require('console')

    if (process.env.DEBUG == null) {
      console.debug = () => {}
    }
    // eslint-disable-next-line
    window.eval(JQUERY_JS)
  })

  function fuzzy (
    name: string,
    tags: string[],
    attributes: string[] = [],
    options: {
      direction?: string
      filterBy?: string
      root?: Element
      index?: number
    } = {}
  ): HTMLElement[] {
    // in jsdom the visibility method doesn't work right
    options.filterBy = ''
    options.index = 0 // early exit for each match
    return (window as any).fuzzy(name, tags, attributes, options)
  }

  describe('basic element matching', () => {
    it('should fail to find element', () => {
      document.body.innerHTML = '<button>click me</button>'
      expect(fuzzy('click you', ['button'], []).length).toBe(0)
    })

    it('should find element with that is equal', () => {
      document.body.innerHTML = `
        <button>click me</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('click me', ['button'], [])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('click me')
    })

    it('should find element with that contains', () => {
      document.body.innerHTML = `
        <button>click me, please</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('please', ['button'], [])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('click me, please')
    })

    it('should find element with attribute that is equal', () => {
      document.body.innerHTML = `
        <button aria-label="click me, please">itsa me mario</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('click me, please', ['button'], ['aria-label'])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('itsa me mario')
    })

    it('should find element with data-* attribute that is equal', () => {
      document.body.innerHTML = `
        <button data-aria-label="click me, please">itsa me mario</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('click me, please', ['button'], ['aria-label'])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('itsa me mario')
    })

    it('should find element with attribute that contains', () => {
      document.body.innerHTML = `
        <button aria-label="click me, please">itsa me mario</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('please', ['button'], ['aria-label'])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('itsa me mario')
    })

    it('should find element with data-* attribute that contains', () => {
      document.body.innerHTML = `
        <button data-aria-label="click me, please">itsa me mario</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('please', ['button'], ['aria-label'])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('itsa me mario')
    })

    it('should find element with attribute value that is equal', () => {
      document.body.innerHTML = `
        <button value="click me">some button</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('click me', ['button'], ['value'])
      expect(button.tagName.toLowerCase()).toBe('button')
      expect(button.textContent).toBe('some button')
    })

    it('should find element with attribute value that contains', () => {
      document.body.innerHTML = `
        <button value="click me, please">some button</button>
        <div>click me</div>
        <button>don't click me</button>
      `

      const [button] = fuzzy('please', ['button'], ['value'])
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

      const [checkbox] = fuzzy('da checkbox', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('dacheckbox')
    })

    it('should find element with with sibling element with that is equal', () => {
      document.body.innerHTML = `
        <label>da checkbox</label><input type="checkbox" id="you found me"></input>
      `

      const [checkbox] = fuzzy('da checkbox', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with with sibling element with that contains', () => {
      document.body.innerHTML = `
        <label>da checkbox</label><input type="checkbox" id="you found me"></input>
      `

      const [checkbox] = fuzzy('da check', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with with descendant element with that is equal', () => {
      document.body.innerHTML = `
        <div>da checkbox<div><input type="checkbox" id="you found me"/></div></div>
      `

      const [checkbox] = fuzzy('da checkbox', ['input'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with with descendant element with that contains', () => {
      document.body.innerHTML = `
        <div>da checkbox that booms<div><input type="checkbox" id="you found me"></input></div></div>
      `

      const [checkbox] = fuzzy('da check', ['input[type=checkbox]'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with sibling element with attribute that is equal', () => {
      document.body.innerHTML = `
        <input type="checkbox" id="you found me"></input>
        <label aria-label="da checkbox"></label>
      `

      const [checkbox] = fuzzy('da checkbox', ['[type=checkbox]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with sibling element with data-* attribute that is equal', () => {
      document.body.innerHTML = `
        <input type="checkbox" id="you found me"></input>
        <label data-aria-label="da checkbox"></label>
      `

      const [checkbox] = fuzzy('da checkbox', ['[type=checkbox]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with sibling element with attribute that contains', () => {
      document.body.innerHTML = `
        <input type="checkbox" id="you found me"></input>
        <label aria-label="da checkbox"></label>
      `

      const [checkbox] = fuzzy('da check', ['[type=checkbox]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with sibling element with data-* attribute that contains', () => {
      document.body.innerHTML = `
        <input type="checkbox" id="you found me"></input>
        <label data-aria-label="da checkbox"></label>
      `

      const [checkbox] = fuzzy('da check', ['[type=checkbox]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with descendnat element with attribute that is equal', () => {
      document.body.innerHTML = `
        <div role="button" id="you found me">
          <label aria-label="da button"><label>
        </div>
      `

      const [checkbox] = fuzzy('da button', ['[role=button]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('div')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with descendnat element with data- attribute that is equal', () => {
      document.body.innerHTML = `
        <div role="button" id="you found me">
          <label data-aria-label="da button"><label>
        </div>
      `

      const [checkbox] = fuzzy('da button', ['[role=button]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('div')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with descendnat element with attribute that contains', () => {
      document.body.innerHTML = `
        <div role="button" id="you found me">
          <label aria-label="da button"><label>
        </div>
      `

      const [checkbox] = fuzzy('da but', ['[role=button]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('div')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with descendnat element with data- attribute that contains', () => {
      document.body.innerHTML = `
        <div role="button" id="you found me">
          <label data-aria-label="da button"><label>
        </div>
      `

      const [checkbox] = fuzzy('da bu', ['[role=button]'], ['aria-label'])
      expect(checkbox.tagName.toLowerCase()).toBe('div')
      expect(checkbox.id).toBe('you found me')
    })

    it('should find element with ancestor that has text content that is equal', () => {
      document.body.innerHTML = `
        <div>
          <div>
            <p>find that guy<p>
          </div>
          <div>
            <div>
              <input id="da right one"></input>
            </div>
          </div>
        </div>
      `

      const [checkbox] = fuzzy('find that guy', ['input'], [])
      expect(checkbox.tagName.toLowerCase()).toBe('input')
      expect(checkbox.id).toBe('da right one')
    })
  })
})
