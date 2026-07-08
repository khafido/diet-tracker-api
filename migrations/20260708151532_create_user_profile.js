exports.up = function (knex) {
  return knex.schema.createTable('user_profile', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('age').notNullable();
    table.text('sex').notNullable();
    table.decimal('height_cm').notNullable();
    table.decimal('weight_kg').notNullable();
    table.text('activity_level').notNullable();
    table.text('goal_type').notNullable().defaultTo('maintain');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
    .then(() => knex.raw('ALTER TABLE user_profile ADD CONSTRAINT age_check CHECK (age > 0)'))
    .then(() => knex.raw('ALTER TABLE user_profile ADD CONSTRAINT sex_check CHECK (sex IN (\'male\',\'female\'))'))
    .then(() => knex.raw('ALTER TABLE user_profile ADD CONSTRAINT height_cm_check CHECK (height_cm > 0)'))
    .then(() => knex.raw('ALTER TABLE user_profile ADD CONSTRAINT weight_kg_check CHECK (weight_kg > 0)'))
    .then(() => knex.raw('ALTER TABLE user_profile ADD CONSTRAINT activity_level_check CHECK (activity_level IN (\'sedentary\',\'light\',\'moderate\',\'active\',\'very_active\'))'))
    .then(() => knex.raw('ALTER TABLE user_profile ADD CONSTRAINT goal_type_check CHECK (goal_type IN (\'cut\',\'maintain\',\'bulk\'))'));
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_profile');
};
