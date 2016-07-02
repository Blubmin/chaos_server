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

wingmanSchema.statics.getWingmen = function(tedId, cb) {
    return this.find({ted : tedId, status: "Accepted"}).select("barney").populate("barney").exec(function(err, wingmen) {
        return cb(err, wingmen);
    })
}

wingmanSchema.statics.getWingmaningFor = function(userID, cb) {
    return this.find({barney : userID, status: "Accepted"}).select("ted").populate("ted").exec(function(err, wingmen) {
        var wingmanArray = []
        wingmen.forEach(function(wingman) {
            wingmanArray.push(wingman.ted);
        })
        return cb(err, wingmanArray);
    })
}

wingmanSchema.statics.getPending = function(tedId, cb) {
    return this.find({ted : tedId, status: "Pending"}).populate("barney").select("barney").exec(function(err, wingmen) {
        return cb(err, wingmen);
    })
}

wingmanSchema.statics.getRequested = function(userID, cb) { //requests i've made
    return this.find({barney : userID, status: "Pending"}).populate("ted").select("ted").exec(function(err, wingmen) {
        return cb(err, wingmen);
    })
}

wingmanSchema.statics.acceptPending = function(userID, tedID, cb) {
    return this.findOne({ted : tedID, barney : userID, status: "Pending"}).exec(function(err, wingman) {
        wingman.status = "Accepted";
        return wingman.save(cb);
    })
}

wingmanSchema.methods.accept = function(cb) {
    this.status = "Accepted";
    this.save(cb);
}

wingmanSchema.statics.request = function(userID, tedID, cb) {
    var newWingman = new Wingman();
    newWingman.ted = tedID;
    newWingman.barney = userID;
    newWingman.status = "Pending";
    return newWingman.save(cb);
}




wingmanSchema.statics.removeWingman = function(userID, barneyID, cb) {
    return this.findOneAndRemove({ted: userID, barney: barneyID}, cb);
}

var Wingman = mongoose.model('Wingman', wingmanSchema);

module.exports = Wingman;