/**
 * Created by imeeder on 2/7/2016
 */

var mongoose = require('mongoose'),
    random = require('mongoose-random');
var Schema = mongoose.Schema;

var profileSchema = new Schema({
    name:  String,
    description: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    gender: { type: String, enum: ["male", "female"]},
    photos: [{ type: String }],
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match'}]
});
profileSchema.plugin(random, { path: 'r' });

var Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
