/**
 * Created by matthewaustin on 5/10/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var User = require(root("models/user"));
var notifications = require("./notifications");

router.route("/*")
    .all(function(req, res, next) {
        if(req.headers.key == "tedbarneyrobin") {
            next();
        } else {
            res.send("Error");
        }
    })

router.route("/")
    .post(function(req, res) {
        notifications.send(req.body.message, req.body.to, true, null, {},  function(data, status) {
            res.send("Sent: " + req.body.message);
        })
    })

router.route("/user/:id")
    .post(function(req, res) {
        User.findOne({"_id" : req.params.id}, function(err, user) {
            notifications.send(req.body.message, user.gcmId, true, null, {},  function(data, status) {
                res.send("Sent: " + req.body.message);
            })
        })
    })
module.exports = router;