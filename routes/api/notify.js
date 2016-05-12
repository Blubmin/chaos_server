/**
 * Created by matthewaustin on 5/10/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path"),
    config = require('config'),
    gcmKey = config.get("gcmKey"),
    ajax = require("ajax-request");

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

router.route("/topic")
    .post(function(req, res) {
        var headers = {
            Authorization: "key=" + gcmKey,
            "Content-Type": "application/json"
        };
        var url = "https://gcm-http.googleapis.com/gcm/send"

        //var url = "https://android.googleapis.com/gcm/send";

        ajax.post({
            url: url,
            headers: headers,
            data: {
                to: req.body.to,
                data : {
                    message: req.body.message
                }
            }
        }, function() {
            res.send("Sent: " + req.body.message);
        });
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