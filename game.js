module.exports = function(server){
    var io = require('socket.io')(server, {
    transports: ['websocket'],
    });
  
    io.on('connect', function(socket){ 
        console.log('Connection: ' + socket.id);

        socket.on('disconnect', function(reson ){
            console.log('Disconnected: '+socket.id);
        });

        socket.on('hi',function() {
            console.log('Hi~~');
            socket.emit('hello');   //요청 소켓에게
            io.emit('everybody');   //모든 소켓에게
            socket.Broadcast.emit('s');    //요청소켓 제외 모든 소켓에게
        });

        socket.on('message', function(msg){
            console.dir(msg);
            socket.broadcast.emit('chat',msg);
        });


    });
};

