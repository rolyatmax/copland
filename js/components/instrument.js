import React from 'react';
import Column from './column';
import {PAD_WIDTH} from '../constants';


class Instrument extends React.Component {
    shouldComponentUpdate(props) {
        return props.instrument !== this.props.instrument ||
               props.currentTick !== this.props.currentTick &&
               props.currentTick % props.instrument.duration === 0;
    }

    render() {
        let {instrument, actions, i, currentTick, playing} = this.props;
        let {measureLength, active, soundPalette, duration} = instrument;
        let style = {width: measureLength * PAD_WIDTH};
        return (
            <div className="instrument" style={style}>
                {active.map((pads, column) =>
                    <Column
                        key={column}
                        instrument={i}
                        pulsing={playing && (currentTick / duration) % measureLength === column}
                        {...{actions, pads, column, soundPalette}} />
                )}
            </div>
        );
    }
}

Instrument.propTypes = {
    instrument: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired,
    i: React.PropTypes.number.isRequired,
    currentTick: React.PropTypes.number.isRequired,
    playing: React.PropTypes.bool.isRequired
};

export default Instrument;
