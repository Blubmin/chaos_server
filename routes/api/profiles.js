/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path"),
    mongooseRandom = require("mongoose-random");

var User = require(root("/models/user")),
    Profile = require(root("models/profile")),
    Match = require(root("models/match"));

router.route("/")
    .get(function(req, res, next) {
        console.log("retrieving profiles...");
        console.log(req.query);
        Profile.find(req.query).exec(function(err, profiles) {
            if(err) return res.send(err);
            res.json(profiles);
        })
    })
    .post(function(req, res, next) {
        Profile.create({
                name : req.body.name,
                description : req.body.description,
                user: req.body.user,
                gender: req.body.gender,
                age: req.body.age,
            },
            function (err, profile) {
                if(err) return res.send(err);
                res.json(profile);
        })
    })
    .delete(function(req, res, next) {
        Profile.remove({_id : req.body.id}, function(err) {
            if(err) return res.send(err);
            res.send("Removed");
        })
    });

router.route("/getAvailableProfile")
    .post(function(req, res) {
        User.findOne({facebook_id: req.body.facebook_id} , function(err, user) {
            if(err) return res.send(err);

            Profile.findOne({user: user._id}).populate("matches").exec(function(err, profile) {
                if(err) return res.send(err);

                var matchArray = [];

                profile.matches.forEach(function(match) {
                    if (matchArray.indexOf(match.alpha_profile) != -1)
                        matchArray.push(match.alpha_profile);
                    if (matchArray.indexOf(match.omega_profile) != -1)
                        matchArray.push(match.omega_profile);
                });

                if(matchArray.indexOf(profile._id) == -1)
                    matchArray.push(profile._id);

                Profile.findRandom({ _id : { $nin : matchArray}}, {}, {limit : 1}).exec(function(err, availableProfile) {
                    if (err) return res.send(err);
                    res.json(availableProfile[0]);
                });
            });
        });
    });

// for testing, mainly
router.route("/clearMatches")
    .post(function(req, res, next) {
        Profile.findById(req.body.profile, function(err, profile) {
            if (err) return res.send(err);

            profile.matches = [];
            profile.save();

            return res.json(profile);
        })
    });

module.exports = router;