/* globals strings */
function _ (str) { // require('l10n').get
  'use strict';
  return strings[str];
}

function getMultiple (sel) {
  'use strict';
  const selectedContent = [], selectedValues = [];
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].selected) {
      selectedContent.push(sel.options[i].textContent);
      selectedValues.push(sel.options[i].value);
    }
  }
  return [selectedContent, selectedValues];
}

function mouseDown (el) { // eslint-disable-line no-unused-vars
  'use strict';
  let labelText, textContent, value;
  const nodeName = el.nodeName.toLowerCase(),
    labels = document.querySelector('label');
  for (let i = 0; i < labels.length; i++) {
    if (labels[i].hasAttribute('for') &&
      labels[i].getAttribute('for') === el.id
    ) {
      labelText = labels[i].textContent;
      break;
    }
  }
  switch (nodeName) {
  default:
    break;
  // Todo: input type hidden, optgroup?, get form and form control names?
  case 'option':
    el = el.parentNode;
    /* Fall-through */
  case 'select': // eslint-disable-line no-fallthrough
    if (el.multiple) {
      const optProps = getMultiple(el);
      textContent = optProps[0].join(_('joinOptsText'));
      value = optProps[1].join(_('joinOpts'));
    } else {
      const opt = el.options[el.selectedIndex]; // Use option instead
      // Since we are getting for option, any label cannot be added here
      ({textContent} = opt);
      ({value} = opt);
    }
    break;
  case 'button':
    textContent = el.textContent || labelText || '';
    ({value} = el);
    break;
  case 'input':
    // Useful for type=password, (if enabled)
    // (checkbox, radio),
    // (button, submit, reset),
    // file, image
    // (not getting hidden)
    if (el.type !== 'image') {
      // textContent doesn't seem to work for these types
      textContent = el.textContent || labelText || '';
      // Could shorten menu below to avoid this, since is always the same
      ({value} = el);
      // value = el.name;
      break;
    }
    /* Fall-through for image */
  case 'img': // eslint-disable-line no-fallthrough
    // Already accessible on "View image info"->Associated text,
    //   but we'll add it automatically to the clipboard
    // Not in use?
    textContent = el.alt; // Fix: Could also add any text content, label, etc.
    value = el.src; // Fix: could add el.value?
    break;
  }

  return [value, textContent, labelText];
}
