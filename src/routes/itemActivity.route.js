const express = require('express');
const validate = require('../middlewares/validate');
const itemActivityController = require('../controllers/itemActivity.controller');
const itemActivityValidation = require('../validations/itemActivity.validation');

const router = express.Router();

router.route('/').get(validate(itemActivityValidation.getItemActivity), itemActivityController.getItemActivity);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ItemActivity
 *   description: Item management
 */

/**
 * @swagger
 * /itemActivities:
 *   get:
 *     summary: Get all itemActivites
 *     description: Get all itemActivites
 *     tags: [ItemActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: historyType
 *         schema:
 *           type: string
 *         description: history type
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: item Id
 *       - in: query
 *         name: fromUserId
 *         schema:
 *           type: string
 *         description: from User
 *       - in: query
 *         name: toUserId
 *         schema:
 *           type: string
 *         description: to UserId
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         default: price:desc
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of itemActivites
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ItemListing'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 */
