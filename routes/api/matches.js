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
router.route("/:userID")
    .get(function(req, res) {
        User.findOne({_id: req.params.userID}).populate("profile.matches").exec(function(err, user) {
            if(err) return res.send(err);
            if(!user) return res.json(user);

            var matchArray = [];

            user.profile.matches.forEach(function(match) {
                if (matchArray.indexOf(match.user1) == -1)
                    matchArray.push(match.user1);
                if (matchArray.indexOf(match.user2) == -1)
                    matchArray.push(match.user2);
            });

            if(matchArray.indexOf(user._id) == -1)
                matchArray.push(user._id);

            console.log(matchArray);

            User.findRandom({ _id : { $nin : matchArray}}, {}, {limit : 1}).exec(function(err, unmatchedUser) {
                if (err) return res.send(err);
                res.json(unmatchedUser[0]);
            });
        });
    });

// TODO: Somewhere in here is where you let both parties know that there's a valid match
router.route("/:userID/preference")
    .post(function(req, res, next) {
        var userIds = [req.params.userID, req.body.otherUserID];
        Match.findOne({ user1 : { $in : userIds }, user2 : { $in : userIds }}).exec(function(err, match){
            if(err) return res.send(err);

            if(match) {
                if (match.user1 == req.params.userID)
                    match.preference1 = req.body.preference;
                else
                    match.preference2 = req.body.preference;
                match.save();

                User.findOne({_id : req.params.userID}).exec(function(err, user) {
                    if (err) return res.send(err);

                    user.profile.matches.push(match);
                    user.save();

                    if (match.preference1 && match.preference2) {

                        Conversation.findOne({participants : {$in : userIds}}).exec(function(err, conversation) {
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
            else {
                Match.create({
                    user1: req.params.userID,
                    user2: req.body.otherUserID,
                    preference1: req.body.preference
                }, function(err, match) {
                    if(err) return res.send(err);

                    User.findOne({_id : req.params.userID}).exec(function(err, user) {
                        if (err) return res.send(err);

                        user.profile.matches.push(match);
                        user.save();

                        return res.json(match);
                    });
                });
            }
        });
    });

module.exports = router;