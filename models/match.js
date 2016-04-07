/**
 * Created by imeeder on 2/9/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matchSchema = new Schema({
    ted: { type: Schema.Types.ObjectId, ref: 'User'},
    barney: { type: Schema.Types.ObjectId, ref: 'User'},
    robin: { type: Schema.Types.ObjectId, ref: 'User'},
    preference: Boolean
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;
