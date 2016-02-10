/**
 * Created by imeeder on 2/9/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var matchSchema = new Schema({
    user_alpha: { type: Schema.Types.ObjectId, ref:'Profile'},
    user_omega: { type: Schema.Types.ObjectId, ref: 'Profile'},
    alpha_preference: Boolean,
    omega_preference: Boolean
});

var Match = mongoose.model('Match', matchSchema);

module.exports = Match;
