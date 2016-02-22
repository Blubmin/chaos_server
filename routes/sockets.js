/**
 * Created by matthewaustin on 2/21/16.
 */

var io = require('../socketServer');


var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
    var message = req.body.message;
    var room = req.body.room;
    console.log(req.body.message + " " + req.body.room);
    io.to(room).emit("message", {message : message, userID: "-1"});
    res.send("Message sent");
});


module.exports = router;
