/* globals self, mouseDown */
var strings; // eslint-disable-line no-var, no-unused-vars

(function () {
'use strict';

// PAGE EVENTS
/*
No means to pass data, so implementing as content script instead
self.on('context', function (el) {
    // Not needed?
    // var nodeName = el && el.nodeName.toLowerCase();
    // if (nodeName === 'input' && // WE DISALLOW PASSWORD FIELDS IF DISABLED OR TEXT SELECTED
    //     el.type === 'password' &&
    //     el.selectionStart !== el.selectionEnd) {
    //     return;
    // }

    // Make conditional if user wishes for automatic execution
    if (data.immediateFormClickExecution) {
        mouseDown(el);
    }
});
*/

self.on('click', function (el, data) {
    data = JSON.parse(data);
    strings = data.localeObject;
    if (!data.immediateFormClickExecution) {
        self.postMessage(mouseDown(el));
    }
});
}());
