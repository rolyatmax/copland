import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { creators } from '../actions'
import { COLORS } from '../constants'

import Save from './save'
import Board from './board'
import type { AppState, Instrument } from '../types'

type AppProps = {
  appState: AppState
  instruments: Instrument[]
  actions: {
    clearAllPads: () => void
    toggleEvolving: () => void
    toggleSave: () => void
    togglePlaying: () => void
  }
}

const TEXT_OPTS = [
  'Spinning Hamster Wheels',
  'Milking the Cows',
  'Brewing the Coffee',
  'Loading Audio Files',
  'Solving Rubiks Cube',
  'Filtering Water',
  'Sharpening Pencils',
]

const loadingText = TEXT_OPTS[Math.floor(Math.random() * TEXT_OPTS.length)]

class App extends React.Component<AppProps> {
  onKeydown = (e: KeyboardEvent) => {
    e.preventDefault()
    const keyBindings: Record<string, () => void> = {
      Backspace: this.props.actions.clearAllPads,
      KeyE: this.props.actions.toggleEvolving,
      KeyS: this.props.actions.toggleSave,
      Space: this.props.actions.togglePlaying,
      Enter: this.props.actions.togglePlaying,
    }
    const action = keyBindings[e.code] ?? (() => {})
    action()
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
  }

  render() {
    const { appState, actions, instruments } = this.props
    const { showSave, showInfo, filesLoaded, filesToLoad, currentTick, evolving, playing } = appState
    const { toggleSave, toggleEvolving, togglePad, changeSoundPalette } = actions
    const isLoading = filesToLoad && filesLoaded < filesToLoad
    const hasLoaded = filesToLoad && !isLoading

    const style = {
      opacity: hasLoaded ? 1 : 0,
      transition: 'opacity 300ms linear 500ms',
    }

    const perc = isLoading ? ((filesLoaded / filesToLoad) * 100 + 0.5) | 0 : 100
    const index = isLoading ? filesLoaded : (currentTick / 8) | 0
    const backgroundColor = COLORS[index % COLORS.length]

    return (
      <div>
        <div id="main-view" className={showInfo ? 'inactive' : ''}>
          <div style={style}>
            <div className="topbar"></div>
            <div id="container">
              <h1 className="title">Copland</h1>
              {hasLoaded ? <Board {...{ currentTick, instruments, togglePad, changeSoundPalette, playing }} /> : null}
              {hasLoaded ? <div className="btns">
                <div onClick={toggleSave} className="save-btn">
                  save
                </div>
                <div onClick={toggleEvolving} className={`evolve-btn ${evolving ? 'evolving' : ''}`}>
                  evolve
                </div>
              </div> : null}
            </div>
          </div>
          {isLoading ? <div className="loader">
            <h3>{loadingText}...</h3>
            <div id="perc">{perc}%</div>
          </div> : null}
          {filesToLoad ? <div
            className={`bottombar ${hasLoaded ? 'loaded' : ''}`}
            style={{ width: `${perc}%`, backgroundColor }}
          /> : null}
        </div>
        <Save show={showSave} {...{ instruments, toggleSave }} />
      </div>
    )
  }
}

export default connect(
  ({ appState, instruments }) => ({ appState, instruments }),
  (dispatch) => ({ actions: bindActionCreators(creators, dispatch) }),
)(App)
