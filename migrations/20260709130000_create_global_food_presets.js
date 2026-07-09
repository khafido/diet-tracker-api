exports.up = function (knex) {
  return knex.schema.createTable('global_food_presets', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table.text('category');
    table.decimal('calories_per_100g');
    table.decimal('protein_per_100g');
    table.decimal('carbs_per_100g');
    table.decimal('fat_per_100g');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('global_food_presets');
};
