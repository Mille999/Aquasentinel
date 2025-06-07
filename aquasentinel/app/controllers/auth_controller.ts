import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { schema, rules } from '@adonisjs/validator'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export default class AuthController {
  // Affiche le formulaire de connexion
  async showLoginForm({ view }: HttpContext) {
    return view.render('auth/login')
  }

  // Connexion utilisateur
  async login({ request, auth, response, session }: HttpContext) {
    const loginSchema = schema.create({
      email: schema.string([rules.email()]),
      password: schema.string([rules.minLength(6)]),
    })

    const { email, password } = await request.validate({ schema: loginSchema })

    try {
      const user = await User.query().where('email', email).first()
      if (!user || !(await user.verifyPassword(password))) {
        session.flash('error', 'Email ou mot de passe incorrect')
        return response.redirect('/auth/login')
      }

      await auth.use('web').login(user)
      return response.redirect('/dashboard')
    } catch (error) {
      session.flash('error', 'Erreur lors de la connexion')
      return response.redirect('/auth/login')
    }
  }

  // Déconnexion utilisateur
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('auth/login')
  }

  // Affiche le formulaire d'enregistrement
  async showRegisterForm({ view }: HttpContext) {
    return view.render('auth/register')
  }

  // Enregistrement d'un utilisateur
  async register({ request, auth, response, session }: HttpContext) {
    const registerSchema = schema.create({
      username: schema.string([rules.minLength(3)]),
      email: schema.string([rules.email()]),
      password: schema.string([rules.minLength(6)]),
      firstName: schema.string(),
      lastName: schema.string(),
      country_code: schema.string(), // e.g. +243
      phone_number: schema.string(), // 👈 required
      role: schema.enum.optional(['citizen', 'admin', 'moderator']),
    })

    const data = await request.validate({ schema: registerSchema })
    const { country_code, phone_number } = data
    const fullPhone = `${country_code}${phone_number}`

    // 🔐 Check for unique email, username, or phone number
    const existing = await User.query()
      .where('email', data.email)
      .orWhere('username', data.username)
      .orWhere('phone_number', data.phone_number)
      .first()

    if (existing) {
      return response.badRequest({ error: 'Email, username, or phone number already in use.' })
    }

    // 📞 Validate and format phone number
    const parsed = parsePhoneNumberFromString(fullPhone)
    if (!parsed?.isValid()) {
      return response.badRequest({ error: 'Invalid phone number format.' })
    }

    // Format the phone number to E.164 (international format)
    data.phone_number = parsed.format('E.164')

    // (Optional) Log the country and calling code
    const country = parsed.country
    const callingCode = parsed.countryCallingCode
    console.log('📞 Detected country:', country, '| Calling code: +' + callingCode)

    // ✅ Create the user and log them in
    const user = await User.create(data)
    await auth.use('web').login(user)
    session.flash('success', 'Registration successful! Welcome.')
    return response.redirect('/')
  }

  // Redirige vers la bonne homepage selon le rôle
  async showDashboard({ auth, view }: HttpContext) {
    await auth.check()
    const user = auth.user!
    return view.render('dashboards/dashboard', { user })
  }
}