var express = require("express"),
    router = express.Router(),
    Wingman = require("../../models/wingman");
;

router.route("/:id")
    .get(function(req, res) {
        Wingman.getWingmaningFor(req.params.id, function(err, wingmen) {
            if(err) return res.send(err);
            return res.json(wingmen);
        })
    })

router.route("/:id/accepted")
    .get(function(req, res) {
        Wingman.getWingmen(req.params.id, function(err, wingmen) {
            if(err) return res.send(err);
            return res.json(wingmen);
        })
    })

router.route("/:id/pending")
    .get(function(req, res) {
        Wingman.getPending(req.params.id, function(err, wingmen) {
            if(err) return res.send(err);
            return res.json(wingmen);
        })
    })

router.route("/:id/requested")
    .get(function(req, res) {
        Wingman.getRequested(req.params.id, function(err, wingmen) {
            if(err) return res.send(err);
            return res.json(wingmen);
        })
    })

router.route("/request")
    .post(function(req, res) {
        Wingman.request(req.body.barney, req.body.ted, function(err) {
            if(err) return res.send(err);
            return res.json({status: 1});
        })
    })

router.route("/accept/:id")
    .put(function(req, res) {
        Wingman.findOne({"_id" : req.params.id}, function(err, wingman) {
            if(err) return res.send(err);
            wingman.accept(function(err) {
                if(err) return res.send(err);
                return res.json({status : 1});
            });

        })
    })

router.route("/remove/:id")
    .put(function(req, res) {
        Wingman.findOne({"_id" : req.params.id}, function(err, wingman) {
            if(err) return res.send(err);
            wingman.remove(function(err) {
                if(err) return res.send(err);
                return res.json({status : 1});
            });

        })
    })

module.exports = router;