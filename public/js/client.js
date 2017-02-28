var socket = io();
var categories = ['What went well?', 'What could have gone better'];
var showResultsAlways = false;

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
	$('form').on('submit', function (e) {
		e.preventDefault();
		if (!window.confirm("Are you sure you want to post this?")) {
			return;
		}
		var text = $("#description").val();
		if (text == '') {
			return;
		}

		socket.emit('retro card', text);
	})
});

//Listner for when a new card is added to the board
socket.on('new card', function (data) {
	addCardToBoard(data.id,data.content);
	console.log(data.content);
});