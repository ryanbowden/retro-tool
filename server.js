'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);

const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/public/index.html');

const server = express()
    .use((req, res) => res.sendFile(INDEX) )
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var http = require('http').Server(app);


var showResults = false
var retros = [];
var cards = [];
var users = [];



io.on('connection', function(socket){

  //send the user the retro that are in use

  for(var i=0; i<retros.length; i++){
    var item = retros[i];
    var json = JSON.stringify({ type: 'retros', text: item.name, id: i.toString()  });
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
        case 'add-retro':
          addRetro(obj.name,socket);
          break;
        case 'selected-retro':
          selectRetro(obj.id,socket);
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


function addRetro(text, socket){
  retros.push({name: text});
  var i = retros.length-1;

  var json = JSON.stringify({ type: 'retros', text: text, id: i.toString()  });

  io.emit('retro card', json);
  return retros.length-1;  
}

function selectRetro(id,socket){
  for(var i=0; i<cards.length; i++) {
      var item = cards[i];
      console.log(item);
      if(item.retro == id){
        var json = JSON.stringify({ text: item.name, category: item.category, id: i, votes: item.votes });
        console.log("Sending to clients: " + json);
        io.emit('retro card', json);
      }
  }
}