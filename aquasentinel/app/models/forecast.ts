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
  declare title: string

  @column()
  declare riskType: string

  @column()
  declare riskLevel: string

  @column()
  declare message: string

  @column()
  declare basedOnSensor: number

  @column()
  declare region: string

  @column()
  declare waterLevel: number | null

  @column()
  declare rainfall: number | null

  @column()
  declare soilMoisture: number | null

  @column()
  declare temperature: number | null

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column.dateTime()
  declare forecastDate: DateTime | null


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