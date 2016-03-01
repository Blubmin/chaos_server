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
    .put(function(req, res, next) {
        console.log(req);
        User.findOne({facebook_id : req.params.id}, function(err, user) {
            if (err) return res.send(err);
            if (!user) return res.json(user);

            if (req.body.email)
                user.email = req.body.email;
            if (req.body.profile) {
                if (req.body.profile.first_name)
                    user.profile.first_name = req.body.profile.first_name;
                if (req.body.profile.last_name)
                    user.profile.last_name = req.body.profile.last_name;
                if (req.body.profile.age)
                    user.profile.age = req.body.profile.age;
                if (req.body.profile.description)
                    user.profile.description = req.body.profile.description;
                if (req.body.profile.gender)
                    user.profile.gender = req.body.profile.gender;
                if (req.body.profile.photos)
                    user.profile.photos = req.body.profile.photos;
            }

            user.save();

            return res.json(user);
        });
    });

router.route("/:id/photos")
    .post(function(req, res, next) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.send(err);
            user.profile.photos.push(req.body.photo);
            user.save();
            return res.json(user);
        })
    });

// for testing, mainly
router.route("/:id/matches")
    .delete(function(req, res, next) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.send(err);

            user.profile.matches = [];
            user.save();

            return res.json(user);
        })
    });

module.exports = router;