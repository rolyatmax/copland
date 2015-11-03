import keyMirror from 'keymirror';


export const types = keyMirror({
    TICK: null,
    TOGGLE_PAD: null,
    ADD_INSTRUMENT: null,
    CLEAR_ALL_PADS: null,
    CHANGE_SOUND_PALETTE: null,
    TOGGLE_PLAYING: null,
    TOGGLE_EVOLVING: null,
    TOGGLE_INFO: null,
    TOGGLE_SAVE: null,
    FILE_LOADED: null,
    SET_RESOLUTION: null,
    LOAD_PATTERN: null,
    UNDO: null,
    SET_EVOLVE_SPEED: null,
    SET_TEMPO: null
});


let {
    TICK, TOGGLE_PAD, ADD_INSTRUMENT, CHANGE_SOUND_PALETTE, TOGGLE_PLAYING,
    CLEAR_ALL_PADS, TOGGLE_EVOLVING, SET_RESOLUTION, UNDO, TOGGLE_INFO,
    TOGGLE_SAVE, FILE_LOADED, LOAD_PATTERN, SET_EVOLVE_SPEED, SET_TEMPO
} = types;


export const creators = {
    tick: () => ({type: TICK}),
    changeSoundPalette: () => ({type: CHANGE_SOUND_PALETTE}),
    clearAllPads: () => ({type: CLEAR_ALL_PADS}),
    togglePlaying: () => ({type: TOGGLE_PLAYING}),
    toggleEvolving: () => ({type: TOGGLE_EVOLVING}),
    toggleInfo: () => ({type: TOGGLE_INFO}),
    toggleSave: () => ({type: TOGGLE_SAVE}),
    fileLoaded: () => ({type: FILE_LOADED}),
    loadPattern: hash => ({
        type: LOAD_PATTERN,
        hash
    }),
    undo: () => ({type: UNDO}),
    setResolution: resolution => ({
        type: SET_RESOLUTION,
        resolution
    }),
    setEvolveSpeed: evolveSpeed => ({
        type: SET_RESOLUTION,
        evolveSpeed
    }),
    setTempo: tempo => ({
        type: SET_RESOLUTION,
        tempo
    }),
    togglePad: ({instrument, column, row}) => ({
        type: TOGGLE_PAD,
        pad: {instrument, column, row}
    }),
    addInstrument: (instrument) => ({
        type: ADD_INSTRUMENT,
        instrument
    })
};
