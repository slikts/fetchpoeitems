#!/bin/sh

filename=bookmarklet.js

echo -n "javascript:(function(){"`babel lib/fetch.js | uglifyjs`"})()"> $filename