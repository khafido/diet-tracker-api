exports.up = function (knex) {
  return knex.schema.createTable('weight_entries', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();
    table.decimal('weight_kg').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'date']);
  })
    .then(() => knex.raw('ALTER TABLE weight_entries ADD CONSTRAINT weight_kg_check CHECK (weight_kg > 0)'));
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('weight_entries');
};
