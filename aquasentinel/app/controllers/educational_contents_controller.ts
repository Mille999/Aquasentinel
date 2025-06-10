import type { HttpContext } from '@adonisjs/core/http'
import EducationalContent from '#models/educational_content'
import Forecast from '#models/forecast'
import { schema } from '@adonisjs/validator'

export default class EducationalContentController {
  async index({ view, request }: HttpContext) {
    const category = request.input('category')
    const query = EducationalContent.query().preload('user').preload('forecast')

    if (category) {
      query.where('category', category)
    }

    const contents = await query
    return view.render('educational_contents/index', { contents, category })
  }


  /**
   * Displays the form to create new educational content.
   */
  async create({ view }: HttpContext) {
    const forecasts = await Forecast.query()
    return view.render('educational_contents/create', { forecasts })
  }

  /**
   * Stores new educational content.
   * Validates the input and associates it with the authenticated user.
   */

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
    const id = Number(params.id)

    console.log(`Fetching content with ID: ${id}`) // Debugging line
    // Validate the ID
    console.log('params.id =', params.id)
    console.log('typeof params.id =', typeof params.id)


    if (isNaN(id) || id < 1) {
      return response.badRequest({ message: 'Invalid content ID' })
    }

    const content = await EducationalContent.query()
      .where('id', id)
      .preload('user')
      .preload('forecast')
      .first()

    if (!content) {
      return response.notFound({ message: 'Content not found' })
    }

    return response.ok(content)
  }

  /**
   * Displays educational content by category.
   */
  async byCategory({ params, view }: HttpContext) {
    const category = params.category
    const contents = await EducationalContent.query()
      .whereRaw('LOWER(category) = ?', [category.toLowerCase()])
      .preload('user')
      .preload('forecast')

    return view.render('educational_contents/category', { contents, category })
  }

  /**
   * Displays detailed educational content.
   */
  async showDetail({ params, view }: HttpContext) {
    const tip = await EducationalContent.findOrFail(params.id)
    await tip.load('user')
    await tip.load('forecast')

    return view.render('educational_contents/detail', { tip })
  }


  /**
   * Updates an educational content.
   * Only the owner can update their content.
   */

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


  /**
   * Deletes an educational content.
   * Only the owner can delete their content.
   */

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