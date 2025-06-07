import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Report from '#models/report'
import EducationalContent from '#models/educational_content'
import Investment from '#models/investment'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare role: string|'citizen'| 'admin'| 'moderator'

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Report, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  declare reports: HasMany<typeof Report>

  @hasMany(() => EducationalContent, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  declare educationalContents: HasMany<typeof EducationalContent> 

  @beforeSave ()
  static async beforeSave (user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
  
@hasMany(() => Investment, { foreignKey: 'userId' }) // si un user crée des investissements
  declare investments: HasMany<typeof Investment> 
}