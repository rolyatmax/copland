
// sb: hide
var Copland = Copland || {};
// sb end

(function($) {

/////// Utils

Copland.Utils = {};

Copland.Utils.getMostFilledCol = function() {
	var columns_data = [];

	for (var i = 0, len = this.columns; i < len; i++) {
		var active = _.where(this.pads, {column: i, active: true});
		columns_data.push({
			column: i,
			active: active,
			active_count: active.length
		});
	}

	return _.max(columns_data, function(column){ return column.active_count; });
};

Copland.Utils.getMostFilledRow = function() {
	var rows_data = [];

	for (var i = 0, len = this.rows; i < len; i++) {
		var active = _.where(this.pads, {row: i, active: true});
		rows_data.push({
			row: i,
			active: active,
			active_count: active.length
		});
	}

	return _.max(rows_data, function(row){ return row.active_count; });
};

Copland.Utils.random = function(low, high) {

	var diff = high - low;
	return (((diff * Math.random()) + 0.5) | 0) + low;
};

}(jQuery));