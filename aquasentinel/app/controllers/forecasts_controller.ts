import type { HttpContext } from '@adonisjs/core/http'
import Forecast from '#models/forecast'
import { schema } from '@adonisjs/validator'
//import SensorData from '#models/sensor_datum'
import AIAlertService from '#services/ai_alert_service'
import { DateTime } from 'luxon'

export default class ForecastController {
  async index({ view }: HttpContext) {
    let forecasts = await Forecast.query().preload('sensorData');

    if (forecasts.length === 0) {
        forecasts = [
            {
                region: 'Kinshasa',
                forecastDate: DateTime.local(),
                waterLevel: 3.2,
                rainfall: 75,
                soilMoisture: 80,
                temperature: 26,
                riskType: 'Flood',
                riskLevel: 'High',
                message: 'Heavy rainfall expected, risk of flooding in low-lying areas.',
            },
            {
                region: 'Lubumbashi',
                forecastDate: DateTime.local(),
                waterLevel: 1.5,
                rainfall: 20,
                soilMoisture: 60,
                temperature: 30,
                riskType: 'Heatwave',
                riskLevel: 'Medium',
                message: 'Higher temperatures expected, risk of dehydration and heat stroke.',
            },
            {
                region: 'Goma',
                forecastDate: DateTime.local(),
                waterLevel: 2.0,
                rainfall: 50,
                soilMoisture: 70,
                temperature: 24,
                riskType: 'Landslide',
                riskLevel: 'High',
                message: 'Significant rainfall expected in mountainous areas, landslide risk.',
            },
        ] as any[];
    }

    return view.render('pages/forecast', { forecasts });
}


  async store({ request, response }: HttpContext) {
    const forecastSchema = schema.create({
      region: schema.string(),
      waterLevel: schema.number.optional(),
      rainfall: schema.number.optional(),
      soilMoisture: schema.number.optional(),
      temperature: schema.number.optional(),
      forecastDate: schema.date(),

      riskType: schema.string(),    
      riskLevel: schema.string(),       
      message: schema.string(),
    })

    const payload = await request.validate({ schema: forecastSchema })

    const forecast = await Forecast.create(payload)

    // ⚠️ Automatically generate alerts based on the forecast
    await AIAlertService.generateFromForecast(forecast)

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
