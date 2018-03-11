/* globals self */
(() => {
'use strict';

/*
// Probably won't need this script at all if this is implemented: https://bugzilla.mozilla.org/show_bug.cgi?id=1325814
const port = browser.runtime.connect({name: 'copylinktext-content-script'});
port.onMessage.addListener(function () {

});
port.postMessage();
*/

self.on('context', function (el) {
    return !!el.alt;
});

self.on('click', function (el) {
    self.postMessage(el.alt);
});
})();
