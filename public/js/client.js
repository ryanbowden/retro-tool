var socket = io();
var categories = ['What went well?', 'What could have gone better'];
var showResultsAlways = false;

/**
 * Function addCardToBoard
 * This adds the card to the board
 * Returns nothing
 */
function addCardToBoard(id,text){
	//Check card is not already on that page
	$("#myitems").append(
		$("<li>")
		.data('id',id)
		.addClass("draggable")
		.html(text)
	);
}

$(function () {
	/**
	 * Add event listner to the submit buttom
	 */
	$('form').on('submit', function (e) {
		e.preventDefault();
		// Check a user does want to submit
		if (!window.confirm("Are you sure you want to post this?")) {
			return;
		}
		//Get the message and check it is not empty
		var text = $("#description").val();
		if (text == '') {
			return;
		}

		//TODO: Make sure the text is below the limit the database can handle

		//Send the text to the server so the card can be added to the board
		socket.emit('retro card', text);
	})
});

//Listner for when a new card is added to the board
socket.on('new card', function (data) {
	addCardToBoard(data.id,data.content);
	console.log(data.content);
});