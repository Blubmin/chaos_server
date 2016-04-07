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
        Match.find({ ted: req.params.ted, barney: req.params.barney }).exec(function(err, matches) {
            if (err) return res.send(err);
            matches.remove();
            return;
        });
    });


// Function for starting conversation(s) (right now it's just making all of them)
function startConversation(match)
{
    Match.find({ ted: match.robin, robin: match.robin, preference: true }).exec(function(err, matches) {
        matches.forEach(function(temp) {
            Conversation.findOne({ participants: {$all : [ temp.barney, match.barney ]}}).exec(function(err, conversation) {
                if (err) return res.send(err);
                if (!conversation)
                {
                    Conversation.create({
                        participants: [ temp.barney, match.barney ]
                    }, function(err, conversation) {
                        if (err) return res.send(err);
                    });
                }
            });
        });
    });
}

router.route("/:ted/:barney/:robin")
    .post(function(req, res, next) {
        Match.findOne({ ted : req.params.ted, barney : req.params.barney, robin: req.params.robin }).exec(function(err, match) {
            if(err) return res.send(err);
            if(match)
            {
                match.preference = req.body.preference;
                match.save();
                if (match.preference)
                    startConversation(match);
                return res.json(match);
            }

            Match.create({
                ted: req.params.ted,
                barney: req.params.barney,
                robin: req.params.robin,
                preference: req.body.preference
            }, function(err, match) {
                if (err) return res.send(err);
                if(match.preference)
                    startConversation(match);
                return res.json(match);
            });
        });
    });

module.exports = router;