/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var Match = require(root("models/match")),
    Profile = require(root("models/profile"));

router.route("/")
    .get(function(req, res, next) {
        console.log("retrieving matches...");
        Match.find().exec(function(err, matches) {
            if(err) return res.send(err);
            return res.json(matches);
        });
    });

// TODO: Somewhere in here is where you let both parties know that there's a valid match
router.route("/addMatchPreference")
    .post(function(req, res, next) {

        var userIds = [req.body.profile1, req.body.profile2];

        Match.findOne({ profile1 : { $in : userIds }, profile2 : { $in : userIds }}).exec(function(err, match){
            if(err) return res.send(err);

            if(match) {
                if (match.profile1 == req.body.profile1)
                    match.preference1 = req.body.preference;
                else
                    match.preference2 = req.body.preference;
                match.save();

                Profile.findOne({_id : req.body.profile1}).exec(function(err, profile) {
                    if (err) return res.send(err);

                    profile.matches.push(match);
                    profile.save();

                    return res.json(match);
                });
            }
            else {
                Match.create({
                    profile1: req.body.profile1,
                    profile2: req.body.profile2,
                    preference1: req.body.preference
                }, function(err, match) {
                    if(err) return res.send(err);

                    Profile.findOne({_id : req.body.profile1}).exec(function(err, profile) {
                        if (err) return res.send(err);

                        profile.matches.push(match);
                        profile.save();

                        return res.json(match);
                    });
                });
            }
        });
    });

module.exports = router;