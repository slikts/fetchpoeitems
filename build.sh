#!/bin/sh

filename=bookmarklet.js

echo -n "javascript:(function(){"`./node_modules/@babel/cli/bin/babel.js lib/fetch.js | ./node_modules/uglify-js/bin/uglifyjs`"})()"> $filename