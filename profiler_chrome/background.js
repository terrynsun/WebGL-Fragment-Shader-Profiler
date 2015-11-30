
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(JSON.stringify(message));
    $("#message").text(message.canvas_message);
    $("#avg_ms").text("Average ms: " + message.avg_ms);
    
});
