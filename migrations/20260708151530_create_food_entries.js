exports.up = function (knex) {
  return knex.schema.createTable('food_entries', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();
    table.time('time').notNullable();
    table.text('meal_type').notNullable();
    table.text('name').notNullable();
    table.decimal('weight_g').notNullable();
    table.decimal('calories_per_100g');
    table.decimal('protein_per_100g');
    table.decimal('carbs_per_100g');
    table.decimal('fat_per_100g');
    table.specificType('calories', 'NUMERIC GENERATED ALWAYS AS (weight_g / 100 * COALESCE(calories_per_100g, 0)) STORED');
    table.specificType('protein', 'NUMERIC GENERATED ALWAYS AS (weight_g / 100 * COALESCE(protein_per_100g, 0)) STORED');
    table.specificType('carbs', 'NUMERIC GENERATED ALWAYS AS (weight_g / 100 * COALESCE(carbs_per_100g, 0)) STORED');
    table.specificType('fat', 'NUMERIC GENERATED ALWAYS AS (weight_g / 100 * COALESCE(fat_per_100g, 0)) STORED');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  })
    .then(() => knex.raw('ALTER TABLE food_entries ADD CONSTRAINT meal_type_check CHECK (meal_type IN (\'breakfast\',\'lunch\',\'dinner\',\'snack\'))'))
    .then(() => knex.raw('ALTER TABLE food_entries ADD CONSTRAINT weight_g_check CHECK (weight_g >= 0)'));
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('food_entries');
};
