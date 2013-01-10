/*globals require, exports*/

/*
SDK modifications
1. To ensure Unicode escaping (for \u0020-end-of-line-space escaping) is ok for all locales on joining of alt links and select options, I added the following line to /python-lib/cuddlefish/property_parser.py (and compiled to property_parser.pyc):
    val = val.encode('raw-unicode-escape').decode('raw-unicode-escape')
    see also: 
    http://effbot.org/zone/unicode-objects.htm
    http://www.python.org/dev/peps/pep-0100/
2. (May also include widget.js modification for AsYouWish)

Todos:

1. Fix non-links (and ensure \u0020 is ok (for all locales))
    a. Add back img (for link text in addition to alt text) in way that doesn't cause duplicates when image inside of link
    b. Make option to grab label text for elements
    c. Option to right-click to immediately get dialog, or to get as context menu? (to avoid interfering with app. behavior for right-click)
    d. Move non-links/img alt text retrieval to separate add-on?
2. Update readme to indicate it is now complete

1. Track (recover old feature): accesskey for context menus: https://bugzilla.mozilla.org/show_bug.cgi?id=828113; then ask the following as follow-ups
2. Track fix for Unicode (\u0020 in package.json): https://bugzilla.mozilla.org/show_bug.cgi?id=825803 (then remove my custom changes/upgrade SDK without the patch)
3. Propose or implement JSON array type preference rendered as multiple select
4. Propose or implement JSON object type preference accessible/settable without conversion to string
5. Propose or implement (recover old feature): Allow package.json preferences to indicate dependencies (e.g., if one is enabled, it will disable another pref.); though one can workaround by using radio buttons, sometimes less elegant
6. Propose or implement: Prompts to SDK API (to avoid need for chrome)? (Also Door-hanger Notifications for asyouwish)
    
Possible todos:
1. Refactor context menu postMessage or on* listeners to work declaratively with JSON setPrefs
2. Could try to make work with main browser XUL
3. Optional ability to get input type hidden, optgroup text?, get form and form control names?
*/

(function () {
'use strict';

var linkCm, formCm, altCm,
    chrome = require('chrome'),
    Cc = chrome.Cc, Ci = chrome.Ci,
    cm = require('context-menu'),
    data = require('self').data,
    simplePrefs = require('simple-prefs'),
    prefs = simplePrefs.prefs,
    clipboard = require('clipboard'),
    _ = require('l10n').get;

/**
* Set up form context menu (may be destroyed if option disabled)
*/
function setFormCm () {
    formCm = cm.Item({
        label: _("copyformtextContext.label"),
        // _("copyformtextContext.accesskey"),
        // Useful for type=password,
        // (checkbox, radio),
        // (button, submit, reset),
        // file, image (doesn't work with initial setting of value)
        // (not getting hidden)
        context: cm.SelectorContext('input[type]:not([type=text]), select, button'), // , img
        contentScriptFile: data.url('form-context-menu.js'),
        data: stringify({
            localeObject: {
                joinOptsText: _("joinOptsText"),
                joinOpts: _("joinOpts")
            }
        }),
        onMessage: function (arr) {
            copyToClipboard(getCopyTextFromPrompt.apply(null, arr));
        }
    });
}

/**
 * Copy some text (in Unicode-friendly fashion) to the clipboard
 * @param {String} copytext The text to copy to the clipboard
 */
function copyToClipboard (copytext) {
    return clipboard.set(copytext, 'text');
}

/**
* Get choice of text to copy from user
* @param {String} value Form control value
* @param {String} textContent Text content of form control
* @param {String} [labelText] If there is any label text for the form control
*/
function getCopyTextFromPrompt (value, textContent, labelText) {
    var selected = {},
        items = [
            _("textFormat", textContent),
            _("valueFormat", value),
            _("textAndValue")
        ],
        prompts = Cc['@mozilla.org/embedcomp/prompt-service;1'].getService(Ci.nsIPromptService);
    if (labelText) {
        items.push(_("labelFormat", labelText));
    }
    prompts.select(null, _("copySelectPromptTitle"), // docEv.target.defaultView
                                    _("copySelectPromptInstructions"), items.length, items, selected);
    switch(selected.value) {
        case 0: return textContent;
        case 1: return value;
        case 2: return value === textContent ?
                value :
                _("textAndValueFormat", textContent, value);
        case 3: return labelText;
    }
}

/**
* Converts (preference) configuration object to JSON string
* @param {Object} cfg Configuration object to stringify
* @returns {String} The object converted to a JSON string
*/
function stringify (cfg) {
    return JSON.stringify(cfg);
}

/**
* Sets a property on a context menu's data property object-as-string
* @param {Object} cm The context menu object
* @param {String} prop The property to set on the currently-set JSON-parsed context menu data property object-as-string
* @param {JSON object} value The value to set on the currently-set JSON-parsed context menu data property object-as-string
*/
function setProperty (cm, prop, value) {
    var obj = JSON.parse(cm.data);
    obj[prop] = value;
    cm.data = stringify(obj);
}

/**
* Activates behaviors when called on start-up or preference change.
*/
function setByPref (pref) {
    switch(pref) {
        case 'accessFormControls':
            if (!prefs[pref] && formCm) {
                formCm.destroy();
            }
            else if (prefs[pref] && !formCm) {
                setFormCm();
            }
            setProperty(formCm, pref, prefs[pref]);
            break;
        case 'accessPass':
            setProperty(formCm, pref, prefs[pref]);
            break;
        case 'showAltText':
            setProperty(linkCm, pref, prefs[pref]);
            break;
        default:
            throw 'Unknown pref supplied to setByPref ' + pref;
    }
}

// This is an active module of the brettz9 Add-on
exports.main = function() {

    linkCm = cm.Item({
        label: _("copylinktextContext.label"),
        // _("copylinktextContext.accesskey"),
        context: cm.SelectorContext('a[href]'),
        contentScriptFile: data.url('link-context-menu.js'),
        data: stringify({
            localeObject: {
                emptyString: _("emptyString"),
                notPresent: _("notPresent")
            }
        }),
        onMessage: function (arr) {
            var alts = arr[1],
                copytext = alts ?
                    _("addAltToLinkText", arr[0], alts.join(_("altJoin"))) :
                    arr[0];
            return copyToClipboard(copytext);
        }
    });
    altCm = cm.Item({ // Already accessible on "View image info"->Associated text, but we'll allow more direct access
        label: _("copyalttextContext.label"),
        // _("copyalttextContext.accesskey"),
        context: cm.SelectorContext('img'),
        contentScriptFile: data.url('alt-context-menu.js'),
        onMessage: function (txt) {
            copyToClipboard(txt);
        }
    });

    simplePrefs.on('', setByPref);
    setByPref('accessFormControls');
    setByPref('accessPass');
    setByPref('showAltText');

};

}());
