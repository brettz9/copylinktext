/*globals require, exports*/

/*
Todos:
1. Refactor context menu postMessage or on* listeners to work declaratively with JSON setPrefs
2. API updates
    1. Track (recover old feature): accesskey for context menus: https://bugzilla.mozilla.org/show_bug.cgi?id=828113; (already resolved: https://bugzilla.mozilla.org/show_bug.cgi?id=825803 )
    2. Propose or implement JSON array type preference rendered as multiple select
    3. Propose or implement JSON object type preference accessible/settable without conversion to string
    4. Propose or implement (recover old feature): Allow package.json preferences to indicate dependencies (e.g., if one is enabled, it will disable another pref.); though one can workaround by using radio buttons, sometimes less elegant
    5. Propose or implement: Prompts to SDK API (to avoid need for chrome)? (Also Door-hanger Notifications for asyouwish)
*/

(function () {
'use strict';

var linkCm, formCm, formMod,
    chrome = require('chrome'),
    Cc = chrome.Cc, Ci = chrome.Ci,
    cm = require('sdk/context-menu'),
    data = require('sdk/self').data,
    simplePrefs = require('sdk/simple-prefs'),
    prefs = simplePrefs.prefs,
    clipboard = require('sdk/clipboard'),
    pageMod = require('sdk/page-mod'),
    _ = require('sdk/l10n').get;

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
* Set up form context menu (may be destroyed if option disabled)
*/
function setFormCm () {
    /*
    // Since there is no apparent way to pass parameters to the context menu, we create new ones
    var contentScript = ['accessFormControls', 'accessPass', 'immediateFormClickExecution'].reduceRight(function (prev, next) {
        return (prefs[next] ? next + '-' : '') + prev;
    }, 'form-cm.js');
    contentScript = 'form-context-menu.js';
    */
    if (!prefs.accessFormControls) {
        return;
    }
    var immediateFormClickExecution = prefs.immediateFormClickExecution,
        obj = {
            localeObject: {
                joinOptsText: _("joinOptsText"),
                joinOpts: _("joinOpts")
            }
        },
        sel = 'input[type]:not([type=text])' + (prefs.accessPass ? '' : ':not([type=password])') + ', select, button, img';

    if (immediateFormClickExecution) {
        formMod = pageMod.PageMod({
            include: ['*', 'file://*'],
            contentScriptWhen: 'ready',
            attachTo: ['top', 'frame', 'existing'],
            contentScriptOptions: {sel: sel, localeObject: obj.localeObject},
            contentScriptFile: [data.url('mouseDown.js'), data.url('form-pagemod-script.js')],
            onAttach: function (worker) {
                worker.port.on('mouseDown', function (val) {
                    copyToClipboard(val);
                });
            }
        });
    }


    formCm = cm.Item({
        label: _("copyformtextContext.label"),
        accesskey: _("copyformtextContext.accesskey"),
        // Useful for type=password,
        // (checkbox, radio),
        // (button, submit, reset),
        // file, image (doesn't work with initial setting of value)
        // (not getting hidden)
        context: cm.SelectorContext(sel),
        contentScriptFile: [data.url('mouseDown.js'), data.url('form-context-menu.js')],
        data: JSON.stringify(obj),
        onMessage: function (arr) {
            copyToClipboard(getCopyTextFromPrompt.apply(null, arr));
        }
    });
}

/**
* Destroy pre-existing form (if any) and then set up new one based on current preferences
*/
function updateFormContextMenuStatus () {
    if (formCm) {
        formCm.destroy();
    }
    if (formMod) {
        formMod.destroy();
    }
    setFormCm();
}

function setLinkCm () {
    var obj = {
        localeObject: {
            emptyString: _("emptyString"),
            notPresent: _("notPresent")
        }
    };
    obj.data = prefs.showAltText;

    linkCm = cm.Item({
        label: _("copylinktextContext.label"),
        accesskey: prefs.copyLinkTextAccessKey || _("copylinktextContext.accesskey"),
        context: cm.SelectorContext('a[href]'),
        contentScriptFile: data.url('link-context-menu.js'),
        data: JSON.stringify(obj),
        onMessage: function (arr) {
            var alts = arr[1],
                copytext = alts ?
                    _("addAltToLinkText", arr[0], alts.join(_("altJoin"))) :
                    arr[0];
            return copyToClipboard(copytext);
        }
    });
}

function updateLinkContextMenuStatus () {
    if (linkCm) {
        linkCm.destroy();
    }
    setLinkCm();
}

/**
* Activates behaviors when called on start-up or preference change.
*/
function setByPref (pref) {
    switch(pref) {
        case 'accessFormControls': case 'accessPass': case 'immediateFormClickExecution':
            updateFormContextMenuStatus();
            break;
        case 'showAltText': case 'copyLinkTextAccessKey':
            updateLinkContextMenuStatus();
            break;
        default:
            throw 'Unknown pref supplied to setByPref ' + pref;
    }
}

// This is an active module of the brettz9 Add-on
exports.main = function() {

    cm.Item({ // Already accessible on "View image info"->Associated text, but we'll allow more direct access
        label: _("copyalttextContext.label"),
        accesskey: _("copyalttextContext.accesskey"),
        context: cm.SelectorContext('img'),
        contentScriptFile: data.url('alt-context-menu.js'),
        onMessage: function (txt) {
            copyToClipboard(txt);
        }
    });

    simplePrefs.on('', setByPref);
    setByPref('showAltText');
    // setByPref('copyLinkTextAccessKey'); // Handled by the line above
    setByPref('accessFormControls');
    // These two handled by the line above
    // setByPref('accessPass');
    // setByPref('immediateFormClickExecution');
};

}());
