import type { HttpContext } from '@adonisjs/core/http'
import Alert from '#models/alert'
import Forecast from '#models/forecast'
import { schema } from '@adonisjs/validator'


export default class AlertController {
async index({ view }: HttpContext) {
    let alerts = await Alert.query().preload('forecast');

    if (alerts.length === 0) {
        alerts = [
            {
                message: 'Severe storm approaching coastal regions.',
                region: 'Coastal Zone',
                alertType: 'weather',
                forecast: { title: 'Heavy Rain & Winds Expected' },
            },
            {
                message: 'Air pollution levels rising beyond safe limits.',
                region: 'Urban Center',
                alertType: 'environmental',
                forecast: { title: 'Air Quality Monitoring' },
            },
            {
                message: 'Landslide risk due to recent heavy rainfall.',
                region: 'Mountain Range',
                alertType: 'weather',
                forecast: { title: 'Potential Landslide Warning' },
            },
            {
                message: 'Infrastructure damage warning due to extreme weather conditions.',
                region: 'Residential Area',
                alertType: 'other',
                forecast: { title: 'Structural Stability Report' },
            },
            {
                message: 'Water contamination detected, avoid drinking from local supply.',
                region: 'Village District',
                alertType: 'environmental',
                forecast: { title: 'Water Quality Alert' },
            },
        ] as any[];
    }

    return view.render('pages/alerts', { alerts });
}

  async store({ request, response }: HttpContext) {
    const alertSchema = schema.create({
      forecastId: schema.number(),
      message: schema.string(),
      region: schema.string(),
      alertType: schema.enum(['weather' , 'environmental' , 'other'] as const),
    })

    const payload = await request.validate({ schema: alertSchema })

     const forecast = await Forecast.find(payload.forecastId)
    if (!forecast) {
      return response.badRequest({ message: 'Prévision introuvable.' })
    }
    
    const alert = await Alert.create(payload)
    return response.created(alert)
  }
  async byLocation({ request, response }: HttpContext) {
    const latitude = request.input('lat')
    const longitude = request.input('lon')
    if (!latitude || !longitude) {
      return response.badRequest({ message: 'Latitude and longitude are required.' })
    }
    const alerts = await Alert.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .preload('forecast')
    if (alerts.length === 0) {
      return response.notFound({ message: 'No alerts found for this location.' })
    }
    return response.ok(alerts)
  }

  async show({ params, view }: HttpContext) {
    const alert = await Alert.query()
      .where('id', params.id)
      .preload('forecast')
      .firstOrFail()

    return view.render('pages/alerts', { alert })
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