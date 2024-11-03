import React from 'react'
import { createRoot } from 'react-dom/client'
import { createRenderer } from './renderer.ts'
import Buttons from './components/buttons.tsx'
import Intro from './components/intro.tsx'
import Copland from './copland'
import instrumentConfig from './instrument-config'
import './styles/normalize.css'
import './styles/styles.css'

const canPlayMP3 = new Audio().canPlayType('audio/mp3')
if (!canPlayMP3 || canPlayMP3 === 'maybe') {
  let msg = 'This website only works with browsers that can play mp3s.'
  alert(msg)
  throw new Error(msg)
}

const copland = new Copland(instrumentConfig)
const renderer = await createRenderer(document.querySelector('canvas')!, copland)

const { hash } = document.location
if (hash && hash.slice(0, 2) === '#/') {
  copland.loadFromHash(hash.slice(2))
} else {
  copland.randomizePads()
}

copland.addOnReady(() => {
  document.querySelector('#app')!.classList.add('show')
  renderer.start()
})

const introRoot = createRoot(document.querySelector('#intro'))
introRoot.render(<Intro copland={copland} />)

const buttonsRoot = createRoot(document.querySelector('#btns'))
buttonsRoot.render(<Buttons copland={copland} />)
