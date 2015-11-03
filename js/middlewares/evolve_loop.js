import {random, sample, max} from 'underscore';
import {types, creators} from '../actions';

const {changeSoundPalette, togglePad} = creators;
const {TOGGLE_EVOLVING} = types;


export const evolveLoop = store => next => action => {
    switch (action.type) {
    case TOGGLE_EVOLVING:
        toggleLoop(store);
        break;
    default:
        break;
    }
    return next(action);
};

let timeout;
function toggleLoop(store) {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
        return;
    }

    function step() {
        let {evolving, evolveSpeed} = store.getState().appState;
        evolveStep(store);
        if (evolving) {
            timeout = setTimeout(step, evolveSpeed);
        }
    }

    timeout = setTimeout(step, 0);
}

function getRowAndColumn(isActive, pads) {
    return pads.reduce((collection, rows, column) => {
        let row = rows.length;
        collection = collection.slice();
        while (row--) {
            if (isActive === rows[row]) {
                collection.push({column, row});
            }
        }
        return collection;
    }, []);
}

function evolveStep({getState, dispatch}) {
    getState().instruments.filter(instrument => {
        return instrument.evolve && random(0, 1) === 1;
    }).forEach((instrument, i) => {
        let {measureLength, sounds, active} = instrument;

        // Collect some stats on the whole grid, and each row/column
        let totalPads = sounds * measureLength;
        let activePads = getRowAndColumn(true, active);
        let inactivePads = getRowAndColumn(false, active);
        let percFilled = activePads.length / totalPads;
        let mostFilledCol = getMostFilledCol(active);
        let mostFilledRow = getMostFilledRow(active);

        if (mostFilledCol.length > 2) {
            dispatch(togglePad({
                instrument: i,
                ...sample(mostFilledCol)
            }));
        } else if (mostFilledRow.length > 2) {
            dispatch(togglePad({
                instrument: i,
                ...sample(mostFilledRow)
            }));
        } else if (percFilled > 0.38) {
            dispatch(togglePad({
                instrument: i,
                ...sample(activePads)
            }));
        } else if (percFilled < 0.29) {
            dispatch(togglePad({
                instrument: i,
                ...sample(inactivePads)
            }));
        } else {
            dispatch(togglePad({
                instrument: i,
                ...sample(activePads)
            }));
            dispatch(togglePad({
                instrument: i,
                ...sample(inactivePads)
            }));
        }

        if (random(0, 7) === 7) {
            dispatch(changeSoundPalette());
        }
    });
}

function getMostFilledCol(active) {
    let columnData = active
        .map((rows, column) => {
            return rows.reduce((collection, isActive, row) => {
                collection = collection.slice();
                if (isActive) {
                    collection.push({column, row});
                }
                return collection;
            }, []);
        });

    return max(columnData, column => column && column.length);
}

function getMostFilledRow(active) {
    let rowData = [];
    let row = active[0].length;
    while (row--) {
        rowData[row] = [];
        let column = active.length;
        while (column--) {
            if (active[column][row]) {
                rowData[row].push({column, row});
            }
        }
    }
    return max(rowData, r => r && r.length);
}
