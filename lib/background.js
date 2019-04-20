/* eslint-env webextensions */

/*
Todos:
1. Refactor context menu postMessage or on* listeners to work declaratively
    with JSON setPrefs
2. API updates
  1. Propose or implement JSON array type preference rendered as multiple select
  2. Propose or implement JSON object type preference accessible/settable
      without conversion to string
  3. Propose or implement (recover old feature): Allow `package.json`
       preferences to indicate dependencies (e.g., if one is enabled,
       it will disable another pref.); though one can workaround by using
       radio buttons, sometimes less elegant
  4. Propose or implement: Prompts to SDK API (to avoid need for
      chrome)? (Also Door-hanger Notifications for asyouwish)
*/

'use strict';

let linkCm, formCm, formMod;
const chrm = require('chrome'),
  cm = require('sdk/context-menu'),
  {data} = require('sdk/self'),
  simplePrefs = require('sdk/simple-prefs'),
  clipboard = require('sdk/clipboard'),
  pageMod = require('sdk/page-mod');

const _ = (key) => browser.i18n.getMessage(key);
const {Cc, Ci} = chrm;
const {prefs} = simplePrefs;

/**
 * Copy some text (in Unicode-friendly fashion) to the clipboard.
 * @param {string} copytext The text to copy to the clipboard
 * @returns {void} Correct?
 */
function copyToClipboard (copytext) {
  return clipboard.set(copytext, 'text');
}

/**
* Get choice of text to copy from user.
* @param {string} value Form control value
* @param {string} textContent Text content of form control
* @param {string} [labelText] If there is any label text for the form control
* @returns {string}
*/
function getCopyTextFromPrompt (value, textContent, labelText) {
  const selected = {},
    items = [
      _('textFormat', textContent),
      _('valueFormat', value),
      _('textAndValue')
    ],
    prompts = Cc['@mozilla.org/embedcomp/prompt-service;1']
      .getService(Ci.nsIPromptService);
  if (labelText) {
    items.push(_('labelFormat', labelText));
  }
  prompts.select(
    null,
    _('copySelectPromptTitle'), // docEv.target.defaultView
    _('copySelectPromptInstructions'), items.length, items, selected
  );
  switch (selected.value) {
  default:
    return '';
  case 0: return textContent;
  case 1: return value;
  case 2: return value === textContent
    ? value
    : _('textAndValueFormat', textContent, value);
  case 3: return labelText;
  }
}

/**
* Set up form context menu (may be destroyed if option disabled).
* @returns {void}
*/
function setFormCm () {
  /*
  // Since there is no apparent way to pass parameters to the
  //   context menu, we create new ones
  const contentScript = [
    'accessFormControls', 'accessPass', 'immediateFormClickExecution'
  ].reduceRight(function (prev, next) {
    return (prefs[next] ? next + '-' : '') + prev;
  }, 'form-cm.js');
  contentScript = 'form-context-menu.js';
  */
  if (!prefs.accessFormControls) {
    return;
  }
  const {immediateFormClickExecution} = prefs,
    obj = {
      localeObject: {
        joinOptsText: _('joinOptsText'),
        joinOpts: _('joinOpts')
      }
    },
    sel = 'input[type]:not([type=text])' +
      (prefs.accessPass ? '' : ':not([type=password])') +
      ', select, button, img';

  if (immediateFormClickExecution) {
    formMod = pageMod.PageMod({
      include: ['*', 'file://*'],
      contentScriptWhen: 'ready',
      attachTo: ['top', 'frame', 'existing'],
      contentScriptOptions: {sel, localeObject: obj.localeObject},
      contentScriptFile: [
        data.url('mouseDown.js'), data.url('form-pagemod-script.js')
      ],
      onAttach (worker) {
        worker.port.on('mouseDown', function (val) {
          copyToClipboard(val);
        });
      }
    });
  }

  formCm = cm.Item({
    label: _('copyformtextContext.label'),
    accesskey: _('copyformtextContext.accesskey'),
    // Useful for type=password,
    // (checkbox, radio),
    // (button, submit, reset),
    // file, image (doesn't work with initial setting of value)
    // (not getting hidden)
    context: cm.SelectorContext(sel),
    contentScriptFile: [
      data.url('mouseDown.js'), data.url('form-context-menu.js')
    ],
    data: JSON.stringify(obj),
    onMessage (arr) {
      copyToClipboard(getCopyTextFromPrompt(...arr));
    }
  });
}

/**
* Destroy pre-existing form (if any) and then set up new one
*   based on current preferences.
* @returns {void}
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
  const obj = {
    localeObject: {
      emptyString: _('emptyString'),
      notPresent: _('notPresent')
    },
    showAltText: prefs.showAltText,
    highlightColor: prefs.highlightColor,
    highlightBackgroundColor: prefs.highlightBackgroundColor,
    highlightingEnabled: prefs.highlightingEnabled
  };

  linkCm = cm.Item({
    label: _('copylinktextContext.label'),
    accesskey: prefs.copyLinkTextAccessKey ||
      _('copylinktextContext.accesskey'),
    context: cm.SelectorContext('a[href]'),
    contentScriptFile: data.url('link-context-menu.js'),
    data: JSON.stringify(obj),
    onMessage ([arr0, alts]) {
      const copytext = alts
        ? _('addAltToLinkText', arr0, alts.join(_('altJoin')))
        : arr0;
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
* @param {string} pref
* @returns {void}
*/
function setByPref (pref) {
  switch (pref) {
  case 'accessFormControls': case 'accessPass':
  case 'immediateFormClickExecution':
    updateFormContextMenuStatus();
    break;
  case 'showAltText': case 'copyLinkTextAccessKey':
  case 'highlightBackgroundColor':
  case 'highlightColor': case 'highlightingEnabled':
    updateLinkContextMenuStatus();
    break;
  default:
    throw new Error('Unknown pref supplied to setByPref ' + pref);
  }
}

browser.contextMenus.create({
  id: 'copylinktext',
  title: _('copyalttextContext.label'),
  contexts: ['all']
});
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'copylinktext') {
    return;
  }
  const results = await browser.tabs.executeScript({
    code: "typeof CopyLinkText === 'object';"
  });
  if (!results || results[0] !== true) {
    await browser.tabs.executeScript({
      allFrames: true,
      file: '/data/alt-context-menu.js', // Cross-browser to use absolute path
      runAt: 'document_start'
    });
  }
});

cm.Item({
  // Already accessible on 'View image info'->Associated text, but we'll
  //   allow more direct access
  label: _('copyalttextContext.label'),
  accesskey: _('copyalttextContext.accesskey'),
  context: cm.SelectorContext('img'),
  contentScriptFile: data.url('alt-context-menu.js'),
  onMessage (txt) {
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
