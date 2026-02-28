import React from 'react'
import { createRoot } from 'react-dom/client'

export function mountAllComponents() {
  const elements = document.querySelectorAll('[data-react-component]')
  elements.forEach((el) => {
    const name = el.dataset.reactComponent
    const props = el.dataset.props ? JSON.parse(el.dataset.props) : {}

    loadComponent(name).then((Component) => {
      if (Component) {
        const root = createRoot(el)
        root.render(React.createElement(Component, props))
      }
    })
  })
}

async function loadComponent(name) {
  const modules = import.meta.glob('../components/**/*.jsx')
  const key = `../components/${name}.jsx`

  if (modules[key]) {
    const mod = await modules[key]()
    return mod.default
  }

  console.error(`[mountAllComponents] Component not found: ${name}`)
  return null
}
