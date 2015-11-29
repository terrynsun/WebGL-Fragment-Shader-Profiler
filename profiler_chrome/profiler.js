
var canvas_list = document.getElementsByTagName("canvas");
var message = "";
if(canvas_list.length > 0) {
  var canvas = canvas_list[0];
  message = "This page has an HTML5 canvas";
} else {
  message = "This page doesn't have an HTML5 canvas";
}

message