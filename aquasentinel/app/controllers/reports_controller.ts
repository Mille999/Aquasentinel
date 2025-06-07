import type { HttpContext } from '@adonisjs/core/http'
import Report from '#models/report'

export default class ReportsController {
    /**
     * Fetches all reports from the database.
     * @param {HttpContext} ctx - The HTTP context.
     * @returns {Promise<Array>} - A promise that resolves to an array of reports.
     */
    public async index({ response }: HttpContext) {
        try {
        const reports = await Report.all()
        return response.json(reports)
        } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch reports' })
        }
    }

    /**
     * Fetches a specific report by its ID.
     * @param {HttpContext} ctx - The HTTP context.
     * @param {string} id - The ID of the report to fetch.
     * @returns {Promise<Object>} - A promise that resolves to the report object.
     */
    public async show({ params, response }: HttpContext) {
        const { id } = params
        try {
            const report = await Report.findOrFail(id)
            return response.json(report)
        } catch (error) {
            return response.status(404).json({ error: 'Report not found' })
        }
    }

    /**
     * Deletes a specific report by its ID.
     * @param {HttpContext} ctx - The HTTP context.
     * @param {string} id - The ID of the report to delete.
     * @returns {Promise<Object>} - A promise that resolves to a success message.
     */
    public async destroy({ params, response }: HttpContext) {
        const { id } = params
        try {
            const report = await Report.findOrFail(id)
            await report.delete()
            return response.json({ message: 'Report deleted successfully' })
        } catch (error) {
            return response.status(404).json({ error: 'Report not found' })
        }
    }

    /**
     * Updates a specific report by its ID.
     * @param {HttpContext} ctx - The HTTP context.
     * @param {string} id - The ID of the report to update.
     * @param {Object} data - The data to update the report with.
     * @returns {Promise<Object>} - A promise that resolves to the updated report object.
     */
    public async update({ params, request, response }: HttpContext) {
        const { id } = params
        const data = request.only(['title', 'content', 'status'])
        try {
            const report = await Report.findOrFail(id)
            report.merge(data)
            await report.save()
            return response.json(report)
        } catch (error) {
            return response.status(404).json({ error: 'Report not found' })
        }
    }

    /**
     * Creates a new report.
     * @param {HttpContext} ctx - The HTTP context.
     * @param {Object} data - The data for the new report.
     * @returns {Promise<Object>} - A promise that resolves to the created report object.
     */
    public async store({ request, response }: HttpContext) {
        const data = request.only(['title', 'content', 'status'])
        try {
            const report = await Report.create(data)
            return response.status(201).json(report)
        } catch (error) {
            return response.status(400).json({ error: 'Failed to create report' })
        }
    }
    
    /**
     * Fetches reports based on a specific status.
     * @param {HttpContext} ctx - The HTTP context.
     * @param {string} status - The status criteria for fetching reports.
     * @returns {Promise<Array>} - A promise that resolves to an array of reports with the specified status.
     */
    public async status({ request, response }: HttpContext) {
        const status = request.input('status', '')
        try {
            const reports = await Report.query().where('status', status)
            return response.json(reports)
        } catch (error) {
            return response.status(500).json({ error: 'Failed to fetch reports by status' })
        }
    }

}