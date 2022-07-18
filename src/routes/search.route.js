const express = require('express');
const validate = require('../middlewares/validate');
const searchController = require('../controllers/search.controller');
const searchValidation = require('../validations/search.validation');

const router = express.Router();

router.route('/header').get(validate(searchValidation.searchHeader), searchController.searchHeader);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Typeahead top 5 Collections and 5 Categories
 */

/**
 * @swagger
 * /search/header:
 *   get:
 *     summary: Typeahead top 5 Collections and 5 Categories
 *     description: Typeahead top 5 Collections and 5 Categories
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Category'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
