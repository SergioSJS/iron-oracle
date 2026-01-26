const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./node_modules/@datasworn/starforged/json/starforged.json', 'utf8'));

const ocean = data.oracles.planets.collections.ocean;
const observed = ocean.contents.observed_from_space;

console.log('Observed from space rows:');
observed.rows.forEach(row => {
  if (row.min >= 91 && row.min <= 100) {
    console.log('\n' + row.min + '-' + (row.max || row.min) + ':', row.text);
    console.log('Has oracle_rolls:', !!row.oracle_rolls);
    console.log('Has oracles:', !!row.oracles);
    if (row.oracle_rolls) console.log('oracle_rolls:', row.oracle_rolls);
    if (row.oracles) console.log('oracles:', row.oracles);
  }
});
