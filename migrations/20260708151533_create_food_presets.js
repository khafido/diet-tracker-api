exports.up = function (knex) {
  return knex.schema.createTable('food_presets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('name').notNullable();
    table.decimal('calories_per_100g');
    table.decimal('protein_per_100g');
    table.decimal('carbs_per_100g');
    table.decimal('fat_per_100g');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('food_presets');
};
