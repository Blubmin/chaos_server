/**
 * Created by matthewaustin on 2/22/16.
 */

var mongoose = require('mongoose'),
    random = require('mongoose-random')
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var conversationSchema = new Schema({
    robins : [{
        barney : { type: Schema.Types.ObjectId, ref: 'User' },
        robin : { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    participants:  [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages : [{
        user : { type: Schema.Types.ObjectId, ref: 'User' },
        message : String,
        time : {type: Date, default : Date.now()}
    }],
    last_updated : {type : Date, default : Date.now()}
});

conversationSchema.statics.getConversationByUser = function(userID, cb) {
    return this.find({}).select({participants : 1, last_updated : 1, robins : 1, messages : {"$slice" : -1}})
        .where("participants").in([userID]).sort({last_updated : 1})
        .populate("participants", "profile.first_name profile.photos")
        .populate("robins.robin", "profile.first_name profile.photos")
        .exec(function(err, convos) {
            return cb(err, convos);
    });
}

conversationSchema.statics.getMessagesByConvoID = function(convoID, cb) {
    return this.findOne({"_id" : convoID}).populate("messages.user", "profile.first_name profile.last_name profile.photos").select("messages").sort({time : 1}).exec(cb);
}

conversationSchema.methods.addMessage = function(message, userID, cb) {
    this.messages.push({
        user : userID,
        message : message
    });
    this.save(function(err, convo) {
        return cb(convo.messages[convo.messages.length - 1])
    });
}

//conversationSchema.methods.getRobin = function(userID) {
//    for(var i = 0; i < this.robins.length; i++) {
//        if(this.robins[i].barney.equals(userID)) {
//            return this.robins[i].robin;
//        }
//    }
//}


var Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
