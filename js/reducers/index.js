import {combineReducers} from 'redux';
import {instruments} from './instruments';
import {appState} from './app_state';

export default combineReducers({appState, instruments});
