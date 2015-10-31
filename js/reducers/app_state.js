import {types} from '../actions';


let {
    TOGGLE_PLAYING, TOGGLE_EVOLVING, TICK, ADD_INSTRUMENT,
    SET_RESOLUTION, TOGGLE_INFO, TOGGLE_SAVE, FILE_LOADED,
    SET_EVOLVE_SPEED, SET_TEMPO
} = types;

function getInitialState() {
    return {
        tempo: 350,
        evolveSpeed: 2000,
        playing: false,
        evolving: false,
        showInfo: false,
        showSave: false,
        resolution: null,
        filesToLoad: 0,
        filesLoaded: 0,
        currentTick: -1
    };
}

export function appState(state = getInitialState(), action) {
    switch (action.type) {
    case TICK:
        return {...state, currentTick: state.currentTick + 1};
    case TOGGLE_PLAYING:
        return {...state, playing: !state.playing};
    case TOGGLE_EVOLVING:
        return {...state, evolving: !state.evolving};
    case SET_RESOLUTION:
        return {...state, resolution: action.resolution};
    case TOGGLE_INFO:
        return {...state, showInfo: !state.showInfo};
    case TOGGLE_SAVE:
        return {...state, showSave: !state.showSave};
    case FILE_LOADED:
        return {...state, filesLoaded: state.filesLoaded + 1};
    case ADD_INSTRUMENT:
        let fileCount = action.instrument.palettes.length;
        return {...state, filesToLoad: state.filesToLoad + fileCount};
    case SET_EVOLVE_SPEED:
        return {...state, evolveSpeed: action.evolveSpeed};
    case SET_TEMPO:
        return {...state, tempo: action.tempo};
    default:
        return state;
    }
}
