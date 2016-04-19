/**
 * Created by matthewaustin on 2/22/16.
 */


var express = require("express"),
    router = express.Router()
    Conversation = require("../../models/conversation");
;

router.route('/')
    .get(function(req, res, next) {
        Conversation.find({}, function(err, convos) {
            return res.json(convos);
        })
    })
    .post(function(req, res, next) {
        var conversation = new Conversation({
            participants : [req.body.part1, req.body.part2]
        });
        conversation.save(function(err) {
            console.log("done");
            res.json(conversation);
        })
    })

router.route("/deleteAllMessages")
    .get(function(req, res) {
        Conversation.remove({}, function(err) {
            res.send("Done");
        })
    })

router.route("/:id/messages")
    .get(function(req, res, next) {
        Conversation.getMessagesByConvoID(req.params.id, function(err, messages) {
            if(err) return res.send(err);
            return res.json(messages);
        })
    })
    .post(function(req, res, next) {
        var message = req.body.message;
        var userID = req.body.userID;
        Conversation.findOne({"_id" : req.params.id}, function(err, convo) {
            convo.addMessage(message, userID, function(err2, theMessage) {
                if(err2) return res.send(err2);
                return res.json(theMessage);
            })
        })

    })

router.route("/:userID")
    .get(function(req, res, next) {
        Conversation.getConversationByUser(req.params.userID, function(err, convos) {
            if(err) return res.send(err);
            return res.json(convos);
        })
    })


module.exports = router;