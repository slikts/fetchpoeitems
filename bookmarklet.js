javascript:(function(){"use strict";var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i["return"])_i["return"]()}finally{if(_d)throw _e}}return _arr}return function(arr,i){if(Array.isArray(arr)){return arr}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i)}else{throw new TypeError("Invalid attempt to destructure non-iterable instance")}}}();var modNames=[["All Attributes","All"],["Intelligence","Int"],["Strength","Str"],["Dexterity","Dex"],["All Elemental Resistances","All"],["Fire Resistance","Fire"],["Cold Resistance","Cold"],["Lightning Resistance","Lightn"],["Chaos Resistance","Chaos"],["Maximum Life","Life"],["Maximum Mana","Mana"],["Maximum Energy Shield","ES"]];var inventoryIds=["Amulet","Ring","Ring2","Helm","BodyArmour","Belt","Gloves","Boots","Weapon","Offhand"];function parseItems(data){var items={};data.filter(function(x){return inventoryIds.includes(x.inventoryId)}).forEach(function(item){return items[item.inventoryId]=merge([item.implicitMods,item.explicitMods].filter(function(x){return x}).map(parseMods))});return items}function parseMods(rawMods){var mods={};rawMods.map(function(x){return x.match(/\+(\d+)%? to (.+)/)}).filter(function(x){return x}).forEach(function(x){return mods[upperFirst(x[2])]=+x[1]});return mods}function merge(modList){var merged={};modList.forEach(function(mod){return Object.keys(mod).forEach(function(key){return merged[key]=merged[key]+mod[key]||mod[key]})});return merged}function upperFirst(x){return x[0].toUpperCase()+x.substr(1)}function makeTableText(items){return[["Ctrl+V"].concat(inventoryIds)].concat(modNames.map(function(_ref){var _ref2=_slicedToArray(_ref,2);var long=_ref2[0];var short=_ref2[1];return[short].concat(inventoryIds.map(function(id){return items[id][long]}))})).map(function(row){return row.join(String.fromCharCode(9))}).join("\n")}function getFormData(){var data=new FormData;var fields={character:function character(x){return document.querySelector(".characterName").innerHTML},accountName:function accountName(x){return document.querySelector('a[href^="/account/view-profile/"]').getAttribute("href").split("/").reverse()[0]}};Object.keys(fields).forEach(function(name){try{data.append(name,fields[name]())}catch(e){alert("Failed to fetch data, account not logged in?");throw e}});return data}function promptTableText(text){prompt("Ctrl+C",text)}function fetchData(){var host="www.pathofexile.com";var path="/";if(window.location.hostname!==host||window.location.pathname!==path){var newlocation="https://"+host+path;if(confirm("Wrong location, redirect to "+newlocation+"?")){window.location=newlocation;return}}fetch("/character-window/get-items",{method:"POST",body:getFormData(),credentials:"same-origin"}).then(function(response){return response.json()}).then(function(response){return promptTableText(makeTableText(parseItems(response.items)))})}fetchData();})()