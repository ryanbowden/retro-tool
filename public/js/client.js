var socket = io();
var categories = ['What went well?', 'What could have gone better'];
var showResultsAlways = false;

/**
 * Function addCardToBoard
 * This adds the card to the board
 * Returns nothing
 */
function addCardToBoard(id,text){
	//Check for links and convert them
	text = linkify(text);
	//Check card is not already on that page
	$("#myitems").append(
		$("<li>")
		.data('id',id)
		.addClass("draggable")
		.html(text)
	);
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
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