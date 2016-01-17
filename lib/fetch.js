var modNames = [
  ['All Attributes', 'All'],
  ['Intelligence', 'Int'],
  ['Strength', 'Str'],
  ['Dexterity', 'Dex'],
  ['All Elemental Resistances', 'All'],
  ['Fire Resistance', 'Fire'],
  ['Cold Resistance', 'Cold'],
  ['Lightning Resistance', 'Lightn'],
  ['Chaos Resistance', 'Chaos'],
  ['Maximum Life', 'Life'],
  ['Maximum Mana', 'Mana'],
  ['Maximum Energy Shield', 'ES'],
]

var inventoryIds = [
  'Amulet',
  'Ring',
  'Ring2',
  'Helm',
  'BodyArmour',
  'Belt',
  'Gloves',
  'Boots',
  'Weapon',
  'Offhand',
]

function parseItems(data) {
  var items = {}
  data.filter(x => inventoryIds.includes(x.inventoryId))
    .forEach(item => items[item.inventoryId] = merge([item.implicitMods, item.explicitMods].filter(x => x).map(parseMods)))
  return items
}

function parseMods(rawMods) {
  var mods = {}
  rawMods.map(x => x.match(/\+(\d+)%? to (.+)/))
    .filter(x => x)
    .forEach(x => mods[upperFirst(x[2])] = +x[1])
  return mods
}

function merge(modList) {
  var merged = {}
  modList.forEach(mod => Object.keys(mod).forEach(key => merged[key] = merged[key] + mod[key] || mod[key]))
  return merged
}

function upperFirst(x) {
  return x[0].toUpperCase() + x.substr(1)
}

function makeTableText(items) {
  return [['Ctrl+V'].concat(inventoryIds)]
    .concat(modNames.map(([long, short]) => [short].concat(inventoryIds.map(id => items[id][long]))))
    .map(row => row.join(String.fromCharCode(9))).join('\n')
}

function getFormData() {
  var data = new FormData()
  var fields = {
    character: x => document.querySelector('.characterName').innerHTML,
    accountName: x => document.querySelector('a[href^="/account/view-profile/"]').getAttribute('href').split('/').reverse()[0]
  }
  Object.keys(fields).forEach(name => {
    try {
      data.append(name, fields[name]())
    } catch (e) {
      alert('Failed to get character, account not logged in?')
      throw e
    }
  })

  return data
}

function promptTableText(text) {
  prompt('Ctrl+C', text)
}

function fetchData() {
  var host = 'www.pathofexile.com'
  var path = '/'
  if (window.location.hostname !== host || window.location.pathname !== path) {
    var newlocation = `https://${host}${path}`
    if (confirm(`Wrong location, redirect to ${newlocation}?`)) {
      window.location = newlocation
      return
    }
  }
  fetch('/character-window/get-items', {
    method: 'POST',
    body: getFormData(),
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then(response => promptTableText(makeTableText(parseItems(response.items))))
}

fetchData()