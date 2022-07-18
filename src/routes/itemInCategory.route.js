const express = require('express');
const validate = require('../middlewares/validate');
const itemInCategoryController = require('../controllers/itemInCategory.controller');
const itemInCategoryValidation = require('../validations/itemInCategory.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(itemInCategoryValidation.createItemInCategory), itemInCategoryController.createItemInCategory)
  .get(validate(itemInCategoryValidation.getItemInCategorys), itemInCategoryController.getItemInCategorys);

router
  .route('/:itemincategoryId')
  .get(validate(itemInCategoryValidation.getItemInCategory), itemInCategoryController.getItemInCategory)
  .delete(validate(itemInCategoryValidation.deleteItemInCategory), itemInCategoryController.deleteItemInCategory);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ItemInCategory
 *   description: ItemInCategory management
 */

/**
 * @swagger
 * /ItemInCategory:
 *   post:
 *     summary: Create a ItemInCategory
 *     description: Create a ItemInCategory
 *     tags: [ItemInCategory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: Item Id
 *               categoryId:
 *                 type: string
 *                 description: Category Id
 *             example:
 *               categoryId: '5ebac534954b54139806c112'
 *               itemId: '5ebac534954b54139806c112'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ItemInCategory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all Collection In Category
 *     description: Get all Collection In Category
 *     tags: [ItemInCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of collections
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
 *                     $ref: '#/components/schemas/Category'
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
 * /ItemInCategory/{id}:
 *   get:
 *     summary: Get a ItemInCategory with Id
 *     description: Logged in ItemInCategory can fetch only their own ItemInCategory information. Only admins can fetch other ItemInCategory.
 *     tags: [ItemInCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ItemInCategory id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ItemInCategory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a ItemInCategory
 *     description: Logged in ItemInCategory can delete only themselves. Only admins can delete other ItemInCategory.
 *     tags: [ItemInCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ItemInCategory id
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
