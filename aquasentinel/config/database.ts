import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: env.get('NODE_ENV') === 'production' ? {
        host: env.get('DB_HOST'),
            port: Number(env.get('DB_PORT')),
            user: env.get('DB_USER'),
            password: env.get('DB_PASSWORD', '') + '', // Ensure password is always a string
            database: env.get('DB_DATABASE'),
            ssl: env.get('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
      }
        : {
          host: env.get('DB_HOST'),
          port: env.get('DB_PORT'),
          user: env.get('DB_USER'),
          password: env.get('DB_PASSWORD','') + '',
          database: env.get('DB_DATABASE'),
        },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig