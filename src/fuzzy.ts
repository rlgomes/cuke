(window as any).fuzzy = function (
  name: string,
  tags: string[],
  attributes: string[] = [],
  direction: string = 'l2r',
  filterBy: string = ':visible'
) {
  $.extend($.expr[':'], {
    equals: function (element: any, _: number, meta: string[]) {
      return ((element.textContent ?? element.innerText ?? '') === meta[3])
    },

    // jquery's :visible isn't as accurate as one would expect and with
    // a few small tweaks can be more useful like so:
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

    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      elements = elements.concat($(`${tags[tIndex]}${filterBy}:${matcher}("${name}")`).toArray())

      for (let aIndex = 0; aIndex < attributes.length; aIndex++) {
        elements = elements.concat($(`${tags[tIndex]}[${attributes[aIndex]}='${name}']${filterBy}`).toArray())
      }
    }

    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
      // label before the desired element
      elements = elements.concat($(`label${filterBy}:${matcher}("${name}")`).next(`${tags[tIndex]}${filterBy}`).toArray())
      // element could be not visible and the actual label is the thing we can interact with
      elements = elements.concat($(`${tags[tIndex]}`).prev(`label${filterBy}:${matcher}("${name}")`).toArray())

      // desired element wrapped with the label
      elements = elements.concat($(`label${filterBy}:${matcher}("${name}") ${tags[tIndex]}${filterBy}`).toArray())
      // element could be not visible and the actual label is the thing we can interact with
      elements = elements.concat($(`${tags[tIndex]}`).parents(`label${filterBy}:${matcher}("${name}")`).toArray())
    }

    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      if (direction === 'l2r') {
        elements = elements.concat($(`*${filterBy}:${matcher}('${name}')`).nextAll(`${tags[tIndex]}${filterBy}`).toArray())
      } else if (direction === 'r2l') {
        elements = elements.concat($(`*${filterBy}:${matcher}('${name}')`).prevAll(`${tags[tIndex]}${filterBy}`).toArray()
        )
      }
    }

    for (let tIndex = 0; tIndex < tags.length; tIndex++) {
      // label before the desired element
      elements = elements.concat($(`label${filterBy}:${matcher}("${name}")`).next('*').children(`${tags[tIndex]}${filterBy}`).toArray())
      // element could be not visible and the actual label is the thing we can interact with
      elements = elements.concat($(`${tags[tIndex]}`).parents('*').children(`label${filterBy}:${matcher}("${name}")`).toArray())
    }
  }

  return elements
}
