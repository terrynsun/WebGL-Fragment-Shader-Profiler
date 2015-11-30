var canvas_list = document.getElementsByTagName("canvas");
console.log(canvas_list[0]);
console.log(window.programs);

var canvas_message = "";
if(canvas_list.length > 0) {
  var canvas = canvas_list[0];
  canvas_message = "This page has an HTML5 canvas";
} else {
  canvas_message = "This page doesn't have an HTML5 canvas";
}

chrome.runtime.sendMessage({
	program: JSON.stringify(window.programs),
	canvas_message: canvas_message
});