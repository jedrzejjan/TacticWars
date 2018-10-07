var socket;

class LobbiesState extends Phaser.State {
    preload() {

    }

    create() {
      socket = io();
      var curState = this;

      $( "canvas" ).addClass( "canvas-hidden" );
      $('#game-container').append('<div id="game-list"><table id="game-list-table"><tr><th>Game ID</th><th>Players</th><th>Join Game</th></tr></table></div><div id="game-list-options"><button id="btn-host-game">Create new game</button></div>');


      // handle when the create new game button is pressed
      $('#game-container').on('click', '#btn-host-game', function() {
          // create a new socket.io room and assign socket
          socket.emit('host', socket.id, function(roomID) {

              // client has created and joined new room

          });

          initGame();
      });

      $('#game-container').on('click', '#ola', function() {
        $('input').val('I just started the game');
        socket.emit('startGame');
      });

      socket.on('startGameNow', function(players_ids) {
        $( "canvas" ).removeClass( "canvas-hidden" );
        $('img').remove();
        $("#csssheet").remove();
        $("#ola").remove();
        $('head').append('<link rel="stylesheet" type="text/css" href="style/gameWithChat.css">');
        curState.game.state.start('GameState', true, false, 800, 0, players_ids);
      });

      $('#game-container').on('click', '#btn-join-game', function() {
          var roomID = $(this).data('button');
          socket.emit('join', roomID, function(data) {
          });

          initGame();
      });

      $('#game-container').on('submit', 'form', function() {

          socket.emit('chatMessage', $('#chat-box-input').val());

          $('#chat-box-input').val('');

          return false;
      });

      socket.on('debugMessage', function(msg) {
          $('#debug').append('<p>' + msg + '</p>');
      });

      socket.on('addChatMessage', function(msg, clientID, color) {
          $('#game').append('<p style="color:' + color + ';">' + clientID + ": " + '<span>' + msg);
          $('#game')[0].scrollTop = $('#game')[0].scrollHeight;
      });


      socket.on('update', function(rooms) {
          var room, key;
          $('.room-list-item').remove();
          for (key in rooms) {
              if (rooms.hasOwnProperty(key)) {
                  room = rooms[key];
                  addSingleRoomToList(room);
              }
          }
      });

      function addSingleRoomToList(room) {
          $('#game-list-table').append(
              '<tr class="room-list-item">'
              + '<td>' + room.id + '</td>'
              + '<td>' + room.clients.length + '/10</td>'
              + '<td><button id=btn-join-game data-button=' + room.id + '>Join Room</button></td>'
          );
      }

      function initGame() {
          $('#game-container').empty();
          $('#game-container').append(
              '<div id=game></div>' +
              '<div id=chat-box><form action=""><input autofocus id="chat-box-input" autocomplete="off" /><button>Send</button><button id="ola">Start</button></form></div>');
      }
    }

    update() {

    }

}
