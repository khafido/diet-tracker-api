import { types } from 'pg';
// @ts-expect-error - knexfile is a JS config file
import knexConfig from '../knexfile';
import knex from 'knex';

types.setTypeParser(1082, (val) => val);

const db = knex(knexConfig.development);

export default db;
