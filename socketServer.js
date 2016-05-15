/**
 * Created by matthewaustin on 2/21/16.
 */

var io = require('socket.io')();

io.on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    console.log("CONNECTION");
    socket.on("message", function(data, fn) {
        io.to(data.room).emit("message", data)
        fn();
        console.log("message " , data);

    })

    socket.on("join room", function(data) {
        console.log("Joined roomed");
        socket.join(data.room);
    })

    socket.on('start-typing', function (data, fn) {
        io.to(data.room).emit("start-typing", {user : data.user, typing: data.typing});
        console.log(data);

    });
});

module.exports = io;

