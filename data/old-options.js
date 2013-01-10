function PreferencesSystem (EXT_BASE) {

    var Cc = Components.classes;
    var Ci = Components.interfaces;
    var _prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
    var _branch = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).
                                            getBranch(EXT_BASE);
    var _defaultBranch = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).
                                            getDefaultBranch('extensions.copylinktext.');

    function $ (id) {
        return document.getElementById(id);
    }

    PreferencesSystem = function PreferencesSystem () {
    }
    PreferencesSystem.prototype.setupStringTextboxElements = function () {
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            $(EXT_BASE+arg).value = _branch.getComplexValue(arg, Ci.nsIPrefLocalizedString).data;
        }
    };
    PreferencesSystem.prototype.setupCheckboxElements = function () {
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            $(EXT_BASE+arg).checked = _prefs.getBoolPref(EXT_BASE+arg);
        }
    };
    PreferencesSystem.prototype.setupIntegerTextboxElements = function () { // Integer textboxes
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            $(EXT_BASE+arg).value = _prefs.getIntPref(EXT_BASE+arg);
        }
    };

    PreferencesSystem.prototype.resetDefaults = function () {
        // _defaultBranch;
    };
    
    // CLASS METHODS
    PreferencesSystem.makeDependent = function (toggling, reference, inverse) {
        // Allow to pass in full or bare string
        toggling = toggling.replace(EXT_BASE, '');
        reference = reference.replace(EXT_BASE, '');
        $(EXT_BASE+toggling).disabled = inverse ? $(EXT_BASE+reference).checked : 
                                                                                            !$(EXT_BASE+reference).checked;
    };
    PreferencesSystem.setPrefs = function(e) {
        switch (e.target.nodeName) {
            case 'textbox':
                var temp1 = Cc['@mozilla.org/pref-localizedstring;1'].createInstance(Ci.nsIPrefLocalizedString);
                temp1.data = e.target.value;
                _prefs.setComplexValue(EXT_BASE+e.target.id.replace(EXT_BASE, ''),
                                                                                Ci.nsIPrefLocalizedString, temp1);
                break;
            case 'menuitem':
                _prefs.setCharPref(e.target.parentNode.parentNode.id, e.target.value); // Could use @label or position as default value
                break;
            case 'checkbox':
                // Apparently hasn't changed yet, so use the opposite
                _prefs.setBoolPref(e.target.id, Boolean(!e.target.checked));
                break;
            case 'radio':
                var radioid;
                var result = e.target.id.match(/^_([0-9])+-(.*)$/);
                if (result !== null) {
                    radioid = result[2]; // Extract preference name
                    if (result[1] === '1') {
                        _prefs.setBoolPref(radioid, true);
                    }
                    else {
                        _prefs.setBoolPref(radioid, false);
                    }
                }
                break;
            default:
                break;
        }
    };
}

function $ (id) {
    return document.getElementById(id);
}

function resetDefaults () {
    ps.resetDefaults();
}

PreferencesSystem('extensions.copylinktext.'); // Configure for each extension (only need one copy)
var ps = new PreferencesSystem();
ps.setupCheckboxElements('accessPass', 'accessFormControls');
PreferencesSystem.makeDependent('accessPass', 'accessFormControls');

accessFormControls
accessFormControls.label
    PreferencesSystem.setPrefs(e);
    PreferencesSystem.makeDependent('accessPass', e.target.id, '=inverse');
accessPass
accessPass.label
    PreferencesSystem.setPrefs(e);

