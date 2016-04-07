/**
 * Created by matthewaustin on 2/22/16.
 */

var mongoose = require('mongoose'),
    random = require('mongoose-random')
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var conversationSchema = new Schema({
    participants:  [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages : [{
        user : { type: Schema.Types.ObjectId, ref: 'User' },
        message : String,
        time : {type: Date, default : Date.now()}
    }],
    last_updated : {type : Date, default : Date.now()}
});

conversationSchema.statics.getConversationByUser = function(userID, cb) {
    return this.find({}).select({participants : 1, last_updated : 1, messages : {"$slice" : -1}}).where("participants").in([userID]).sort({last_updated : 1}).populate("participants", "profile.first_name profile.photos").exec(cb);
}

conversationSchema.statics.getMessagesByConvoID = function(convoID, cb) {
    return this.findOne({"_id" : convoID}).populate("messages.user", "profile.first_name profile.last_name profile.photos").select("messages").sort({time : 1}).exec(cb);
}

conversationSchema.methods.addMessage = function(message, userID, cb) {
    this.messages.push({
        user : userID,
        message : message
    });
    this.save(cb);
}

var Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
