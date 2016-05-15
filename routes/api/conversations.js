/**
 * Created by matthewaustin on 2/22/16.
 */


var express = require("express"),
    router = express.Router(),
    root = require("root-path"),
    Conversation = require("../../models/conversation");
;

var notifications = require("./notifications");

var User = require(root("models/user"));

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


router.route("/:id/read/:userID")
    .get(function(req, res) {
        Conversation.findOne({_id : req.params.id}, function(err, convo) {
            convo.unread.forEach(function(unreadObj) {
                if(unreadObj.user == req.params.userID) {
                    unreadObj.unread = false;
                }
            })
            convo.save(function(err) {
                res.send("Done");
            })

            //convo.markAsRead(req.params.userID, function(err) {
            //
            //    res.send("Done");
            //})
        })
    })

router.route("/:id/messages/update")
    .get(function(req, res) {
        Conversation.find({}, function(err, convos) {
            convos.forEach(function(convo) {
                convo.unread = [
                    {
                        user : convo.participants[0],
                        unread : false
                    },
                    {
                        user : convo.participants[1],
                        unread : false
                    }
                ]
                convo.save(function(err) {
                    res.send(err);
                })
            })
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
                var sendMessageToUserId = "";
                if(convo.participants[0] != userID) {
                    sendMessageToUserId = convo.participants[0];
                } else if(convo.participants[0] == userID) {
                    sendMessageToUserId = convo.participants[1];
                }
                User.findOne({"_id" : sendMessageToUserId}, function(err, user) {
                    notifications.send("You got a new message!", user.gcmId, true, 1, {type: 'message', conversation_id: req.params.id}, function() {

                    })
                })
                return res.json(theMessage);
            })
        })

    })

router.route("/:id/messages/:limit")
    .get(function(req, res) {
        Conversation.getMessagesByConvoIDLimit(req.params.id, req.params.limit, function(err, messages) {
            if(err) return res.send(err);
            return res.json(messages);
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