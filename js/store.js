import {createStore, applyMiddleware} from 'redux';
import createLogger from 'redux-logger';
import rootReducer from './reducers';
import {addInstruments} from './middlewares/add_instruments';
import {playLoop} from './middlewares/play_loop';
import {evolveLoop} from './middlewares/evolve_loop';
import {types} from './actions';


const {TICK} = types;

const store = applyMiddleware(
    createLogger({
        collapsed: true,
        predicate: (getState, action) => action.type !== TICK
    }),
    addInstruments,
    playLoop,
    evolveLoop
)(createStore)(rootReducer);

window.store = store;

export default store;
