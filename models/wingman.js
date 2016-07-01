/**
 * Created by matthewaustin on 6/28/16.
 */

var mongoose = require('mongoose'),
    geodist = require('geodist');
var Schema = mongoose.Schema;

var wingmanSchema = new Schema({
    ted: { type: Schema.Types.ObjectId, ref: 'User'},
    barney: { type: Schema.Types.ObjectId, ref: 'User'},
    status: {type : String, enum: ["Pending", "Accepted", "Blocked"]}
});

userSchema.statics.getWingmen = function(tedId, cb) {
    return this.find({ted : tedId, status: "Accepted"}).select("barney").populate("barney").exec(function(err, wingmen) {
        return cb(err, wingmen);
    })
}

userSchema.statics.getWingmaningFor = function(userID, cb) {
    return this.find({barney : userID, status: "Accepted"}).select("ted").populate("ted").exec(function(err, wingmen) {
        return cb(err, wingmen);
    })
}

userSchema.statics.getRequested = function(tedId, cb) {
    return this.find({barney : tedId, status: "Pending"}).select("ted").populate("ted").exec(function(err, wingmen) {
        return cb(err, wingmen);
    })
}

userSchema.statics.acceptPending = function(userID, tedID, cb) {
    return this.findOne({ted : tedID, barney : userID, status: "Pending"}).exec(function(err, wingman) {
        wingman.status = "Accepted";
        return wingman.save(cb);
    })
}

userSchema.statics.removeWingman = function(userID, barneyID, cb) {
    return this.findOneAndRemove({ted: userID, barney: barneyID}, cb);
}

var Wingman = mongoose.model('Wingman', wingmanSchema);

module.exports = Wingman;