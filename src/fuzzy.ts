(window as any).fuzzy = function (
  name: string,
  tags: string[],
  attributes: string[] = [],
  options: {
    direction?: string
    filterBy?: string
    root?: Element
  } = {}
): Element[] {
  // defaults
  const {
    direction = 'l2r',
    filterBy = ':visible',
    root = document.body
  } = options

  $.extend($.expr[':'], {
    equals: function (element: any, _: number, meta: string[]) {
      return ((element.textContent ?? element.innerText ?? '') === meta[3])
    },

    // better than jquery's :visible
    visible: function (element: any, _: number, __: string[]) {
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
      const results = $(`${tags[tIndex]}${filterBy}:${matcher}("${name}")`, root).toArray()
      elements = elements.concat(results)
    }

    // <tag attribute=name></tag>
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // attribute equals
      for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
        elements = [...elements, ...$(`${tags[tIndex]}[${attributes[aIndex]}='${name}']${filterBy}`, root)]

        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
        elements = [...elements, ...$(`${tags[tIndex]}[data-${attributes[aIndex]}='${name}']${filterBy}`, root)]
      }

      // attribute contains
      for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
        elements = [...elements, ...$(`${tags[tIndex]}[${attributes[aIndex]}*='${name}']${filterBy}`, root)]

        // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
        elements = [...elements, ...$(`${tags[tIndex]}[data-${attributes[aIndex]}*='${name}']${filterBy}`, root)]
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
    // <label for=X>mame</label>......<tag id=X>....
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      const forElements = $(`label${filterBy}:${matcher}("${name}")[for]`, root).toArray()
      forElements.forEach((element) => {
        elements = [...elements, ...$(`${tags[tIndex]}[id=${element.getAttribute('for') ?? ''}]${filterBy}`)]
      })
    }

    // sibling has value
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // <*>name</*> <tag/>
      elements = [...elements, ...$(`*${filterBy}:${matcher}("${name}")`, root).next(`${tags[tIndex]}${filterBy}`)]

      // <tag/> <* attribute=name> </*>
      for (let tIndex = 0; tIndex < tags.length; tIndex++) {
        // attribute equals
        for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
          elements = [...elements, ...$(`*[${attributes[aIndex]}='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`)]

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements = [...elements, ...$(`*[data-${attributes[aIndex]}='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`)]

          elements = [...elements, ...$(`*[${attributes[aIndex]}*='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`)]

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements = [...elements, ...$(`*[data-${attributes[aIndex]}*='${name}']${filterBy}`, root).prev(`${tags[tIndex]}${filterBy}`)]
        }
      }
    }

    // descendant has value
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // <*>name<tag/></*>
      elements = [...elements, ...$(`*${filterBy}:${matcher}("${name}") ${tags[tIndex]}${filterBy}`, root)]

      // <tag/> <* attribute=name> </*>
      for (let tIndex = 0; tIndex < tags.length; tIndex++) {
        // attribute equals
        for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
          elements = [...elements, ...$(`*[${attributes[aIndex]}='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`)]

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements = [...elements, ...$(`*[data-${attributes[aIndex]}='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`)]

          elements = [...elements, ...$(`*[${attributes[aIndex]}*='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`)]

          // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/data-*
          elements = [...elements, ...$(`*[data-${attributes[aIndex]}*='${name}']${filterBy}`, root).parents(`${tags[tIndex]}${filterBy}`)]
        }
      }
    }

    // label with descendant matches
    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // common design is the target element is invisible and the labelling element is the one you interact with
      // <label>name<tag/></label>
      elements = [...elements, ...$(`${tags[tIndex]}`, root).parents(`label${filterBy}:${matcher}("${name}")`)]
    }

    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      if (direction === 'l2r') {
        // <*>name</*>...<tag></tag>
        elements = [...elements, ...$(`*${filterBy}:${matcher}('${name}')`, root).nextAll(`${tags[tIndex]}${filterBy}`)]
      } else if (direction === 'r2l') {
        // <taG></tag>...<*>name</*>
        elements = [...elements, ...$(`*${filterBy}:${matcher}('${name}')`, root).prevAll(`${tags[tIndex]}${filterBy}`)]
      }
    }
  }

  return elements
}
