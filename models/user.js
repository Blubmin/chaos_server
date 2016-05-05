/**
 * Created by matthewaustin on 1/26/16.
 */

var mongoose = require('mongoose'),
    random = require('mongoose-random');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    facebook_id : String,
    email : String,
    gcmId: String,
    profile: {
        first_name: String,
        last_name: String,
        description: String,
        age: Schema.Types.Number,
        birthday: String,
        gender: {type: String, enum: ["male", "female"]},
        photos: [{type: String}],
        wingmen: [{type: Schema.Types.ObjectId, ref: 'User'}]
    },
    match_limits: [{
        ted: String,
        count: Schema.Types.Number,
        timestamp: Date
    }]
});
// Adds in the ability to query for a random profile
userSchema.plugin(random, {path: 'r'});

var User = mongoose.model('User', userSchema);

module.exports = User;