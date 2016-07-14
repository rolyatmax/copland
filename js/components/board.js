import React from 'react';
import Instrument from './instrument';
import PaletteSelector from './palette_selector';


class Board extends React.Component {
    shouldComponentUpdate(props) {
        return this.props.instruments !== props.instruments ||
               this.props.currentTick !== props.currentTick;
    }

    render() {
        let {actions, instruments, currentTick, playing} = this.props;
        return (
            <div>
                {instruments.map((instrument, i) =>
                    <Instrument {...{instrument, actions, i, currentTick, playing, key: i}} />
                )}
                <PaletteSelector {...{instruments, actions}} />
            </div>
        );
    }
}

Board.propTypes = {
    instruments: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired,
    currentTick: React.PropTypes.number.isRequired,
    playing: React.PropTypes.bool.isRequired
};

export default Board;
