import type { HttpContext } from '@adonisjs/core/http'
import EducationalContent from '#models/educational_content'
import Forecast from '#models/forecast' 
import { schema } from '@adonisjs/validator'

export default class EducationalContentController {
  async index({ response }: HttpContext) {
    const contents = await EducationalContent.query().preload('user').preload('forecast')
    return response.ok(contents)
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!

    const contentSchema = schema.create({
      title: schema.string(),
      content: schema.string(),
      category: schema.string(),
      forecastId: schema.number(),
    })

    const payload = await request.validate({ schema: contentSchema })

     const forecast = await Forecast.find(payload.forecastId)
    if (!forecast) {
      return response.badRequest({ message: 'Forecast not found' })
    }

    const content = await EducationalContent.create({ ...payload, userId: user.id })
    return response.created(content)
  }

  async show({ params, response }: HttpContext) {
    const content = await EducationalContent.query()
      .where('id', params.id)
      .preload('user')
      .preload('forecast')
      .firstOrFail()

    return response.ok(content)
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const content = await EducationalContent.findOrFail(params.id)

    if (content.userId !== user.id) {
      return response.forbidden({ message: 'You do not have permission to update this content' })
    }

    const contentSchema = schema.create({
      title: schema.string.optional(),
      content: schema.string.optional(),
      category: schema.string.optional(),
      forecastId: schema.number.optional(),
    })

    const payload = await request.validate({ schema: contentSchema })

    content.merge(payload)
    await content.save()

    return response.ok(content)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const content = await EducationalContent.findOrFail(params.id)

    if (content.userId !== user.id) {
      return response.forbidden({ message: 'You do not have permission to delete this content' })
    }

    await content.delete()
    return response.noContent()
  }
  
}