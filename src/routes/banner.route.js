const express = require('express');
const validate = require('../middlewares/validate');
const bannerController = require('../controllers/banner.controller');
const bannerValidation = require('../validations/banner.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(bannerController.createBanner), bannerController.createBanner)
  .get(validate(bannerController.getBanners), bannerController.getBanners);

router
  .route('/:bannerId')
  .get(validate(bannerValidation.getBanner), bannerController.getBanner)
  .patch(validate(bannerValidation.updateBanner), bannerController.updateBanner)
  .delete(validate(bannerValidation.deleteBanner), bannerController.deleteBanner);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Banner management
 */

/**
 * @swagger
 * /banners:
 *   post:
 *     summary: Create a banner
 *     description: Create a banner
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bannerType
 *               - title
 *               - collectionId
 *             properties:
 *               bannerType:
 *                 type: string
 *                 description: type of banner
 *               title:
 *                 type: string
 *                 description: title of banner
 *               description:
 *                 type: string
 *                 description: description of banner
 *               image:
 *                 type: string
 *                 description: banner image
 *               url:
 *                 type: string
 *                 description: url image
 *               status:
 *                 type: string
 *                 description: banner status
 *               dateFrom:
 *                 type: date
 *                 description: publish from
 *               dateTo:
 *                 type: date
 *                 description: publish to
 *               order:
 *                 type: integer
 *                 description: order by of banner
 *             example:
 *               bannerType: top
 *               title: test banner
 *               description: banner description
 *               image: abc.png
 *               url: https://example.com
 *               status: publish
 *               dateFrom: 2021-06-12T09:10:54.414Z
 *               dateTo: 2021-06-12T09:10:54.414Z
 *               order: 1
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Banner'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all banners
 *     description: Get all banners
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bannerType
 *         schema:
 *           type: string
 *         description: type of banner
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         default: title:desc
 *         description: sort by query in the form of field:desc/asc (ex. title:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of banners
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
 *                     $ref: '#/components/schemas/Item'
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
 * /banners/{id}:
 *   get:
 *     summary: Get a banner
 *     description: Logged in banners can fetch only their own banner information. Only admins can fetch other banners.
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Banner'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a banner
 *     description: Logged in banners can only update their own information. Only admins can update other banners.
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bannerType:
 *                 type: string
 *                 description: type of banner
 *               title:
 *                 type: string
 *                 description: title of banner
 *               description:
 *                 type: string
 *                 description: description of banner
 *               image:
 *                 type: string
 *                 description: banner image
 *               url:
 *                 type: string
 *                 description: url image
 *               status:
 *                 type: string
 *                 description: banner status
 *               dateFrom:
 *                 type: date
 *                 description: publish from
 *               dateTo:
 *                 type: date
 *                 description: publish to
 *               order:
 *                 type: integer
 *                 description: order by of banner
 *             example:
 *               bannerType: top
 *               title: test banner
 *               description: banner description
 *               image: abc.png
 *               url: https://example.com
 *               status: publish
 *               dateFrom: 2021-06-12T09:10:54.414Z
 *               dateTo: 2021-06-12T09:10:54.414Z
 *               order: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Banner'
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
 *     summary: Delete a banner
 *     description: Logged in banners can delete only themselves. Only admins can delete other banners.
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner id
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
