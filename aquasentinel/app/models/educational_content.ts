import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'
import Forecast from '#models/forecast'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
// This model represents educational content related to weather events

export default class EducationalContent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column() // Category can be 'flood', 'drought', or 'general'
  declare category: string

  @column()
  declare userId: number

  @column()
  declare forecastId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
    localKey: 'id',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Forecast, {
    foreignKey: 'forecastId',
    localKey: 'id',
  })
  declare forecast: BelongsTo<typeof Forecast>
}