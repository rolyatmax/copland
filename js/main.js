import Backbone from 'backbone';
import $ from 'jquery';
import {shuffle} from 'underscore';
import {markdown} from 'markdown';
import App from './App';

let $popupUi = $('#popup_ui');
let loaded = false;

let startHerUp = function(opts) {
    if (loaded) {
        if (opts && opts.callback) { opts.callback(); }
        return;
    }

    loaded = true;

    $.get('README.md').then(text => {
        $('#info').append(markdown.toHTML(text)).show();
        $('#container').on('click', '.open_info', App.toggleInfo);
    });

    if (opts && opts.resolution) {
        showLoader();
        App.init(opts);
        if (opts && opts.callback) {
            opts.callback();
        }
        return;
    }

    $popupUi.fadeIn();

    $(document).on('click', 'h2', () => {
        showLoader();
        App.init({resolution: $(this).data('res')});
        if (opts && opts.callback) {
            opts.callback();
        }
    });
};

function showLoader() {
    let loadingText = shuffle('Spinning Hamster Wheels,Milking the Cows,Brewing the Coffee,Loading Audio Files,Solving Rubiks Cube,Filtering Water,Sharpening Pencils'.split(','));
    let text = loadingText.pop();
    $(document).off('click', 'h2');
    $popupUi.fadeOut(function() {
        $popupUi.html('<h3>' + text + '...</h3>').fadeIn();
        $('#perc').hide().text('0%').fadeIn();
    });
}

/////////// Router

let Router = Backbone.Router.extend({
    routes: {
        '': 'index',
        'load/:pattern': 'load'
    },

    index: startHerUp,
    load: function(pattern) {
        startHerUp({
            callback: function() {
                App.loadPattern(pattern);
            },
            resolution: 'high'
        });
    }

});


$(() => {
    let canPlayMP3 = (new Audio()).canPlayType('audio/mp3');
    if (!canPlayMP3 || canPlayMP3 === 'no') {
        alert('This website only works with browsers that can play mp3s. Try using Google Chrome.');
        return;
    }

    new Router();
    Backbone.history.start();
});
