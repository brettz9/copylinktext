/*global self, mouseDown*/
var strings = self.options.localeObject;
[].forEach.call(document.querySelectorAll(self.options.sel), function (el) {
    'use strict';
    el.addEventListener('contextmenu', function (e) {
        if (e.button !== 2) {
            return;
        }
        console.log(mouseDown(e.target)[0]);
        self.port.emit('mouseDown', mouseDown(e.target)[0]);
        e.preventDefault();
    }, true);
});
