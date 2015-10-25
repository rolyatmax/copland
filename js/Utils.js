var Copland = Copland || {};

(function() {
    'use strict';

    /////// Utils

    Copland.Utils = {};

    Copland.Utils.getMostFilledCol = function() {
        var columnsData = [];

        for (var i = 0, len = this.columns; i < len; i++) {
            var active = _.where(this.pads, {column: i, active: true});
            columnsData.push({
                column: i,
                active: active,
                activeCount: active.length
            });
        }

        return _.max(columnsData, function(column){ return column.activeCount; });
    };

    Copland.Utils.getMostFilledRow = function() {
        var rowsData = [];

        for (var i = 0, len = this.rows; i < len; i++) {
            var active = _.where(this.pads, {row: i, active: true});
            rowsData.push({
                row: i,
                active: active,
                activeCount: active.length
            });
        }

        return _.max(rowsData, function(row){ return row.activeCount; });
    };

    Copland.Utils.random = function(low, high) {

        var diff = high - low;
        return (((diff * Math.random()) + 0.5) | 0) + low;
    };

}());
