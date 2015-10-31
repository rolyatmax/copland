import React from 'react';
import {BASE_URL} from '../constants';
import {generateHash} from '../save_state_helpers';


class Save extends React.Component {
    shouldComponentUpdate(props) {
        return props.instruments !== this.props.instruments ||
               props.appState.resolution !== this.props.appState.resolution ||
               props.show !== this.props.show;
    }

    render() {
        let {show, appState, instruments, actions} = this.props;
        let {resolution} = appState;
        let code = show ? generateHash({resolution, instruments}) : '';
        return (
            <div className={`saved-popup ${show ? 'show' : ''}`}>
                <div className="close" onClick={actions.toggleSave}>x</div>
                <p>Share and listen to your creation with this url:</p>
                <textarea readOnly value={`${BASE_URL}#/${code}`} />
            </div>
        );
    }
}


Save.propTypes = {
    appState: React.PropTypes.object.isRequired,
    instruments: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool
};

export default Save;
