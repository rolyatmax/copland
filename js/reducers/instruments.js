import {types} from '../actions';


let {TOGGLE_PAD, CHANGE_SOUND_PALETTE, ADD_INSTRUMENT, CLEAR_ALL_PADS} = types;


function fillWithArrays(array, fillArray) {
    let size = array.length;
    let result = array.slice();
    while (size--) {
        result[size] = fillArray.slice();
    }
    return result;
}

function emptyMatrix(columns, rows) {
    let columnData = Array(rows).fill(false);
    return fillWithArrays(Array(columns), columnData);
}

export function instruments(state = [], action) {
    switch (action.type) {
    case ADD_INSTRUMENT:
        let {measureLength, sounds} = action.instrument;
        let active = emptyMatrix(measureLength, sounds);
        let newInstrument = {...action.instrument, active};
        return [...state, newInstrument];
    case CLEAR_ALL_PADS:
        return state.map(instr => ({
            ...instr,
            active: emptyMatrix(instr.measureLength, instr.sounds)
        }));
    case CHANGE_SOUND_PALETTE:
        return state.map(instr => {
            return {
                ...instr,
                soundPalette: (instr.soundPalette + 1) % instr.palettes.length
            };
        });
    case TOGGLE_PAD:
        let {instrument, column, row} = action.pad;
        let col = state[instrument].limit ? Array(state[instrument].sounds).fill(false) :
                                state[instrument].active[column].slice();
        col[row] = !col[row];
        let newActive = [
            ...state[instrument].active.slice(0, column),
            col,
            ...state[instrument].active.slice(column + 1)
        ];
        return [
            ...state.slice(0, instrument),
            {...state[instrument], active: newActive},
            ...state.slice(instrument + 1)
        ];
    default:
        return state;
    }
}
