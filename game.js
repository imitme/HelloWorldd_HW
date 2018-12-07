const uuidv4 = require('uuid/v4');

module.exports = function(server){
    var io = require('socket.io')(server, {
    transports: ['websocket'],
    });
    
    //방정보
    var rooms = [];
  
    io.on('connect', function(socket){ 
        console.log('Connected: ' + socket.id);


        if (rooms.length > 0){  
            var rID = rooms.shift();
            socket.join(rID, function(){
                console.log("JoinRoom: " + rID);
                socket.emit('joinRoom', {room: rID});
                //자신 제외 특정방에  ?    socket.broadcast.to(room).emit('exitRoom'); 
                //자신 포함 특정방에  ?    io.to(rID).emit('startGame');
                io.to(rID).emit('startGame');
            });
        }else{
            var roomName = uuidv4();
            socket.join(roomName, function() {
                console.log('CreateRoom: ' + roomName);
                socket.emit('createRoom', {room: roomName});
                rooms.push(roomName); 
            });
        }



        socket.on('disconnecting', function(reson ){
            console.log('Disconnected: '+socket.id);
            var socketRooms = Object.keys(socket.rooms).filter( item=> item != socket.id );
            console.dir(socketRooms);

            socketRooms.forEach(function(room){
                socket.broadcast.to(room).emit('exitRoom');  

                //혼자 있는 방의 유저가 disconnect 되면 해당 방 제거
                var idx = rooms.indexOf(room);
                if(idx != -1){
                    rooms.splice(idx, 1);
                }
            });
            
        });


        socket.on('hi',function() {
            console.log('Hi~~');
            socket.emit('hello');   //요청 소켓에게
            io.emit('everybody');   //모든 소켓에게
            socket.Broadcast.emit('s');    //요청소켓 제외 모든 소켓에게
        });

        socket.on('message', function(msg){
            console.dir(msg);
            socket.broadcast.emit('chat', msg);
        });


        socket.on('doPlayer', function(playerInfo){
            //방이름을 전달하도록 //socket.broadcast.to(room).emit('exitRoom'); 
            var roomID = playerInfo.room;
            var cellIndex = playerInfo.position;
            socket.broadcast.to(roomID).emit('doOpponent', 
            {position : cellIndex});
        });

    });
};

