/**
 * Created by imeeder on 2/7/2016
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var profileSchema = new Schema({
    name:  String,
    description: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    gender: { type: String, enum: ["male", "female"]},
    photos: [{ type: String }],
});

var Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
