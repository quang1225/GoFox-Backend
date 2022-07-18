const express = require('express');
const validate = require('../middlewares/validate');
const userActivityController = require('../controllers/userActivity.controller');
const userActivityValidation = require('../validations/userActivity.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(userActivityValidation.createUserActivity), userActivityController.createUserActivity)
  .get(validate(userActivityValidation.getUserActivities), userActivityController.getUserActivities);

router
  .route('/:userActivityId')
  .get(validate(userActivityValidation.getUserActivity), userActivityController.getUserActivity)
  .delete(validate(userActivityValidation.deleteUserActivity), userActivityController.deleteUserActivity);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: UserActivities
 *   description: UserActivity management
 */

/**
 * @swagger
 * /userActivities:
 *   post:
 *     summary: Create a userActivity
 *     description: Create a userActivity
 *     tags: [UserActivities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - LogType
 *               - userId
 *             properties:
 *               LogType:
 *                 type: string
 *                 description: must be unique
 *               userId:
 *                 type: string
 *                 description: must be unique
 *             example:
 *               LogType: login
 *               userId: 5ebac534954b54139806c112
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/UserActivity'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all userActivitys
 *     description: Get all userActivitys
 *     tags: [UserActivities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User Id
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of userActivitys
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
 *                     $ref: '#/components/schemas/UserActivity'
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
 */

/**
 * @swagger
 * /userActivities/{id}:
 *   get:
 *     summary: Get a userActivity
 *     description: Logged in userActivitys can fetch only their own userActivity information. Only admins can fetch other userActivitys.
 *     tags: [UserActivities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UserActivity id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/UserActivity'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a userActivity
 *     description: Logged in userActivitys can delete only themselves. Only admins can delete other userActivitys.
 *     tags: [UserActivities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UserActivity id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
