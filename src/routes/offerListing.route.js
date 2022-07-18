const express = require('express');
const validate = require('../middlewares/validate');
const offerListingController = require('../controllers/offerListing.controller');
const offerListingValidation = require('../validations/offerListing.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(offerListingValidation.createOfferListing), offerListingController.createOfferListing)
  .get(validate(offerListingValidation.getOfferListings), offerListingController.getOfferListings);

router
  .route('/:offeritemId')
  .get(validate(offerListingValidation.getOfferListing), offerListingController.getOfferListing)
  .patch(validate(offerListingValidation.updateOfferListing), offerListingController.updateOfferListing)
  .delete(validate(offerListingValidation.deleteOfferListing), offerListingController.deleteOfferListing);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: OfferListings
 *   description: OfferListing management
 */

/**
 * @swagger
 * /offerListings:
 *   post:
 *     summary: Create a offerListing
 *     description: Create a offerListing
 *     tags: [OfferListings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - price
 *               - offerUserId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: must be unique
 *               offerUserId:
 *                 type: string
 *                 description: must be unique
 *               price:
 *                 type: number
 *                 description: must be unique
 *             example:
 *               itemId: 5ebac534954b54139806c112
 *               offerUserId: 5ebac534954b54139806c112
 *               price: 0.01
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/OfferListing'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all offerListings
 *     description: Get all offerListings
 *     tags: [OfferListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: Item Id
 *       - in: query
 *         name: price
 *         schema:
 *           type: integer
 *         description: offer price
 *       - in: query
 *         name: offerUserId
 *         schema:
 *           type: string
 *         description: offerUserId Id
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: status lising
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
 *         description: Maximum number of offerListings
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
 *                     $ref: '#/components/schemas/OfferListing'
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
 * /offerListings/{id}:
 *   get:
 *     summary: Get a offerListing
 *     description: Logged in offerListings can fetch only their own offerListing information. Only admins can fetch other offerListings.
 *     tags: [OfferListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OfferItem Id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/OfferListing'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a offerListing
 *     description: Logged in offerListings can only update their own information. Only admins can update other offerListings.
 *     tags: [OfferListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OfferItem Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *               price:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               offerUserId:
 *                 type: string
 *             example:
 *               itemId: 60b237fcacc71f00684f1ffa
 *               price: 0.10
 *               salePrice: 1.00
 *               offerUserId: 60b237fcacc71f00684f1ffa
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/OfferListing'
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
 *     summary: Delete a offerListing
 *     description: Logged in offerListings can delete only themselves. Only admins can delete other offerListings.
 *     tags: [OfferListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OfferItem Id
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
