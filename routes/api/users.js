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

router.route("/:id")
    .get(function(req, res, next) {
        User.findOne({facebook_id : req.params.id}, function(err, user) {
            if(err) return res.send(err);
            return res.json(user)
        })
    })
router.route("/auth")
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

module.exports = router;