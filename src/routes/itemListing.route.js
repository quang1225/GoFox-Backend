const express = require('express');
const validate = require('../middlewares/validate');
const itemListingController = require('../controllers/itemListing.controller');
const itemListingValidation = require('../validations/itemListing.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(itemListingValidation.createItemListing), itemListingController.createItemListing)
  .get(validate(itemListingValidation.getItemListings), itemListingController.getItemListings)
  .patch(validate(itemListingValidation.updateItemListingStatus), itemListingController.updateItemListingStatus);

router
  .route('/cancel')
  .post(validate(itemListingValidation.cancelItemListingRequest), itemListingController.cancelItemListingRequest);

router
  .route('/:itemListingId')
  .get(validate(itemListingValidation.getItemListing), itemListingController.getItemListing)
  .patch(validate(itemListingValidation.updateItemListing), itemListingController.updateItemListing)
  .delete(validate(itemListingValidation.deleteItemListing), itemListingController.deleteItemListing);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ItemListings
 *   description: Item management
 */

/**
 * @swagger
 * /itemListings:
 *   post:
 *     summary: Create a item listing
 *     description: Create a item listing
 *     tags: [ItemListings]
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
 *               - tokenId
 *               - collectionAddress
 *               - owner
 *               - price
 *               - expireAt
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: item id
 *               tokenId:
 *                 type: string
 *                 description: token id
 *               owner:
 *                 type: string
 *                 description: item owner
 *               price:
 *                 type: decimal
 *                 description: item price
 *               expireAt:
 *                 type: string
 *                 format: date-time
 *                 description: expire time (UTC)
 *             example:
 *               itemId: 60f997521e3f5329b47c2dd6
 *               owner: 60f5960df751a53a58828f5b
 *               collectionAddress: '0xA72b7d29Fc7B665555D315e8A3b4B09c1FF5b6d2'
 *               tokenId: '61'
 *               price: 0.4
 *               expireAt: 2022-07-21T17:32:28Z
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ItemListing'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all itemListings
 *     description: Get all itemListings
 *     tags: [ItemListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: item Id
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *         description: owner Id
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: status lising
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
 *         description: Maximum number of itemListings
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
 *   patch:
 *     summary: Update status a item listing
 *     description: Update status a item listing
 *     tags: [ItemListings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               itemId:
 *                 type: integer
 *                 description: item id
 *               owner:
 *                 type: integer
 *                 description: item owner
 *               tokenId:
 *                 type: integer
 *                 description: item tokenId
 *               price:
 *                 type: integer
 *                 description: item listing price
 *               status:
 *                 type: integer
 *                 description: item listing status
 *             example:
 *               tokenId: '61'
 *               itemId: 611fd633370eeb3218ebfd7d
 *               owner: 6102b5ad80e0f30064eedfeb
 *               price: 0.4
 *               status: 1
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ItemListing'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /itemListings/cancel:
 *   post:
 *     summary: Cancel a item listing
 *     description: Cancel a item listing
 *     tags: [ItemListings]
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
 *               - tokenId
 *               - collectionAddress
 *               - owner
 *               - price
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: item id
 *               tokenId:
 *                 type: string
 *                 description: token id
 *               owner:
 *                 type: string
 *                 description: item owner
 *               collectionAddress:
 *                 type: string
 *                 description: collection address
 *               price:
 *                 type: decimal
 *                 description: item price
 *               transactionId:
 *                 type: strign
 *                 description: the confirm transaction id for cancel
 *             example:
 *               itemId: 60f997521e3f5329b47c2dd6
 *               owner: 60f5960df751a53a58828f5b
 *               collectionAddress: '0xA72b7d29Fc7B665555D315e8A3b4B09c1FF5b6d2'
 *               transactionId: '0xA72b7d29Fc7B665555D315e8A3b4B09c1FF5b6d2'
 *               tokenId: '61'
 *               price: 0.4
 *     responses:
 *       "201":
 *         description: Cancel
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ItemListing'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 */

/**
 * @swagger
 * /itemListings/{id}:
 *   get:
 *     summary: Get a item listing
 *     description: Logged in itemListings can fetch only their own item information. Only admins can fetch other itemListings.
 *     tags: [ItemListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: item listing Id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ItemListing'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a item listing
 *     description: Logged in itemListings can only update their own information. Only admins can update other itemListings.
 *     tags: [ItemListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item Listing Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: decimal
 *                 description: item price
 *             example:
 *               price: 0.01
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ItemListing'
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
 *     summary: Delete a item listing
 *     description: Logged in itemListings can delete only themselves. Only admins can delete other itemListings.
 *     tags: [ItemListings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item Listing id
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
 */
