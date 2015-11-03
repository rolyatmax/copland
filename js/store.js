import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import rootReducer from './reducers';
import {addInstruments} from './middlewares/add_instruments';
import {playLoop} from './middlewares/play_loop';
import {evolveLoop} from './middlewares/evolve_loop';


const store = applyMiddleware(
    createLogger(),
    addInstruments,
    playLoop,
    evolveLoop
)(createStore)(rootReducer);

window.store = store;

export default store;
