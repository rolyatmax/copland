import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import App from './components/app';
import store from './store';
import {loadPattern} from './save_state_helpers';


let canPlayMP3 = (new Audio()).canPlayType('audio/mp3');
if (!canPlayMP3 || canPlayMP3 === 'no') {
    let msg = 'This website only works with browsers that can play mp3s. Try using Google Chrome.';
    alert(msg);
    throw new Error(msg);
}


let {hash} = document.location;
if (hash && hash.slice(0, 2) === '#/') {
    loadPattern(hash.slice(2));
}


ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector('#app')
);
