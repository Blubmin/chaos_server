/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var User = require(root("models/user"));

/* GET home page. */
router.route("/")
    .get(function(req, res, next) {
        console.log("HEY");
        User.find({}, function(err, users) {
            if(err) return res.send(err);
            res.json(users);
        })
    })
    .post(function(req, res, next) {
        User.create({
            facebook_id : req.body.facebook_id,
            email: req.body.email,
            profile : req.body.profile
        }, function (err, user) {
            if(err) return res.send(err);
            return res.json(user);
        })
    })
    .delete(function(req, res, next) {
        User.remove({_id : req.body.id}, function(err) {
            if(err) return res.send(err);
            res.send("Removed");
        })
    });

router.route("/:id")
    .get(function(req, res, next) {
        User.findOne({facebook_id : req.params.id}, function(err, user) {
            if(err) return res.send(err);
            return res.json(user)
        })
    })

// for testing, mainly
router.route("/:id/clearMatches")
    .post(function(req, res, next) {
        Profile.findById(req.body.id, function(err, profile) {
            if (err) return res.send(err);

            profile.matches = [];
            profile.save();

            return res.json(profile);
        })
    });

module.exports = router;