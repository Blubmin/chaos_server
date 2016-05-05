/**
 * Created by matthewaustin on 1/26/16.
 */

var mongoose = require('mongoose'),
    random = require('mongoose-random'),
    geodist = require('geodist');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    facebook_id : String,
    email : String,
    gcmId: String,
    profile: {
        first_name: String,
        last_name: String,
        description: String,
        birthday : { type: String, default: '1994-01-01' },
        gender: { type: String, enum: ["male", "female"]},
        photos: [{ type: String }],
        wingmen: [{type: Schema.Types.ObjectId, ref: 'User'}]
    },
    match_limits: [{
        ted: String,
        count: Schema.Types.Number,
        timestamp: Date
    }],
    discovery_settings: {
        age_lower: {type: Schema.Types.Number, default: 18},
        age_upper: {type: Schema.Types.Number, default: 100},
        distance: {type: Schema.Types.Number, default: 1},
        seeking: {type: String, enum: ["male", "female", "both"], default: "male"}
    },
    location: {
        type: {type: String, default: 'Point'},
        coordinates: {type: [Number]}
    }
});

userSchema.index({location: '2dsphere'});

// Adds in the ability to query for a random profile
userSchema.plugin(random, {path: 'r'});

userSchema.virtual("profile.age").get(function() {
    return Math.floor((Date.now() - Date.parse(this.profile.birthday)) / 31556952000);
});

userSchema.set('toJSON', { getters: true, virtuals: true });
userSchema.set('toObject', { getters: true, virtuals: true });

var User = mongoose.model('User', userSchema);

module.exports = User;