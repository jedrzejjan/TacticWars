// node module includes
var uuid = require('node-uuid');

var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://henriquerf:password@ds219040.mlab.com:19040/advanced-wars";
var url = "mongodb://localhost:27017/advanced-wars"

MongoClient.connect(url, function(err, db) {
    var dbo = db.db("advanced-wars");
    dbo.collection("maps").findOne()
    .then(function(check){
        if(check == null){
          if (err) throw err;
          dbo.createCollection("games", function(err, res) {
              if (err) throw err;
              console.log("Games Collection created!");
          });
          dbo.createCollection("maps", function(err, res) {
              if (err) throw err;
              console.log("Maps Collection created!");
              var myobj = { troops: [["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""],
                                  ["","","","","","","","","","","","","","","","",""]],
                      map_terrain: [["M","M","M","F","F","F","F","F","F","G","G","W","G","G","G","G","G"],
                          ["M","FTb200","G","FTb200","R","G","G","G","G","G","G","W","Cb200","H200","Cb200","G","F"],
                          ["M","G","G","G","R","G","G","G","G","G","G","W","G","G","G","G","F"],
                          ["F","G","FTb200","G","R","G","G","G","G","G","G","R","G","G","G","G","G"],
                          ["F","G","G","G","R","G","G","G","G","G","G","W","G","G","G","G","G"],
                          ["F","G","G","G","R","G","C0","C0","G","G","G","W","G","G","G","G","G"],
                          ["F","G","G","G","R","R","R","R","R","G","G","W","G","G","G","G","G"],
                          ["F","G","G","C0","G","G","G","G","R","G","G","W","C0","C0","G","G","G"],
                          ["M","G","G","G","G","G","G","G","R","C0","G","W","G","C0","C0","C0","G"],
                          ["M","G","G","G","G","G","G","M","R","C0","C0","W","G","G","G","C0","G"],
                          ["M","G","M","G","G","M","M","M","R","G","G","W","G","G","G","C0","G"],
                          ["G","G","M","M","G","M","M","G","R","G","G","W","G","G","G","C0","G"],
                          ["G","G","M","M","F","G","G","G","R","G","G","W","C0","G","G","G","G"],
                          ["M","F","M","G","G","G","G","G","R","G","G","W","G","G","G","G","G"],
                          ["M","F","G","G","G","R","R","R","R","G","G","W","G","G","G","G","G"],
                          ["F","F","G","G","G","R","G","G","G","G","G","W","G","G","G","G","G"],
                          ["M","G","G","G","G","R","G","G","G","G","G","W","G","G","G","G","G"],
                          ["G","G","G","G","FTr200","R","G","G","G","G","G","W","G","G","G","G","G"],
                          ["G","G","G","G","G","R","G","G","G","G","G","W","G","G","G","G","G"],
                          ["G","G","FTr200","G","H200","R","FTr200","G","G","G","G","W","G","G","G","G","G"]]};

              dbo.collection("maps").insertOne(myobj, function(err, res) {
                  if (err) throw err;
                  console.log("inserted map obj");
              });
          });
        }
        else{
          console.log("Initial database prep is already done so no need to do it again");
        }
    });
});



// include our custom server configuration
var Server = require('./server.js');
var Room = require('./room.js');

// local variables
var rooms = {};
var clients = {};

var server = new Server();


server.on('connection', function (client) {
    clients[client.id] = {id: client.id, room: null, isHost: false, color: '#' + ('00000' + (Math.random() * 16777216 << 0).toString(16)).substr(-6)};
    client.emit('update', rooms);
    broadcastDebugMsg(client.id + ' has joined the server');

    //DB STUFF

    client.on('gameStateInit', function() {
        let room = findRoomByID(client.id, rooms);
        if(clients[client.id].isHost){
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("advanced-wars");
                dbo.collection("maps").findOne()
                .then(function(basic){
                    basic._id =  room.id;
                    basic.players = [0,0];
                    basic.money = []
                    for(let cl of room.clients){
                        basic.players.push(cl);
                    }
                    basic.nTurns = 0;
                    dbo.collection("games").insertOne(basic);
                    console.log("basic game object inserted to games collection")
                });
            });
        }
    });

    client.on('buyTroop', function(pos, troopType, player){
      let room = findRoomByID(client.id, rooms);
      client.broadcast.to(room.id).emit('buyTroopBroadcast', pos, troopType, player);
    });

    client.on('maTroop', function(actionName, posBeg, options){
        let room = findRoomByID(client.id, rooms);
        client.to(room.id).emit('maTroopBroadcast', actionName, posBeg, options);
      });

      client.on('mcTroop', function(actionName, posBeg, options){
        let room = findRoomByID(client.id, rooms);
        client.to(room.id).emit('mcTroopBroadcast', actionName, posBeg, options);
      });

      client.on('mvTroop', function(actionName, posBeg, options){
        let room = findRoomByID(client.id, rooms);
        client.to(room.id).emit('mvTroopBroadcast', actionName, posBeg, options);
      });

      client.on('endTurn', function(){
        let room = findRoomByID(client.id, rooms);
        client.to(room.id).emit('endTurnBroadcast');
      });

    client.on('disconnect', function() {

        if (clients[client.id].isHost) {
            var room = findRoomByID(client.id, rooms);
            delete rooms[room.id];
            server.sockets.emit('update', rooms);
        }

        broadcastDebugMsg(client.id + ' has disconnected from the server');
        delete clients[client.id];

    });

    client.on('join', function(roomID, callback) {
        // join existing room
        if (connectClientToRoom(roomID, client.id, false)) {
            callback(roomID);
        }
    });

    client.on('host', function(data, callback) {
        // create new room ID on host
        var newRoomID = uuid.v4();
        if (connectClientToRoom(newRoomID, client.id, true)) {
            callback(newRoomID);
        }
    });

    client.on('chatMessage', function(msg) {
        // find out which room the client is in
        var room = findRoomByID(client.id, rooms);

        server.sockets.in(room.id).emit('addChatMessage', msg, client.id, clients[client.id].color);


    });

    client.on('startGame', function(){
      var room = findRoomByID(client.id, rooms);
      server.sockets.in(room.id).emit('startGameNow', room.clients);
    });


    function connectClientToRoom(roomID, clientID, isHost) {
        // if the client is already a host, or already connected to a room
        if (clients[clientID].isHost || clients[clientID].room) {
            return false;
        }

        client.join(roomID, function(err) {
            if (!err) {

                clients[client.id].isHost = isHost;
                clients[client.id].room = roomID;
                //rooms[roomID] = new Room(roomID, clientID, isHost);

                if (isHost) {
                    rooms[roomID] = new Room(roomID, clientID);
                    broadcastDebugMsg(clientID + ' has created room: ' + roomID);
                } else {
                    rooms[roomID].addClient(clientID);
                    broadcastDebugMsg(client.id + ' has joined room: ' + roomID);

                }

                server.sockets.emit('update', rooms);

            } else {
                // handle error message

            }
        });


        return true;
    }

    function broadcastDebugMsg(msg) {
        server.sockets.emit('debugMessage', msg);
    }

    function findRoomByID(clientID, rooms) {
        var key, room;
        for (key in rooms) {
            if (rooms.hasOwnProperty(key)) {
                room = rooms[key];
                //if (room.hostID === hostID) {
                //    return room;
                //}
                for (var i = 0; i < room.clients.length; i++) {
                    if (room.clients[i] === clientID) {
                        return room;
                    }
                }
            }
        }
        return null;
    }
});
