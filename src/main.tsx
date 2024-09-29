import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/app.tsx'
import store from './store.ts'
import { loadPattern } from './save_state_helpers.ts'
import './normalize.css'
import './styles.css'

const canPlayMP3 = new Audio().canPlayType('audio/mp3')
if (!canPlayMP3 || canPlayMP3 === 'maybe') {
  let msg = 'This website only works with browsers that can play mp3s.'
  alert(msg)
  throw new Error(msg)
}

const { hash } = document.location
if (hash && hash.slice(0, 2) === '#/') {
  loadPattern(hash.slice(2))
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#app'),
)
