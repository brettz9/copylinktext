/*global strings, self*/
function _ (str) {// require('l10n').get
    'use strict';
    return strings[str];
}

function getMultiple (sel) {
    'use strict';
    var i, selectedContent = [], selectedValues = [];
    for (i = 0; i < sel.options.length; i++) {
        if (sel.options[i].selected) {
            selectedContent.push(sel.options[i].textContent);
            selectedValues.push(sel.options[i].value);
        }
    }
    return [selectedContent, selectedValues];
}

function mouseDown (el) {
    'use strict';
    var i, opt, optProps, labelText,
        textContent, value,
        nodeName = el.nodeName.toLowerCase(),
        labels = document.getElementsByTagName('label');
    for (i = 0; i < labels.length; i++) {
        if (labels[i].hasAttribute('for') && labels[i].getAttribute('for') === el.id) {
            labelText = labels[i].textContent;
            break;
        }
    }
    switch(nodeName) {
        // Todo: input type hidden, optgroup?, get form and form control names?
        case 'option':
            el = el.parentNode;
            /*Fall-through*/
        case 'select':
            if (el.multiple) {
                optProps = getMultiple(el);
                textContent = optProps[0].join(_("joinOptsText"));
                value = optProps[1].join(_("joinOpts"));
            }
            else {
                opt = el.options[el.selectedIndex]; // Use option instead
                textContent = opt.textContent; // Since we are getting for option, any label cannot be added here
                value = opt.value;
            }
            break;
        case 'button':
            textContent = el.textContent || labelText || '';
            value = el.value;
            break;
        case 'input': // Useful for type=password, (if enabled)
                                 // (checkbox, radio),
                                 // (button, submit, reset),
                                 // file, image
                                 // (not getting hidden)
            if (el.type !== 'image') {
                textContent = el.textContent || labelText || ''; // textContent doesn't seem to work for these types
                value = el.value; // Could shorten menu below to avoid this, since is always the same
                // value = el.name;
                break;
            }
            /* Fall-through for image*/
        case 'img': // Already accessible on "View image info"->Associated text, but we'll add it automatically to the clipboard
            // Not in use?
            textContent = el.alt; // Fix: Could also add any text content, label, etc.
            value = el.src; // Fix: could add el.value?
            break;
    }

    return [value, textContent, labelText];
}
