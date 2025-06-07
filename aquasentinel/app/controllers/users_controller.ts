import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { schema, rules } from '@adonisjs/validator'
import { parsePhoneNumberFromString } from 'libphonenumber-js'


export default class UsersController {
  // Affiche le profil de l'utilisateur connecté
  async show({ auth, view }: HttpContext) {
    const user = auth.user
    if (!user) {
      return view.render('auth/login')
    }

    return view.render('auth/profile', { user })
  }

  // Mise à jour du profil
  async update({ auth, request, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Vous devez être connecté.')
    }

     const updateSchema = schema.create({
      username: schema.string.optional([rules.minLength(3)]),
      email: schema.string.optional([rules.email()]),
      password: schema.string.optional([rules.minLength(6)]),
      firstName: schema.string.optional(),
      lastName: schema.string.optional(),
      phone_number: schema.string.optional([
        rules.mobile()
      ]),
    })

    const data = await request.validate({ schema: updateSchema })

    // Vérifier unicité manuelle
    if (data.phone_number) {
      const existingPhone = await User.query()
        .where('phone_number', data.phone_number)
        .whereNot('id', user.id)
        .first()

      if (existingPhone) {
        return response.badRequest({ error: 'Ce numéro de téléphone est déjà utilisé.' })
      }

      // Vérifier validité du numéro
      const parsed = parsePhoneNumberFromString(data.phone_number)
      if (!parsed?.isValid()) {
        return response.badRequest({ error: 'Numéro de téléphone invalide.' })
      }

      // Optionnel : logger ou stocker l’indicatif pays
      const country = parsed.country
      const callingCode = parsed.countryCallingCode
      console.log('Pays détecté :', country, 'Indicatif :', callingCode)
    }

    const existing = await User.query()
      .where((query) => {
        if (data.email) query.where('email', data.email)
        if (data.username) query.orWhere('username', data.username)
      })
      .whereNot('id', user.id)
      .first()

    if (existing) {
      return response.badRequest({ error: 'Email ou nom d’utilisateur déjà utilisé.' })
    }

    user.merge(data)
    await user.save()
    return response.redirect('/auth/profile')
  }

  // Suppression du compte utilisateur
  async destroy({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized('Vous devez être connecté.')
    }

    await user.delete()
    await auth.use('web').logout()
    return response.redirect('/auth/login')
  }
}