const express = require('express');
const validate = require('../middlewares/validate');
const collectionController = require('../controllers/collection.controller');
const collectionValidation = require('../validations/collection.validation');

const router = express.Router();

router.route('/trending').get(collectionController.getTrendingCollections);

router.route('/:address/isExistCollection').get(collectionController.isExistCollection);

router
  .route('/')
  .post(validate(collectionValidation.createCollection), collectionController.createCollection)
  .get(validate(collectionValidation.getCollections), collectionController.getCollections);

router
  .route('/:collectionId')
  .get(validate(collectionValidation.getCollection), collectionController.getCollection)
  .patch(validate(collectionValidation.updateCollection), collectionController.updateCollection)
  .delete(validate(collectionValidation.deleteCollection), collectionController.deleteCollection);

router
  .route('/slug/:collectionSlug')
  .get(validate(collectionValidation.getCollectionBySlug), collectionController.getCollectionBySlug);

router
  .route('/verify')
  .post(validate(collectionValidation.requestVerifyCollection), collectionController.requestVerifyCollection);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Collection management
 */

/**
 * @swagger
 * /collections/{address}/isExistCollection:
 *   get:
 *     summary: Check collection exists
 *     description: Check collection exists
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection address
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
 *                     $ref: '#/components/schemas/Collection'
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
 * /collections/trending:
 *   get:
 *     summary: Get all trending collections
 *     description: Get all trending collections
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/Collection'
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
 * /collections:
 *   post:
 *     summary: Create a collection
 *     description: Create a collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               contractToken:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               description:
 *                 type: string
 *               networkName:
 *                 type: string
 *               website:
 *                 type: string
 *               twitter:
 *                 type: string
 *               instagram:
 *                 type: string
 *               telegram:
 *                 type: string
 *               discord:
 *                 type: string
 *               medium:
 *                 type: string
 *               youtube:
 *                 type: string
 *               sort:
 *                 type: number
 *             example:
 *               contractToken: abc123
 *               userId: 60f5960df751a53a58828f5b
 *               name: temp test collection
 *               avatar: https://cdn.gofox.io/images/2021/06/27/00/images____vertical.jpeg
 *               coverImage: https://cdn.gofox.io/images/2021/06/27/00/timthumb____horizontal.jpeg
 *               description: temp test collection
 *               sort: 2
 *               networkName: rinkeby
 *               website: https://example.com/
 *               twitter: https://example.com/
 *               instagram: https://example.com/
 *               telegram: https://example.com/
 *               discord: https://example.com/
 *               medium: https://example.com/
 *               youtube: https://example.com/
 *
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Collection'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   get:
 *     summary: Get all collections
 *     description: Get all collections
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Collection name
 *       - in: query
 *         name: categorySlugs
 *         schema:
 *           type: string
 *         description: Category slugs split by ','
 *       - in: query
 *         name: hasItem
 *         schema:
 *           type: boolean
 *         description: Only get collections have at least 1 item
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User Id
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         default: name:desc
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
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
 *                     $ref: '#/components/schemas/Collection'
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
 * /collections/{id}:
 *   get:
 *     summary: Get a collection
 *     description: Logged in collections can fetch only their own collection information. Only admins can fetch other collections.
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Collection'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a collection
 *     description: Logged in collections can only update their own information. Only admins can update other collections.
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               description:
 *                 type: string
 *               networkName:
 *                 type: string
 *               website:
 *                 type: string
 *               twitter:
 *                 type: string
 *               instagram:
 *                 type: string
 *               telegram:
 *                 type: string
 *               discord:
 *                 type: string
 *               medium:
 *                 type: string
 *               youtube:
 *                 type: string
 *               sort:
 *                 type: number
 *               status:
 *                 type: number
 *             example:
 *               name: temp test collection
 *               avatar: https://cdn.gofox.io/images/2021/06/27/00/images____vertical.jpeg
 *               coverImage: https://cdn.gofox.io/images/2021/06/27/00/timthumb____horizontal.jpeg
 *               description: temp test collection
 *               sort: 2
 *               status: 1
 *               networkName: network abc
 *               website: https://example.com/
 *               twitter: https://example.com/
 *               instagram: https://example.com/
 *               telegram: https://example.com/
 *               discord: https://example.com/
 *               medium: https://example.com/
 *               youtube: https://example.com/
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Collection'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a collection
 *     description: Logged in collections can delete only themselves. Only admins can delete other collections.
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 * /collections/slug/{slug}:
 *   get:
 *     summary: Get a collection by slug
 *     description: Logged in collections can fetch only their own collection information. Only admins can fetch other collections.
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: collection slug
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Collection'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * /**
 * @swagger
 * /collections/verify:
 *   post:
 *     summary: request a collection
 *     description: request a collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collectionId:
 *                 type: string
 *               collectionLink:
 *                 type: string
 *               twiiter:
 *                 type: string
 *               linkedIn:
 *                 type: string
 *               facebook:
 *                 type: string
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *             example:
 *               collectionId: 61375670430f4716bc5cdd31
 *               collectionLink: http://localhost:3000/my-collections/test-listing
 *               fullname: tuan huynh
 *               email: example@email.com
 *               twitter: https://example.com/
 *               facebook: https://example.com/
 *               linkedIn: https://example.com/
 *
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Collection'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
