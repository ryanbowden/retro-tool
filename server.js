var express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var encode = require('encode-html');

var mysql = require('mysql');
var host = process.env.SQLHOST,
    user = process.env.SQLUSER,
    password = process.env.SQLPW,
    db = process.env.SQLDB;

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : host,
  user            : user,
  password        : password,
  database        : db
});


const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/public/index.html');

var express = require('express');
var app = express();

const server = express()
    .get('/', function (req, res) { res.sendFile(INDEX) })
    .use(express.static(__dirname + '/public'))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);


io.on('connection', function (socket) {

    //On a new connection need to send a user all the files required to make this work correctly 
    var query = pool.query('SELECT * FROM cards');
    query
        .on('result', function (row) {
            socket.emit('new card',{
                id: row.id,
                content: row.content
            })
        })
    console.log("Sent start up data to users");

    //monitor when a card gets sent in
    socket.on('retro card', function (text) {
        //clean up the input
        text = encode(text);

        //Reduce string to 1500 charaters
        text = text.substring(0, 1000);

        

        //Save card in the database
        pool.query('INSERT INTO cards SET ?', { content: text }, function (error, results, fields) {
            if (error) throw error;
            console.log("Inserted row: "+results.insertId);
            io.sockets.emit('new card', {
                id: results.insertId,
                content: text
            });
        });
        

        console.log("Card added with data:"+text);
    });
});