//Require the following modules
var express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var encode = require('encode-html');
var mysql = require('mysql');
var express = require('express');

//Create a pool of MySql connections
/**
 *  Create a pool of MySQL connections
 *  A pool of connections makes sure we can deal with multiple of queries at a time.
 */
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.SQLHOST,
  user            : process.env.SQLUSER,
  password        : process.env.SQLPW,
  database        : process.env.SQLDB
});

/**
 * Set up the connection port and what the index file should be
 */
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/public/index.html');

/**
 * Start up express and set up the index page and where the static files live
 */
var app = express();
const server = express()
    .get('/', function (req, res) { res.sendFile(INDEX) })
    .use(express.static(__dirname + '/public'))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

/**
 * Start up socket IO server a watch for a new connection
 */
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

    /**
     * Set up a watch for new retro cards coming in from users
     */
    // socket.on('retro card', function (text) {
    //     /**
    //      * Encode the text for secuirty reasons make sure the user trying not in inject stuff to the site
    //      */
    //     text = encode(text);

    //     /**
    //      * The database can only support 3000 charaters so need to make sure we do not try and put to much in there
    //      */
    //     text = text.substring(0, 25000);

    //     /**
    //      * Need to save this on the database and then emit the data to every client that is connected to make sure everyone see the new cards being added
    //      */
    //     pool.query('INSERT INTO cards SET ?', { content: text }, function (error, results, fields) {
    //         if (error) throw error;
    //         console.log("Inserted row: "+results.insertId);
    //         io.sockets.emit('new card', {
    //             id: results.insertId,
    //             content: text
    //         });
    //         console.log("Card added with data: "+text);
    //     });
    // });
});