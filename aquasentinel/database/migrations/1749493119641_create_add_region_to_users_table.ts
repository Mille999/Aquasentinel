import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'add_region_to_users'

  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('region').nullable()
    })
  }

  public async down () {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('region')
    })
  }
}