/**
 * Created by imeeder on 4/20/16.
 */

var config = require('config'),
    gcm = require('node-gcm'),
    gcmKey = config.get("gcmKey"),
    ajax = require("ajax-request");

exports.sendApproveWingmanNotification = function(ted, ted_id, to, cb) {
    var message = ted + " accepted your wingman request!";
    this.send(message, to, true, 1, {type: 'wingman_accept', ted_id: ted_id}, function(err, res) {
        cb(err, res);
    });
}

exports.sendWingmanRequestNotification = function(barney, barney_id, to, cb) {
    var message = barney + " wants to be your wingman!";
    this.send(message, to, true, 1, {type: 'wingman_request', wingman_id: barney_id}, function(err, res) {
        cb(err, res);
    });
}

exports.sendMatchNotification = function(ted_name, conversation_id, to, cb) {
    var message = ted_name + " has a new match!";
    this.send(message, to, true, 1, {type: 'match', conversation_id: conversation_id}, function(err, res) {
        cb(err, res);
    })
}

exports.send = function(message, to, hasSound, badge, payload, cb) {
    var headers = {
        Authorization: "key=" + gcmKey,
        "Content-Type": "application/json"
    };

    var notification = {
        body: message,
        sound: hasSound ? 'default' : '',
        badge: badge
    };

    var data = {
        to: to,
        content_available: true,
        notification: notification,
        data: payload
    };

    var url = "https://android.googleapis.com/gcm/send";

    ajax.post({
        url: url,
        headers: headers,
        data: data
    }, cb);
};