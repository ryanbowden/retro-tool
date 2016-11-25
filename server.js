var express = require('express');

const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

// var app = express();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/style.css', function (req, res) {
//   res.sendFile( __dirname + "/public/" + "style.css" );
// })

// app.get('/client.js', function (req, res) {
//   res.sendFile( __dirname + "/public/" + "client.js" );
// })

// app.get('/', function (req, res) {
//   res.sendFile( __dirname + "/public/" + "index.html" );
// })

var showResults = false
var cards = [];


io.on('connection', function(socket){
  console.log('Client Connected');
  for(var i=0; i<cards.length; i++) {
      var item = cards[i];
      var json = JSON.stringify({ text: item.name, category: item.category, id: i, votes: item.votes });
      console.log("Sending to clients: " + json);
      io.emit('retro card', json);
      json = JSON.stringify({type: 'showresults'});
      console.log("Sending to clients: " + json);
      io.emit('retro card', json);
  }

  socket.on('retro card', function(msg){
    console.log("Received: " + msg);

    var obj = JSON.parse(msg);

    if(typeof obj.type != 'undefined'){
      switch (obj.type) {
        case 'updatecategory':
          updatedCategory(obj.id, obj.category);
          break;
      
        default:
          break;
      }

      return;
    }

    if(typeof obj.showResults != 'undefined'){
      var json = JSON.stringify({type: 'showresults'});
      console.log("Sending to clients: " + json);
      io.emit('retro card', json);
    }

    //If a vote feature
    if(typeof obj.voted != 'undefined'){
      var id = obj.id;
      console.log(obj.voted + ' = '+ cards[id].votes);

      votes = cards[id].votes + 1;

      cards[id].votes = votes;

      var json = JSON.stringify({id: id, votes: votes });
      console.log("Sending to clients: " + json);
      io.emit('retro card', json);

      return;
    }

    //work out what the user sent to us
    if(typeof obj.text != 'undefined'){
      var text = obj.text;
      var category = obj.category;
      var id = obj.id;
      var votes = 0;

      if (typeof id == 'undefined') {
        id = addCardToArray(text, category);
      } else {
        cards[id] = {name: text, category: category};
      }

      var json = JSON.stringify({ text: text, category: category, id: id, votes: votes });
      console.log("Sending to clients: " + json);
      io.emit('retro card', json);
    }
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function updatedCategory(id, category){
  cards[id].category = category;
  var text = cards[id].name;
  var votes = cards[id].votes;

  var json = JSON.stringify({ text: text, category: category, id: id, votes: votes });
  console.log("Sending to clients: " + json);
  io.emit('retro card', json);

}


function addCardToArray(text, category){
  cards.push({name: text, category: category, votes: 0 });
  return cards.length-1;  
}