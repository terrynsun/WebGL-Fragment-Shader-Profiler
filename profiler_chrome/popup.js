document.addEventListener('DOMContentLoaded', function() {

  var checkPageButton = document.getElementById('checkPage');
  // console.log(this.programs);
  // for (var i = 0; i < programs.length; i++) {
  //   $("#programs_list").add("<option>"+ this.programs[i] + "</option>");
  // }
  console.log("chrome extension getViews");
  console.log(chrome.extension.getViews());

  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    console.log(request);
    $("#message").text(request.canvas_message);
  
  });

  checkPageButton.addEventListener('click', function() {
    chrome.tabs.executeScript(null, {file: "profiler.js"});
  }, false);

}, false);

