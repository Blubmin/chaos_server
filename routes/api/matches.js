/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var Match = require(root("models/match")),
    User = require(root("models/user")),
    Conversation  = require(root("models/conversation"));

router.route("/")
    .get(function(req, res, next) {
        console.log("retrieving matches...");
        Match.find().exec(function(err, matches) {
            if(err) return res.send(err);
            return res.json(matches);
        });
    });


// Gets a random unmatched user
router.route("/:ted/:barney")
    .get(function(req, res, next) {
        Match.find({ ted: req.params.ted, barney: req.params.barney }).exec(function(err, matches) {
            if(err) return res.send(err);

            var robins = [];
            matches.forEach(function(match) {
                robins.push(match.robin);
            });
            robins.push(req.params.barney);
            robins.push(req.params.ted);

            User.findRandom({ _id : { $nin : robins}}, {}, {limit : 1}).exec(function(err, unmatchedUser) {
                if (err) return res.send(err);
                res.json(unmatchedUser[0]);
            });
        });
    })
    .delete(function(req, res, next) {
        Match.find({ ted: req.params.ted, barney: req.params.barney }).remove(function(err){
            if (err) return res.send(err);
            return res.json();
        })
    });


// Function for starting conversation(s) (right now it's just making all of them)
function startConversation(match, res)
{
    Match.find({ robin: match.ted, ted: match.robin, preference: true }).exec(function(err, matches) {
        if(matches == null || matches.length == 0) {
            return res.json(null);
        }
        matches.forEach(function(temp) {
            Conversation.findOne({ participants: {$all : [ temp.barney, match.barney ]}}).exec(function(err, conversation) {
                if (err) return res.send(err);
                if (!conversation)
                {
                    Conversation.create({
                        participants: [ match.barney, temp.barney ],
                    }, function(err, conversation) {
                        if (err) return res.send(err);
                        return res.json({
                            "result" : 1,
                            "match" : match,
                            "conversation" : conversation
                        });
                    });
                } else {
                    return res.json({
                        "result" : 2,
                        "match" : match,
                        "conversation" : conversation
                    });
                }
            });
        });
    });
}

router.route("/deleteAll")
    .get(function(req, res) {
        Match.remove({}, function(err) {
            res.send("Done");
        })
    })

router.route("/:ted/:barney/:robin")
    .post(function(req, res, next) {
        Match.findOne({ ted : req.params.ted, barney : req.params.barney, robin: req.params.robin }).exec(function(err, match) {
            if(err) return res.send(err);
            if(match)
            {
                match.preference = req.body.preference;
                match.save(function(err) {
                    if (err) return ses.send(err);
                });

                User.findOne({_id : req.params.userID}).exec(function(err, user) {
                    if (err) return res.send(err);

                    user.profile.matches.push(match);
                    user.save(function(err) {
                        if (err) return res.send(err);
                    });

                    if (match.preference1 && match.preference2) {

                        Conversation.findOne({participants : {$all : userIds}}).exec(function(err, conversation) {
                            if (err) return res.send(err);

                            if (!conversation) {
                                Conversation.create({
                                    participants: userIds
                                });
                            }
                        });
                    }

                    return res.json(match);
                });
            }

            Match.create({
                ted: req.params.ted,
                barney: req.params.barney,
                robin: req.params.robin,
                preference: req.body.preference
            }, function(err, match) {
                if (err) return res.send(err);
                console.log(match);
                if(match.preference) {
                    startConversation(match, res);
                } else {
                    return res.json({
                        "result" : 0,
                        "match" : match
                    });
                }
            });
        });
    });

module.exports = router;