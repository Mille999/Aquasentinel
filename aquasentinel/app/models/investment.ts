import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Forecast from '#models/forecast'

export default class Investment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare amount: number

  @column() // Category can be 'prevention', 'response', or 'repair'
  declare category: string

  @column()
  declare region: string

  @column()
  declare justification: string

  @column()
  declare forecastId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Forecast)
  declare forecast: BelongsTo<typeof Forecast>
}