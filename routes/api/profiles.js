/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var Profile = require(root("models/profile")),
    Match = require(root("models/match"));

router.route("/")
    .get(function(req, res, next) {
        console.log("retrieving profiles...");
        console.log(req.query);
        Profile.find(req.query).populate("user").exec(function(err, profiles) {
            if(err) return res.send(err);
            res.json(profiles);
        })
    })
    .post(function(req, res, next) {
        Profile.create({name : req.body.name, description : req.body.description, user: req.body.user_id}, function (err, profile) {
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

router.route("/findAvailableProfile")
    .post(function(res, res) {

    });
module.exports = router;