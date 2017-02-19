var express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/public/index.html');

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

const server = express()
   .use((req, res) => res.sendFile(INDEX) )
   .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);