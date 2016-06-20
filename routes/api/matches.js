/**
 * Created by imeeder on 2/9/16.
 */
var express = require("express"),
    router = express.Router(),
    root = require("root-path");

var Match = require(root("models/match")),
    User = require(root("models/user")),
    Conversation  = require(root("models/conversation"));

var notifications = require("./notifications");
var geodist = require("geodist");

var config = require('config');

var daily_match_limit = config.get("dailyMatchLimit");

router.route("/")
    .get(function(req, res, next) {
        console.log("retrieving matches...");
        Match.find().exec(function(err, matches) {
            if(err) return res.send(err);
            return res.json(matches);
        });
    });


router.route("/testing")
    .get(function(req, res) {
        User.aggregate([
            {
                $match : {
                    'profile.gender' : {
                        $in : ["male"]
                    },
                    "discovery_settings.public_profile" : true
                }
            },{
                $sample : {size : 5}
            }]).exec(function(err, users) {
            if(err) return res.send(err);
            return res.json(users);
        })
    })

// Gets a random unmatched user
router.route("/:ted/:barney")
    .post(function(req, res, next) {
        Match.find({ ted: req.params.ted, barney: req.params.barney }).exec(function(err, matches) {
            if(err) return res.send(err);

            var robins = [];
            matches.forEach(function(match) {
                robins.push(match.robin);
            });
            robins.push(req.params.barney);
            robins.push(req.params.ted);

            var limit = req.body.limit ? parseInt(req.body.limit) : 1;
            var exclude = req.body.exclude ? req.body.exclude :
                req.body["exclude[]"] ? req.body["exclude[]"] : [];

            requestMatches(req.params.ted, req.params.barney, limit, function(limit) {
                if (limit == -1) return res.send("Error: getting match limit");
                if (limit == 0) return res.json([]);
                User.findOne({_id: req.params.ted}).exec(function(err, ted_user) {
                    if (err) return res.send(err);

                    var seeking = ted_user.discovery_settings.seeking == "both" ? ["male", "female"]
                        : [ted_user.discovery_settings.seeking];

                    var query = {
                        $and: [
                            {_id : { $nin : robins }},
                            {_id : { $nin : exclude }},
                        ],
                        'profile.gender' : {
                            $in : seeking
                        },
                        "discovery_settings.public_profile" : true
                        //,
                        //$nearSphere: {
                        //    $geometry: ted_user.discovery_settings.location,
                        //    $maxDistance: ted_user.discovery_settings.distance * 1600 // miles to meters
                        //}
                    };
                    //User.findRandom(query, {}, {limit : limit}).exec(function(err, unmatchedUsers) {
                    //    if (err) return res.send(err);
                    //    return res.json(unmatchedUsers);
                    //});
                    User.aggregate([{
                        $geoNear : {
                            spherical : true,
                            near : {type : "Point" , coordinates : ted_user.location.coordinates},
                            maxDistance : 8000,
                            distanceField : "calcLocation"
                            //includeLocs: "location"
                        }
                    },{
                        $match: query
                    }, {
                        $sample : {size : limit}
                    }]).exec(function(err, unmatchedUsers) {
                        if(err) return res.send(err);
                        return res.json(unmatchedUsers);
                    });
                });
            });
        });
    })
    .delete(function(req, res, next) {
        Match.find({ ted: req.params.ted, barney: req.params.barney }).remove(function(err){
            if (err) return res.send(err);
            return res.json();
        })
    });

function discovery_match(ted_user) {
    console.log(ted_user);
    var dist = geodist(ted_user.discovery_settings.location, this.discovery_settings.location);
    var seeking = this.discovery_settings.seeking == "both" ? ["male", "female"]
        : [this.discovery_settings.seeking];

    return ted_user.profile.age <= this.discovery_settings.age_upper
        && ted_user.profile.age >= this.discovery_settings.age_lower
        && seeking.indexOf(ted_user.profile.gender) != -1
        && ted_user.discovery_settings.distance >= dist
        && this.discovery_settings.distance >= dist;
}

// Function for starting conversation(s) (right now it's just making all of them)
function startConversation(match, res)
{
    Match.find({ robin: match.ted, ted: match.robin, preference: true }).exec(function(err, matches) {
        if(matches == null || matches.length == 0) {
            return res.json(null);
        }
        matches.forEach(function(temp) {

            Conversation.findOne({ participants: {$all : [ temp.barney, match.barney ]}}).exec(function(err, conversation) {
                if (err) return res.send(err);
                if (!conversation)
                {
                    Conversation.create({
                        robins : [{
                            barney : temp.barney,
                            robin : temp.robin
                        }, {
                            barney : match.barney,
                            robin : match.robin
                        }],
                        participants: [ match.barney, temp.barney ],
                        unread : [
                            {
                                user : match.barney,
                                unread : false
                            },
                            {
                                user : temp.barney,
                                unread : false
                            }
                        ]
                    }, function(err, conversation) {
                        if (err) return res.send(err);

                        // Sends a notification to the person who didn't just swipe
                        User.findOne({_id: temp.ted}).exec(function(err, ted) {
                            if (err) console.log(err);
                            User.findOne({_id: temp.barney}).exec(function(err, barney) {
                                if (err) conosle.log(err);
                                notifications.send(barney.profile.first_name + " just got a match for you!", ted.gcmId, function(err, res) {
                                    console.log("Notification send to: " + ted._id);
                                });
                                notifications.sendMatchNotification(ted.profile.first_name, conversation._id, barney.gcmId, function(err, res) {
                                    console.log("Notification send to: " + barney._id);
                                });
                            });
                        });

                        User.findOne({_id : match.ted}, function(err, ted) {
                            User.findOne({_id : match.barney}, function(err2, barney) {
                                notifications.send(barney.profile.first_name + " just got a match for you!", ted.gcmId, function(err, res) {
                                    console.log("Notification send to: " + ted._id);
                                });
                            })
                        })

                        return res.json({
                            "result" : 1,
                            "match" : match,
                            "conversation" : conversation
                        });
                    });
                } else {
                    return res.json({
                        "result" : 2,
                        "match" : match,
                        "conversation" : conversation
                    });
                }
            });
        });
    });
}

function requestMatches(ted, barney, count, cb)
{
    User.findOne({_id: barney}).exec(function(err, user) {
        if (err) {cb(-1); return;}

        var temp = null;
        var idx = null;

        user.match_limits.forEach(function(limit, index) {
            if (limit.ted != ted)
                return; //continue

            temp = limit;
            idx = index;
        });

        if (temp == null)
        {
            var new_match_limit = {
                ted: ted,
                count: daily_match_limit - count,
                timestamp: Date()
            };

            user.match_limits.push(new_match_limit);
            user.save(function(err) {
                if (err) {cb(-1); return;}
            });
            cb(Math.min(daily_match_limit, count));
            return;
        }

        var timestamp = temp.timestamp;
        timestamp.setHours(0, 0, 0, 0);

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        if (timestamp.getTime() == today.getTime())
        {
            var return_count = Math.max(Math.min(temp.count, count), 0);

            user.match_limits[idx].count -= count;
            user.save(function(err) {
                if (err) {cb(-1); return;}
            });

            cb(return_count);
            return;
        }
        else
        {
            user.match_limits[idx].timestamp = Date.now();
            user.match_limits[idx].count = daily_match_limit - count;

            user.save(function(err) {
                if (err) {cb(-1); return;}
            });
            cb(Math.min(count, daily_match_limit));
            return;
        }
    });
}

router.route("/:ted/:barney/:robin")
    .post(function(req, res, next) {
        Match.findOne({ ted : req.params.ted, barney : req.params.barney, robin: req.params.robin }).exec(function(err, match) {
            if(err) return res.send(err);
            if(match) // Shouldn't happen unless debugging
            {
                return res.json({
                    "result" : 2,
                    "match" : match
                });
            }

            Match.create({
                ted: req.params.ted,
                barney: req.params.barney,
                robin: req.params.robin,
                preference: req.body.preference
            }, function(err, match) {
                if (err) return res.send(err);
                if(match.preference) {
                    startConversation(match, res);
                } else {
                    return res.json({
                        "result" : 0,
                        "match" : match
                    });
                }
            });
        });
    });

module.exports = router;