// Block DevExtreme trial panel before it registers its custom elements
;(function () {
  const _define = customElements.define.bind(customElements)
  customElements.define = function (name, constructor, options) {
    if (name === 'dx-license' || name === 'dx-license-trigger') return
    return _define(name, constructor, options)
  }
})()

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store/store'

// const store = configureStore()

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
