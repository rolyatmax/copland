import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers'
import { addInstruments } from './middlewares/add_instruments'
import { playLoop } from './middlewares/play_loop'
import { evolveLoop } from './middlewares/evolve_loop'

const store = applyMiddleware(
  addInstruments,
  playLoop,
  evolveLoop,
)(createStore)(rootReducer)

export default store
