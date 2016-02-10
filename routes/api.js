var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
//mongoose.connect('mongodb://chaos:chaosapp@/opt/bitnami/mongodb/tmp/mongodb-27017.sock:27017/chaosdb');
mongoose.connect('mongodb://localhost:27017/chaosdb');
var User = require("../models/user");
var Profile = require("../models/profile");

/* GET home page. */
router.route("/users")
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
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            gender : req.body.gender,
            email : req.body.email
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

router.route("/users/:id")
    .get(function(req, res, next) {
        User.findOne({facebook_id : req.params.id}, function(err, user) {
            if(err) return res.send(err);
            return res.json(user)
        })
})
router.route("/users/auth")
    .post(function(req, res, next) {
        User.find({username : req.body.username, password : req.body.password}, function(err, users) {
            if(err) return res.send(err);
            if(users.length == 1) {
                res.json({result : 1});
            } else {
                res.json({result : 0});
            }
        })
    })

router.route("/profiles")
    .get(function(req, res, next) {
        console.log("retrieving profiles...");
        Profile.find({}).populate("user").exec(function(err, profiles) {
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

module.exports = router;
