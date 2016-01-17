#!/bin/sh

filename=bookmarklet.js

echo -n "javascript:(function(){"`babel fetch.js | uglifyjs`"})()"> $filename
#echo -n "})();">> $filename