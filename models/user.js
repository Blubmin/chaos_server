/**
 * Created by matthewaustin on 1/26/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    facebook_id : String,
    first_name : String,
    last_name : String,
    gender : String,
    email : String
});

var User = mongoose.model('User', userSchema);

module.exports = User;