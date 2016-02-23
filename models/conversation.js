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
    console.log("HERE");
    return this.find({}).select("participants last_updated").where("participants").in([userID]).sort({last_updated : 1}).populate("participants", "first_name").exec(cb);
}

var Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
