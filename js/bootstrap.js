var App = App || {};

(function($){
    'use strict';

    var $popupUi = $('#popup_ui');

    var startHerUp = function( opts ) {

        if (App.loaded) {
            if (opts && opts.callback) { opts.callback(); }
            return;
        }

        App.loaded = true;

        /////// Put info text in the info box
        var converter = new Markdown.Converter();
        $.get('README.md').then(function(text){
            $('#info').append( converter.makeHtml(text) ).show();
            $('#container').on('click', '.open_info', App.toggleInfo);
        });

        if (opts && opts.resolution) {
            setRes( opts.resolution );
            App.init();
            if (opts && opts.callback) { opts.callback(); }
            return;
        }

        $popupUi.fadeIn();

        $(document).on('click', 'h2', function() {
            var res = $(this).data('res');

            setRes(res);
            App.init();

            if (opts && opts.callback) { opts.callback(); }

        });
    };

    var setRes = function(res) {

        var loadingText = _.shuffle( 'Spinning Hamster Wheels,Milking the Cows,Brewing the Coffee,Loading Audio Files,Solving Rubiks Cube,Filtering Water,Sharpening Pencils'.split(',') );
        var text = loadingText.pop();

        App.resolution = res;
        Copland.lowRes = (res == 'low') ? true : false;

        $(document).off('click', 'h2');

        App.setURLs();

        $popupUi.fadeOut(function(){
            $popupUi.html('<h3>' + text + '...</h3>').fadeIn();
            $('#perc').hide().text('0%').fadeIn();
        });
    };

    /////////// Router

    var Router = Backbone.Router.extend({

        routes: {
            '': 'index',
            'load/:pattern': 'load'
        },

        index: startHerUp,

        load: function(pattern) {

            var opts = {
                callback: function(){
                    App.loadPattern( pattern );
                },
                resolution: 'high'
            };

            startHerUp( opts );
        }

    });

    /////// Where it AAAALLLL begins

    $(function() {

        //// Check canPlayType('audio/mp3')
        var canPlayMP3 = (new Audio()).canPlayType('audio/mp3');
        if (!canPlayMP3 || canPlayMP3 === '' || canPlayMP3 === 'no') {
            alert('This website only works with browsers that can play mp3s. Try using Google Chrome.');
            return;
        }

        App.router = new Router();
        Backbone.history.start();
    });

}(jQuery));
