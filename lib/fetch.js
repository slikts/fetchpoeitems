var modNames = [
  [['All Attributes'], 'All'],
  [['Intelligence'], 'Int'],
  [['Strength'], 'Str'],
  [['Dexterity'], 'Dex'],

  [['All Elemental Resistances'], 'All'],
  [['Fire Resistance', "Fire and Cold Resistances", "Fire and Lightning Resistances", "Fire and Chaos Resistances"], 'Fire'],
  [['Cold Resistance', "Fire and Cold Resistances", "Cold and Lightning Resistances", "Cold and Chaos Resistances"], 'Cold'],
  [['Lightning Resistance', "Fire and Lightning Resistances", "Lightning and Chaos Resistances", "Cold and Lightning Resistances"], 'Lightn'],
  [['Chaos Resistance', "Fire and Chaos Resistances", "Lightning and Chaos Resistances", "Cold and Chaos Resistances"], 'Chaos'],

  [['Maximum Life'], 'Life'],
  [['Maximum Mana'], 'Mana'],
  [['Maximum Energy Shield'], 'ES'],
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
    .forEach(item => items[item.inventoryId] = merge([item.implicitMods, item.explicitMods, item.craftedMods].filter(x => x).map(parseMods)))
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
  // console.log("modlist", modList)
  modList.forEach(mod => Object.keys(mod).forEach(key => merged[key] = merged[key] + mod[key] || mod[key]))
  // console.log("merged", merged)
  return merged
}

function upperFirst(x) {
  return x[0].toUpperCase() + x.substr(1)
}

function makeTableText(items) {
// var x = function(items) {

  // items = {
  //   "Amulet": {
  //     "All Attributes": 13,
  //     "All Elemental Resistances": 5,
  //     "Cold Resistance": 46,
  //     "Intelligence": 43,
  //     "Maximum Life": 87
  //   },
  //   "Belt": {
  //     "Chaos Resistance": 30,
  //     "Cold Resistance": 43,
  //     "Lightning Resistance": 18,
  //     "Maximum Energy Shield": 25,
  //     "Maximum Life": 29,
  //     "Maximum Mana": 24
  //   },
  //   "BodyArmour": {
  //     "Maximum Life": 98
  //   },
  //   "Boots": {
  //     "Fire Resistance": 42,
  //     "Lightning Resistance": 27
  //   },
  //   "Gloves": {
  //     "Evasion Rating": 29,
  //     "Fire Resistance": 27,
  //     "Lightning Resistance": 14,
  //     "Maximum Life": 27
  //   },
  //   "Helm": {
  //     "Dexterity": 44,
  //     "Evasion Rating": 64,
  //     "Maximum Life": 127
  //   },
  //   "Offhand": {
  //     "Chaos Resistance": 12,
  //     "Maximum Life": 70
  //   },
  //   "Ring": {
  //     "Cold Resistance": 39,
  //     "Fire and Cold Resistances": 13,
  //     "Maximum Energy Shield": 5,
  //     "Maximum Life": 79,
  //     "Maximum Mana": 37
  //   },
  //   "Ring2": {
  //     "Chaos Resistance": 13,
  //     "Fire Resistance": 42,
  //     "Maximum Energy Shield": 6,
  //     "Maximum Life": 79
  //   },
  //   "Weapon": {
  //     "Global Critical Strike Multiplier": 22
  //   }
  // }


  // Makes a tab delimited file. eample output

  // Ctrl+V  Amulet  Ring  Ring2 Helm  BodyArmour  Belt  Gloves  Boots Weapon  Offhand
  // All 13
  // Int 43
  // Str
  // Dex       44
  // All 5
  // Fire      42        27  42
  // Cold  46  39        43
  // Lightn            18  14  27
  // Chaos     13      30        12
  // Life  87  79  79  127 98  29  27      70
  // Mana    37        24
  // ES    5 6     25

  // Create an array of arrays. the first array is the headers
  var table = [['Ctrl+V'].concat(inventoryIds)]

    // Creates a row for each stat we configured
    .concat(
      modNames.map(

        // This is the target stat for this row
        ([long, short]) => {

          // First column is the stat label followed by each items total
          return [short].concat(inventoryIds.map(id => {

            var value = 0
            // console.log("items[id]:", items[id])

            for (var attribute in items[id]) {

              if (long.includes(attribute)) {
                value += items[id][attribute]
                // console.log("attr value", items[id][attribute])
              }
            }

            // TODO what about all resistances?
            // console.log(short, " total: ", value)

            if (value === 0) {
              return
            }
            return value

            // Return the total here
            // TODO this is the defect. we need to grab multiple attributes and add them up here!
            // return items[id][long]
          }))
        }
      )
    )

    // Make this a tab delimited file that google sheets is expecting
    .map(
      row => row.join(String.fromCharCode(9))
    ).join('\n')

  return table
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