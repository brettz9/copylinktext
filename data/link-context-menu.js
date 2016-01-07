/*globals self */

(function () {
'use strict';

var strings,
    lastElInfo = {},
    _ = // require('l10n').get
        function (str) {
            return strings[str];
        };

self.on('click', function (el, data) {
    var imgs, imgsl, i, showAltText, alts = [],
        copytext = el.textContent.replace(/^\s*(.*?)\s*$/, '$1'); // Ensure we get it all (except WS)
    data = JSON.parse(data);
    strings = data.localeObject;
    showAltText = data.showAltText;
    var highlightingEnabled = data.highlightingEnabled;
    var highlightColor = data.highlightColor;
    var highlightBackgroundColor = data.highlightBackgroundColor;

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

    // Outside of highlightingEnabled block in case just disabled (this won't work now, though, as we are
    //  rebuilding the menu each time and this script is rebuilt, losing the lastElInfo)
    if (lastElInfo.el) {
        lastElInfo.el.style.color = lastElInfo.color;
        lastElInfo.el.style.backgroundColor = lastElInfo.backgroundColor;
    }
    lastElInfo.color = el.style.color;
    lastElInfo.backgroundColor = el.style.backgroundColor;
    lastElInfo.el = el;
    if (highlightingEnabled) {
        el.style.color = highlightColor;
        el.style.backgroundColor = highlightBackgroundColor;
    }
});

}());
