var socket = io();

var categories = ["What went well?", "What could have gone better?"];

var showResultsAlways = false;

$(function(){
	categories.forEach(function(category) {
		$("#wall").append(
			$("<div>").addClass("category").attr("id", hyphenate(category))
			.append($("<h2>").text(category))
			.append($("<ul>"))
		);
	});

	$('form').on('submit',function(e){
		e.preventDefault();
		var text = $("#description").val();
		if(text == ''){
			return;
		}

		$("#myitems").append(
			$("<li>")
			.addClass("draggable")
			.text(text)
			.draggable({
				revert: true,
				zIndex: 100
			})
		);

		$("#description").val("");
	})

	$(".category").droppable({
		hoverClass: "drop-hover",
		drop: function(event, ui) {
			var category = $(this).attr("id");
			var previousCategory = ui.draggable.closest(".category").attr("id")

			if(typeof ui.draggable.attr("id") != 'undefined'){
				var id = ui.draggable.attr("id");
				var json = JSON.stringify({ type: 'updatecategory',  category: category, id: id });
                socket.emit('retro card', json);
				ui.draggable.remove();
				setTimeout ( "setVoteEvent()", 100 );
				return true;
			}

			
			if (category != previousCategory) {
				var text = ui.draggable.text();
				var id = ui.draggable.attr("id");
				var json = JSON.stringify({ text: text,  category: category, id: id });
				socket.emit('retro card', json);
				ui.draggable.remove();
				setTimeout ( "setVoteEvent()", 100 );
			}else{
				var json = JSON.stringify({ type: 'updatecategory',  category: category, id: id });
				socket.send(json);
			}
		}
	});

	$(".showresults").on('click',function(){
		var json = JSON.stringify({ showResults: true });
		socket.send(json);
	});
});


function setVoteEvent(){
	$('.plus').off('click');
	$('.plus').on('click',function(){
		var id = $(this).parent().attr('id');
		var json = JSON.stringify({voted: 1, id: id });
		socket.send(json);
	});
}

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

function hyphenate(text){
	return text.replace(/[^a-zA-Z ]/g, "").replace(/ +/g, '-').toLowerCase();
}


function showResults(){
	$('li .votes').each(function(){
		$(this).remove();
	})
	$('li').each(function(){

		var votes = $(this).data().votes;
		$(this).append('<span class="votes">'+votes+'</span>');
	});
}