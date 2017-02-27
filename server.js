var express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var Entities = require('html-entities').XmlEntities;
entities = new Entities();

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.SQLHOST,
    user: process.env.SQLUSER,
    password: process.env.SQLPassword,
    database: process.env.SQLDB
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

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

io.on('connection', function (socket) {
    //On a new connection need to send a user all the files required to make this work correctly 
    var query = connection.query('SELECT * FROM cards');
    query
        .on('result', function (row) {
            // Pausing the connnection is useful if your processing involves I/O 
            console.log(row);
            socket.emit('new card',{
                id: row.id,
                content: row.content
            })
        })

    //monitor when a card gets sent in
    socket.on('retro card', function (text) {
        //clean up the input
        text = entities.encodeNonUTF(text);

        //Reduce string to 1500 charaters
        text = text.substring(0, 1000);

        

        //Save card in the database
        connection.query('INSERT INTO cards SET ?', { content: text }, function (error, results, fields) {
            if (error) throw error;
            console.log(results.insertId);
            io.sockets.emit('new card', {
                id: results.insertId,
                content: text
            });
        });

        console.log(text);
    });
});