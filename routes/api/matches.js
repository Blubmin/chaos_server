/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var Match = require(root("models/match"));

router.route("/")
    .get(function(req, res, next) {
        console.log("retrieving matches...");
        Match.find().exec(function(err, matches) {
            if(err) return res.send(err);
            return res.json(matches);
        });
    });

module.exports = router;