# copylinktext

Repo for new restartless version of https://addons.mozilla.org/en-US/firefox/addon/copy-link-text-4750/ .

# To-dos
1. Investigate [issue #6](https://github.com/brettz9/copylinktext/issues/6)

# Possible user-facing to-dos
1. Could try to make work with main browser XUL
2. Optional ability to get input type hidden, optgroup text?, get form and form control names?
3. Move non-links/img alt text retrieval to separate add-on?
4. Make option to grab label text for elements
5. Revisit image copying and password copying (to avoid showing what is being copied)
6. Resubmit to Babelzilla to ensure new items are also localized
7. Localize title and description of add-on itself?

# Other to-dos

After FF releases v35, change "engines" in package.json accordingly and run against the "jpm" tool (jpm is not working for anything less than FF 35 apparently). At that time, the copylinktext.xpi file can also be removed from the repo in favor of the copylinktext@brett.zamir.xpi file. Note at that time that accesskey should have become functional (as it is in my testing).

Other possible coding todos listed in comments at top of https://github.com/brettz9/copylinktext/blob/master/lib/main.js
