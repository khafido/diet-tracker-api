const fs = require('fs');
const path = require('path');

exports.seed = async function (knex) {
  await knex('global_food_presets').del();

  const filePath = path.join(__dirname, '..', '..', 'docs', 'global-presets-seeder.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const presets = JSON.parse(raw);

  const rows = presets.map(({ id, ...rest }) => rest);

  await knex('global_food_presets').insert(rows);
};
