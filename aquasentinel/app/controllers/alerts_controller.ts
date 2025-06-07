import type { HttpContext } from '@adonisjs/core/http'
import Alert from '#models/alert'
import Forecast from '#models/forecast'
import { schema } from '@adonisjs/validator'


export default class AlertController {
  async index({ response }: HttpContext) {
    const alerts = await Alert.query().preload('forecast')
    return response.ok(alerts)
  }

  async store({ request, response }: HttpContext) {
    const alertSchema = schema.create({
      forecastId: schema.number(),
      message: schema.string(),
      region: schema.string(),
      alertType: schema.enum(['sms', 'push', 'banner'] as const),
    })

    const payload = await request.validate({ schema: alertSchema })

     const forecast = await Forecast.find(payload.forecastId)
    if (!forecast) {
      return response.badRequest({ message: 'Prévision introuvable.' })
    }
    
    const alert = await Alert.create(payload)
    return response.created(alert)
  }

  async show({ params, response }: HttpContext) {
    const alert = await Alert.query()
      .where('id', params.id)
      .preload('forecast')
      .firstOrFail()

    return response.ok(alert)
  }

  async destroy({ params, response }: HttpContext) {
    const alert = await Alert.findOrFail(params.id)
    await alert.delete()
    return response.noContent()
  }

  async update({ params, request, response }: HttpContext) {
    const alert = await Alert.findOrFail(params.id)

    const alertSchema = schema.create({
      message: schema.string.optional(),
      region: schema.string.optional(),
      alertType: schema.enum.optional(['sms', 'push', 'banner'] as const),
    })

    const payload = await request.validate({ schema: alertSchema })

    alert.merge(payload)
    await alert.save()

    return response.ok(alert)
  } 
}