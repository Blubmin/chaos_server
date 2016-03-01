/**
 * Created by imeeder on 2/9/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matchSchema = new Schema({
    user1: { type: Schema.Types.ObjectId, ref: 'User'},
    user2: { type: Schema.Types.ObjectId, ref: 'User'},
    preference1: Boolean,
    preference2: Boolean
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;
