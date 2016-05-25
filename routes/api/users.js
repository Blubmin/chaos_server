/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var User = require(root("models/user"));
var notifications = require("./notifications");

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
            profile : req.body.profile,
            birthday : req.body.birthday,
            'discovery_settings.age_upper' : req.body.discovery_settings.age_upper,
            'discovery_settings.age_lower' : req.body.discovery_settings.age_lower,
            'discovery_settings.distance' : req.body.discovery_settings.distance,
            'location.coordinates' : [parseFloat(req.body.discovery_settings.longitude),parseFloat(req.body.discovery_settings.latitude)],
            'discovery_settings.seeking' : req.body.profile.gender == "male" ? "female" : "male"
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

router.route("/id/:id")
    .get(function(req, res) {
        User.findOne({"_id" : req.params.id}, function(err, user) {
            if(err) return res.send(err);
            return res.json(user);
        })
    })

router.route("/id/:id/profilePic")
    .get(function(req, res) {
        User.findOne({"_id" : req.params.id}, function(err, user) {
            return res.json({"url" : user.getProfPic()});
        })
    })



router.route("/:id")
    .get(function(req, res, next) {
        User.findOne({facebook_id : req.params.id}, function(err, user) {
            if(err) return res.send(err);
            return res.json(user);
        })
    })
    .put(function(req, res, next) {
        console.log(req.body);
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
            if (req.body.match_limits)
                user.match_limits = req.body.match_limits;
            if (req.body.discovery_settings)
            {
                user.discovery_settings.age_upper = req.body.discovery_settings.age_upper;
                user.discovery_settings.age_lower = req.body.discovery_settings.age_lower;
                user.discovery_settings.distance = req.body.discovery_settings.distance;
                user.location.coordinates = [parseFloat(req.body.discovery_settings.longitude),parseFloat(req.body.discovery_settings.latitude)];
                user.discovery_settings.seeking = req.body.discovery_settings.seeking;
                user.discovery_settings.public_profile = req.body.discovery_settings.public_profile;
            }

            user.save(function(err) {
                if (err) return res.send(err);
                return res.json(user);
            });
        });
    });

router.route("/:id/photos")
    .post(function(req, res, next) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.send(err);
            user.profile.photos.push(req.body.photo);
            user.save(function(err) {
                if (err) return res.send(err);
                return res.json(user);
            });
        })
    })
    .delete(function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.send(err);
            user.profile.photos.splice(user.profile.photos.indexOf(req.body.photo), 1);
            user.save(function(err) {
                if (err) return res.send(err);
                return res.json(user);
            });
        })
    });

router.route("/:id/photos/:index")
    .post(function(req, res, next) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.send(err);
            if(req.params.index >= user.profile.photos.length) {
                user.profile.photos.push(req.body.photo)
            } else {
                user.profile.photos[req.params.index] = req.body.photo;
            }
            user.save(function(err) {
                if (err) return res.send(err);
                return res.json(user);
            });
        })
    })
    .delete(function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.send(err);
            if(req.params.index >= user.profile.photos.length) {
                return res.json(user);
            }
            user.profile.photos.splice(req.params.index, 1);
            user.save(function(err) {
                if (err) return res.send(err);
                return res.json(user);
            });
        })
    });

// for testing, mainly
router.route("/:id/matches")
    .delete(function(req, res, next) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.send(err);

            user.profile.matches = [];
            user.save(function(err) {
                if (err) return res.send(err);
                return res.json(user);
            });
        })
    });

router.route("/:id/gcmId")
    .put(function(req, res, next) {
        User.findById(req.params.id, function(err, user) {
            if (err) return res.status(400).send(err);
            if (!user) return res.status(400).send("No user found.");
            user.gcmId = req.body.gcmId;
            user.save(function(err) {
                if (err) return res.status(400).send(err);
                return res.json(user);
            });
        });
    });

router.route("/friends")
    .post(function(req, res) {
        User.find({
            facebook_id : {
                $in : req.body.facebookIds
            }
        }, function(err, users) {
            res.json(users);
        })
    })

module.exports = router;