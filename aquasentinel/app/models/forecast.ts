import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import SensorData from '#models/sensor_datum'
import Alert from '#models/alert'
import EducationalContent from '#models/educational_content'
import Investment from '#models/investment'

import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Forecast extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare riskType: string

  @column()
  declare riskLevel: string

  @column()
  declare message: string

  @column()
  declare basedOnSensor: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

   @belongsTo(() => SensorData, {
    foreignKey: 'basedOnSensor',
  })
  declare sensorData: BelongsTo<typeof SensorData>

  @hasMany(() => Investment)
  declare investments: HasMany<typeof Investment>

  @hasMany(() => Alert)
  declare alerts: HasMany<typeof Alert>

  @hasMany(() => EducationalContent)
  declare educationalContents: HasMany<typeof EducationalContent>

}