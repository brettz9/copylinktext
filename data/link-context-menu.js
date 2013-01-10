/*globals self */

(function () {
'use strict';

var strings,
    _ = // require('l10n').get
        function (str) {
            return strings[str];
    };

/*self.port.on('setLocaleObject', function (strObj) {
    strings = strObj;
});*/

self.on('click', function (el, data) {
    // Get the link text
    var imgs, imgsl, i, showAltText, alts = [],
        copytext = el.textContent.replace(/^\s*(.*?)\s*$/, '$1'); // Ensure we get it all (except WS)
    data = JSON.parse(data);
    strings = data.localeObject;
    showAltText = data.showAltText;

    if (showAltText) {
        imgs = el.getElementsByTagName('img');
        for (i = 0, imgsl = imgs.length; i < imgsl; i++) {
            if (imgs[i].hasAttribute('alt')) {
                alts.push(imgs[i].alt || _("emptyString"));
            }
            else {
                alts.push(_("notPresent"));
            }
        }
    }

    self.postMessage([copytext, alts.length && alts[0] !== copytext ? alts : null]);
});

}());
