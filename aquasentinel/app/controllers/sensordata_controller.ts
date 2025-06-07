import type { HttpContext } from '@adonisjs/core/http'
import SensorData from '#models/sensor_datum'
import { schema } from '@adonisjs/validator'

export default class SensorDataController {
  async index({ response }: HttpContext) {
    const data = await SensorData.all()
    return response.ok(data)
  }

  async store({ request, response }: HttpContext) {
    const sensorSchema = schema.create({
      location: schema.string(),
      temperature: schema.number.optional(),
      humidity: schema.number.optional(),
      rainfall: schema.number.optional(),
      waterLevel: schema.number.optional(),
      recordedAt: schema.date.optional(),
    })

    const payload = await request.validate({ schema: sensorSchema })
    const data = await SensorData.create(payload)
    return response.created(data)
  }
}