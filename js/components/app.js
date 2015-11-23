import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {creators} from '../actions';
import readme from '../../README.md';

import Info from './info';
import Save from './save';
import Loader from './loader';
import Board from './board';
import Controls from './controls';
import BottomBar from './bottom_bar';
import SelectResolution from './select_resolution';


class App extends React.Component {
    constructor(props) {
        super(props);
        let {actions} = props;
        let keyBindings = {
            '8': e => (e.preventDefault(), actions.clearAllPads()), // backspace
            '69': actions.toggleEvolving, // `e`
            '83': actions.toggleSave, // `s`
            '73': actions.toggleInfo, // `i`
            '13': actions.togglePlaying, // space
            '32': actions.togglePlaying // enter
        };
        this.onKeydown = e => (keyBindings[e.which] || (() => {}))(e);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeydown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeydown);
    }

    renderContainer({appState, actions, instruments}) {
        let {filesLoaded, filesToLoad, currentTick, playing} = appState;
        let isLoading = filesToLoad && filesLoaded < filesToLoad;
        let hasLoaded = filesToLoad && !isLoading;
        let style = {
            opacity: hasLoaded ? 1 : 0,
            transition: 'opacity 300ms linear 500ms'
        };
        return (
            <div style={style}>
                <div className="topbar"></div>
                <div id="container">
                    <h1 className="title">Copland</h1>
                    {hasLoaded ? <Board {...{currentTick, instruments, actions, playing}} /> : null}
                    {hasLoaded ? <Controls evolving={appState.evolving} {...{actions}} /> : null}
                </div>
            </div>
        );
    }

    render() {
        let {appState, actions} = this.props;
        let {showSave, showInfo, resolution, filesLoaded, filesToLoad} = appState;
        let isLoading = filesToLoad && filesLoaded < filesToLoad;

        return (
            <div>
                <div id="main-view" className={showInfo ? 'inactive' : ''}>
                    {this.renderContainer(this.props)}
                    {resolution ? null : <SelectResolution {...{actions}} />}
                    {isLoading ? <Loader {...{appState}} /> : null}
                    {filesToLoad ? <BottomBar {...{appState}} /> : null}
                </div>
                <Save show={showSave} {...this.props} />
                <Info show={showInfo}>{readme}</Info>
            </div>
        );
    }
}

App.propTypes = {
    appState: React.PropTypes.object.isRequired,
    instruments: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired
};


export default connect(
    ({appState, instruments}) => ({appState, instruments}),
    dispatch => ({actions: bindActionCreators(creators, dispatch)})
)(App);
