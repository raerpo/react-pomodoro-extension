let state = null;

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if (message.action === 'save_state') {
        // Persist the state in variable
        state = message;
    } else if (message.action === 'get_state') {
        debugger;
        callback(state);
    }
});