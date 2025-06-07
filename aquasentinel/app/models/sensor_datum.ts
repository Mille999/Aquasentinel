import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Forecast from '#models/forecast'

export default class SensorData extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
   @column()
  declare location: string

  @column()
  declare temperature: number

  @column()
  declare humidity: number

  @column()
  declare rainfall: number

  @column()
  declare waterLevel: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Forecast, {
    foreignKey: 'basedOnSensor',
  })
  declare forecasts: HasMany<typeof Forecast>
}