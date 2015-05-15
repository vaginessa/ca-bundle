denschub/ca-bundle
==================

This is my personal ca-bundle containing CAs I consider trustworthy enough to
be included in my systems configuration. It is mostly based on the CAs
[included in Mozilla Firefox](https://hg.mozilla.org/mozilla-central/raw-file/default/security/nss/lib/ckfw/builtins/certdata.txt)
with my own removals and additions.

Do not use it unless you really know what you are doing and checked the list of
included CAs. I am not responsible for man-in-the-middled sessions and injured
kittens.

`ca-bundle/`
------------

This folder contains CA certificates that can be used for SSL. Concatinaion
to a single file may be required in your use case.

`fx-bundle/`
------------

The JSON dump called `fx-bundle.json` was created by
[fx-catrustmanager](https://github.com/denschub/fx-catrustmanager) and can be
imported using it.
