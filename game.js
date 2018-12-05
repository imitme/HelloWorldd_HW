const uuidv4 = require('uuid/v4');

module.exports = function(server){
    var io = require('socket.io')(server, {
    transports: ['websocket'],
    });
    
    //방정보
    var rooms = [];
  
    io.on('connect', function(socket){ 
        console.log('Connection: ' + socket.id);

        if (rooms.length > 0){  
            var rID = rooms.shift();
            socket.join(rID, function(){
                console.log("JoinRoom: " + rID);
                socket.emit('joinRoom', {room: rID});
            });
        }else{
            var roomName = uuidv4();
            socket.join(roomName, function(){
                console.log("CreateRoom: " + roomName);
                socket.emit('createRoom', {room: roomName});
                rooms.push(roomName); 
            });
        }





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

