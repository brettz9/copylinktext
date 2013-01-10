/*globals self */
(function () {
'use strict';

self.on('context', function (el) {
    return !!el.alt;
});

self.on('click', function (el) {
    self.postMessage(el.alt);
});

}());