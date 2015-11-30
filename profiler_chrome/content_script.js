document.addEventListener("avg_ms", function(data) {
    console.log(data.detail.avg_ms);
    chrome.runtime.sendMessage({ avg_ms: data.detail.avg_ms});
});
