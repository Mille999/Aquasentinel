import type { HttpContext } from '@adonisjs/core/http'
import Forecast from '#models/forecast'
import { schema } from '@adonisjs/validator'
import SensorData from '#models/sensor_datum'

export default class ForecastController {
  async index({ response }: HttpContext) {
    const forecasts = await Forecast.query().preload('sensorData')
    return response.ok(forecasts)
  }

  async store({ request, response }: HttpContext) {
    const forecastSchema = schema.create({
      riskType: schema.string(),
      riskLevel: schema.string(),
      message: schema.string(),
      sensorId: schema.number(),
      region: schema.string(),
      forecastDate: schema.date(),})

    const payload = await request.validate({ schema: forecastSchema })
    const sensor = await SensorData.find(payload.sensorId)
    if (!sensor) {
      return response.badRequest({ message: 'Capteur introuvable.' })
    }

    const forecast = await Forecast.create(payload)
    return response.created(forecast)
  }

  async show({ params, response }: HttpContext) {
    const forecast = await Forecast.find(params.id)
    if (!forecast) return response.notFound()
    await forecast.load('sensorData')
    return response.ok(forecast)
  }

  async update({ params, request, response }: HttpContext) {
    const forecast = await Forecast.find(params.id)
    if (!forecast) return response.notFound()

    const updateSchema = schema.create({
      riskType: schema.string.optional(),
      riskLevel: schema.string.optional(),
      message: schema.string.optional(),
      sensorId: schema.number.optional(),
      region: schema.string.optional(),
      forecastDate: schema.date.optional(),
    })

    const data = await request.validate({ schema: updateSchema })
    forecast.merge(data)
    await forecast.save()
    return response.ok(forecast)
  }

  async destroy({ params, response }: HttpContext) {
    const forecast = await Forecast.find(params.id)
    if (!forecast) return response.notFound()
    await forecast.delete()
    return response.ok({ message: 'Forecast deleted' })
  }
}
