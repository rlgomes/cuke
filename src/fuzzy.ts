(window as any).fuzzy = function (
  name: string,
  tags: string[],
  attributes: string[] = [],
  options: {
    direction?: string
    filterBy?: string
    root?: Element
    index?: number
  } = {}
): Element[] {
  // defaults
  const {
    direction = 'l2r',
    filterBy = ':visible',
    root = document.body,
    index = -1
  } = options

  $.extend($.expr[':'], {
    equals: function (element: HTMLElement, _: number, meta: string[]) {
      return ((element.textContent ?? element.innerText ?? '') === meta[3])
    },

    // better than jquery's :visible
    visible: function (element: HTMLElement, _: number, __: string[]) {
      return Boolean(element.offsetWidth ?? element.offsetHeight ?? element.clientHeight ?? element.clientWidth)
    }
  })

  let elements: Element[] = []
  const matchers = ['equals', 'contains']

  name = name.replaceAll("'", "\\'")
  name = name.replaceAll('"', '\\"')

  for (let mIndex = 0; mIndex < matchers.length; mIndex++) {
    const matcher = matchers[mIndex]

    // <tag>name</taG>
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      elements = elements.concat($(`${tags[tIndex]}${filterBy}:${matcher}("${name}")`, root).toArray())
      if (elements[index] != null) { return [elements[index]] }
    }

    // <tag attribute=name></tag>
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // attribute equals
      for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
        elements.push(...$(`${tags[tIndex]}[${attributes[aIndex]}='${name}']${filterBy}`, root))
        if (elements[index] != null) { return [elements[index]] }

        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
        elements.push(...$(`${tags[tIndex]}[data-${attributes[aIndex]}='${name}']${filterBy}`, root))
        if (elements[index] != null) { return [elements[index]] }
      }

      // attribute contains
      for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
        elements.push(...$(`${tags[tIndex]}[${attributes[aIndex]}*='${name}']${filterBy}`, root))
        if (elements[index] != null) { return [elements[index]] }

        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
        elements.push(...$(`${tags[tIndex]}[data-${attributes[aIndex]}*='${name}']${filterBy}`, root))
        if (elements[index] != null) { return [elements[index]] }
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
    // <label for=X>mame</label>......<tag id=X>....
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      const forElements = $(`label${filterBy}:${matcher}("${name}")[for]`, root).toArray()
      forElements.forEach((element) => {
        elements.push(...$(`${tags[tIndex]}[id=${element.getAttribute('for') ?? ''}]${filterBy}`))
      })
      if (elements[index] != null) { return [elements[index]] }
    }

    // sibling has value
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // <*>name</*> <tag/>
      elements.push(...$(`*${filterBy}:${matcher}("${name}")`, root).next(`${tags[tIndex]}${filterBy}`))
      if (elements[index] != null) { return [elements[index]] }

      // <tag/> <* attribute=name> </*>
      for (let tIndex = 0; tIndex < tags.length; tIndex++) {
        // attribute equals
        for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
          elements.push(...$(`*[${attributes[aIndex]}='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements.push(...$(`*[data-${attributes[aIndex]}='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }

          elements.push(...$(`*[${attributes[aIndex]}*='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements.push(...$(`*[data-${attributes[aIndex]}*='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }
        }
      }
    }

    // descendant has value
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // <*>name<tag/></*>
      elements.push(...$(`*${filterBy}:${matcher}("${name}") ${tags[tIndex]}${filterBy}`, root))
      if (elements[index] != null) { return [elements[index]] }

      // <tag/> <* attribute=name> </*>
      for (let tIndex = 0; tIndex < tags.length; tIndex++) {
        // attribute equals
        for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
          elements.push(...$(`*[${attributes[aIndex]}='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements.push(...$(`*[data-${attributes[aIndex]}='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }

          elements.push(...$(`*[${attributes[aIndex]}*='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements.push(...$(`*[data-${attributes[aIndex]}*='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`))
          if (elements[index] != null) { return [elements[index]] }
        }
      }
    }

    // label with descendant matches
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // common design is the target element is invisible and the labelling element is the one you interact with
      // <label>name<tag/></label>
      elements.push(...$(`${tags[tIndex]}`, root).parents(`label${filterBy}:${matcher}("${name}")`))
      if (elements[index] != null) { return [elements[index]] }
    }

    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      if (direction === 'l2r') {
        // <*>name</*>...<tag></tag>
        elements.push(...$(`*${filterBy}:${matcher}('${name}')`, root).nextAll(`${tags[tIndex]}${filterBy}`))
        if (elements[index] != null) { return [elements[index]] }
      } else if (direction === 'r2l') {
        // <taG></tag>...<*>name</*>
        elements.push(...$(`*${filterBy}:${matcher}('${name}')`, root).prevAll(`${tags[tIndex]}${filterBy}`))
        if (elements[index] != null) { return [elements[index]] }
      }
    }
  }

  return elements
}
