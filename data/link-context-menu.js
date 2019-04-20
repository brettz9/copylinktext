/* globals self */

(function () {
'use strict';

let strings;
const lastElInfo = {},
  _ = // require('l10n').get
    function (str) {
      return strings[str];
    };

self.on('click', function (el, data) {
  const alts = [],
    // Ensure we get it all (except WS)
    copytext = el.textContent.replace(/^\s*(.*?)\s*$/u, '$1');
  data = JSON.parse(data);
  strings = data.localeObject;
  const {
    showAltText, highlightingEnabled, highlightColor, highlightBackgroundColor
  } = data;

  if (showAltText) {
    const imgs = el.querySelectorAll('img');
    for (let i = 0, imgsl = imgs.length; i < imgsl; i++) {
      if (imgs[i].hasAttribute('alt')) {
        alts.push(imgs[i].alt || _('emptyString'));
      } else {
        alts.push(_('notPresent'));
      }
    }
  }

  self.postMessage([
    copytext, alts.length && alts[0] !== copytext ? alts : null
  ]);

  // Outside of highlightingEnabled block in case just disabled
  //   (this won't work now, though, as we are rebuilding the menu each time
  //   and this script is rebuilt, losing the lastElInfo)
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
