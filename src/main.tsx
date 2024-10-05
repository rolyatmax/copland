import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app.tsx'
import Copland from './copland'
import instrumentConfig from './instrument-config'
import './normalize.css'
import './styles.css'

const canPlayMP3 = new Audio().canPlayType('audio/mp3')
if (!canPlayMP3 || canPlayMP3 === 'maybe') {
  let msg = 'This website only works with browsers that can play mp3s.'
  alert(msg)
  throw new Error(msg)
}

const copland = new Copland(instrumentConfig)

const { hash } = document.location
if (hash && hash.slice(0, 2) === '#/') {
  copland.loadFromHash(hash.slice(2))
}

const root = createRoot(document.querySelector('#app'))
root.render(<App copland={copland} />)
