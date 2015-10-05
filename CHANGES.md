# 1.8.0
- Add support for private window browsing

# 1.7.2
- jpm build

# 1.7.1
- Fix bug for form controls that are not immediately executed
- Fix build to work again for pre-FF35 browsers

# 1.7.0
- Support customizable accesskey (to arrive in FF 35)

# 1.6.1, 1.6.2, 1.6.3
- Restartless version
- Added accesskey (to arrive in FF 35)
- Make default off for including alt text within link text
- Change text displayed on context menu when grabbing non-link form control text
- Avoid displaying password context menu if not enabled
- Give option whether to immediately execute on context event or require explicit click of menu item

# 1.5.3
- Revert as wasn't working (and FF16 didn't complain); reinstate Thunderbird support

# 1.5.2
- Fix for Firefox 16 compatibility

# 1.5.1
- Added locales: tr-TR, sv-SE (thanks dr.can, Lakrits!)

# 1.5.0
- Added locales: pt-PT (thanks lloco!)

# 1.4.9
- Fix for preference checking
- Added Songbird, Thunderbird support

# 1.4.8
- Added locales: nl (thanks Ruffnekk!)

# 1.4.7
- Added locales: es-ES (thanks tito!)

# 1.4.6
- Added locales: zh-TW (thanks TKY!)

# 1.4.5
- Added locales: pt-BR, sr-RS (thanks Edgard Magalhaes, DakSrbija!)

# 1.4.4
- Added locales: zh-CN, fr, de-DE (thanks xf_mao, Bilouba, erglo!)

# 1.4.3
- Disable feature for all regular textboxes; no real need anyways and
-  could conflict with some features like select-all or paste
- Since 1.4.2, reenabling for other input fields except for password
-   when text is selected (though users may still wish to disable for
-   password fields for security or to be able to select-all/paste into
-   the field)

# 1.4.2
- Setting accessFormControls to false by default
- Only allow form controls right-click to override default 
-    if the user has not selected text within the input field;
-   this should, for some users, actually allow accessFormControls
-   to be always turned on (unless a webpage has its own
-   right-click handlers which is very rare)
- My apologies to my users for not having anticipated 
-  conflicts here with right-click inside content areas;
-  I really believe you can even turn accessFormControls back on,
-  now but to be safe, I've turned it off by default for new 
-  users; if the setting doesn't get turned off for you, just go to 
-  Tools->Addons->Copy Link Text->Options and turn off one or both
-  of the options; but I hope you will try it on because I
-  think this should now let you have access to the new functionality
-  without conflict with pre-existing functionality
- Please feel free to report any issues or requests on my blog:
-  http://blog.brett-zamir.me/?p=55
- Added locales ja-JA (thanks Haebaru!) and ru-RU (thanks PiVV!)

# 1.4.1
- Offered preferences to disable right-click access to 
-    form controls or password fields specifically

# 1.4
- Added support for img alt text within links
- Right-click on select menu options (including multiple 
select), password inputs, checkboxes and radio controls, 
buttons (input, image, regular, submit, or reset), or file 
input to get their text, value, or label (for image buttons, 
this is the alt text and image source)

# 1.3.2
- Updated to FF3b2

# 1.3.1
- Updated to FF3b1
- Avoided occasional error console message