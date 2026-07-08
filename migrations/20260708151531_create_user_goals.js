exports.up = function (knex) {
  return knex.schema.createTable('user_goals', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('daily_calories');
    table.decimal('protein');
    table.decimal('carbs');
    table.decimal('fat');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_goals');
};
