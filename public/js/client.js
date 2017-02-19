var socket = io();
var categories = ['What went well?', 'What could have gone better'];
var showResultsAlways = false;

$(function(){
    categories.forEach(function(category) {
		$("#wall").append(
			$("<div>").addClass("category").attr("id", hyphenate(category))
			.append($("<h2>").text(category))
			.append($("<ul>"))
		);
	});
});

socket.on('retro card',function(msg){
	var json = msg;
	var obj = JSON.parse(json);

	if(typeof obj.type != 'undefined'){
		switch (obj.type) {
			case 'showresults':
			showResultsAlways = true;
				showResults();
				break;
		
			default:
				showResults();
				break;
		}
	}

	if(typeof obj.text == 'undefined'){
		$("#"+obj.id).data('votes',obj.votes);
		if(showResultsAlways){
			showResults();
		}
		return;
	}

	$("#"+obj.id).remove();

  	$("#"+obj.category+" ul").append(
		$("<li>").text(obj.text).attr('id', obj.id).data('votes', obj.votes).draggable({ revert: true, zIndex: 100 })
		.append('<span class="plus"></span>')
	);
	setTimeout ( "setVoteEvent()", 100 );
})