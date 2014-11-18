/*global self, mouseDown*/
[].forEach.call(document.querySelectorAll(self.options.sel), function (el) {
    el.addEventListener('contextmenu', function (e) {
        'use strict';
        if (e.button !== 2) {
            return;
        }
        console.log(mouseDown(e.target)[0]);
        self.port.emit('mouseDown', mouseDown(e.target)[0]);
        e.preventDefault();
    }, true);
});
