import React from 'react';
import Pad from './pad';
import {PAD_WIDTH} from '../constants';


class Column extends React.Component {
    shouldComponentUpdate(props) {
        return props.pulsing !== this.props.pulsing ||
               props.pads !== this.props.pads ||
               props.soundPalette !== this.props.soundPalette;
    }

    renderPads({pads, column, actions, instrument, soundPalette, pulsing}) {
        let els = [];
        let row = pads.length;
        while (row--) {
            let active = pads[row];
            els.push(
                <Pad
                    key={row}
                    pulsing={pulsing && active}
                    {...{column, row, active, actions, instrument, soundPalette}}
                />
            );
        }
        return els;
    }

    render() {
        return (
            <div style={{width: PAD_WIDTH, display: 'inline-block'}}>
                {this.renderPads(this.props)}
            </div>
        );
    }
}

Column.propTypes = {
    instrument: React.PropTypes.number.isRequired,
    column: React.PropTypes.number.isRequired,
    pads: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired,
    soundPalette: React.PropTypes.number.isRequired,
    pulsing: React.PropTypes.bool.isRequired
};


export default Column;
