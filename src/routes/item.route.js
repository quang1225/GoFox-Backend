const express = require('express');
const validate = require('../middlewares/validate');
const itemController = require('../controllers/item.controller');
const itemValidation = require('../validations/item.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(itemValidation.createItem), itemController.createItem)
  .get(validate(itemValidation.getItems), itemController.getItems);

router.route('/favorite').patch(validate(itemValidation.favoriteItem), itemController.favoriteItem);

router
  .route('/:itemId')
  .get(validate(itemValidation.getItem), itemController.getItem)
  .patch(validate(itemValidation.updateItem), itemController.updateItem)
  .delete(validate(itemValidation.deleteItem), itemController.deleteItem);

router.route('/confirm').post(validate(itemValidation.createConfirm), itemController.createConfirm);

router.route('/slug/:itemSlug').get(validate(itemValidation.getItemBySlug), itemController.getItemBySlug);

router.route('/bulkInsert').post(validate(itemValidation.createItems), itemController.createItems);

router.route('/transfer/request').post(validate(itemValidation.requestTransferItem), itemController.requestTransferItem);
router.route('/transfer/confirm').post(validate(itemValidation.confirmTransferItem), itemController.confirmTransferItem);
router
  .route('/transfer/signature')
  .post(validate(itemValidation.signatureTransferItem), itemController.signatureTransferItem);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management
 */

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a item
 *     description: Create a item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenIds
 *               - name
 *               - collectionId
 *               - supply
 *             properties:
 *               tokenIds:
 *                 type: array
 *                 description: token id of collection
 *               userId:
 *                 type: string
 *                 description: user id
 *               name:
 *                 type: string
 *                 description: name of item
 *               collectionId:
 *                 type: string
 *                 description: collection id
 *               categoryIds:
 *                 type: array
 *                 description: category ids
 *               avatar:
 *                 type: string
 *                 description: token avatar
 *               sort:
 *                 type: integer
 *                 description: sort items
 *               creator:
 *                 type: string
 *                 description: who mint this item, foreign key User
 *               properties:
 *                 type: array
 *                 description: item properties
 *               description:
 *                 type: string
 *                 description: this is item description
 *             example:
 *               tokenIds: ['1', '2', '3']
 *               name: temp test NFT
 *               collectionId: 61055220a95d51006427145a
 *               categoryIds: ['61055220a95d51006427145a', '61055220a95d51006427145b']
 *               avatar: https://cdn.gofox.io/images/2021/06/27/00/images____vertical.jpeg
 *               sort: 1
 *               creator: 60f5960df751a53a58828f5b
 *               properties: [{ value : 10, sort : 0, typeName : ratio }]
 *               description: temp test description
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all items
 *     description: Get all items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: item name
 *       - in: query
 *         name: tokenId
 *         schema:
 *           type: string
 *         description: token Id
 *       - in: query
 *         name: categorySlugs
 *         schema:
 *           type: string
 *         description: category-1,category-2...
 *       - in: query
 *         name: collectionSlugs
 *         schema:
 *           type: string
 *         description: collection-1,collection-2...
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: string
 *         description: Min price number
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: string
 *         description: Max price number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field:Desc/ Asc (ex. created:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of items
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
 * /items/{id}:
 *   get:
 *     summary: Get a item
 *     description: Logged in items can fetch only their own item information. Only admins can fetch other items.
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a item
 *     description: Logged in items can only update their own information. Only admins can update other items.
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: transaction hash mint item
 *               name:
 *                 type: string
 *                 description: name of item
 *               avatar:
 *                 type: string
 *                 description: token avatar
 *               properties:
 *                 type: array
 *                 description: item properties
 *               favorites:
 *                 type: array
 *                 description: item favorites
 *               description:
 *                 type: string
 *                 description: this is item description
 *               status:
 *                 type: integer
 *                 description: sort items
 *               sort:
 *                 type: integer
 *                 description: sort items
 *             example:
 *               transactionId: 60f5960df751a53a58828f5b60f5960df751a53a58828f5b
 *               name: testNFT
 *               status: 1
 *               avatar: abc.png
 *               properties: [{ value : 10, sort : 0, typeName : ratio }]
 *               favorites: [{ userId: 60f5960df751a53a58828f5b }]
 *               description: test description
 *               sort: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
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
 *     summary: Delete a item
 *     description: Logged in items can delete only themselves. Only admins can delete other items.
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item id
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
 * /items/slug/{slug}:
 *   get:
 *     summary: Get a item by slug
 *     description: Logged in items can fetch only their own item information. Only admins can fetch other items.
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Item slug
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *
 */

/**
 * @swagger
 * /items/transfer/request:
 *   post:
 *     summary: Request transfer items
 *     description: Request transfer items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *               - itemId
 *               - transactionId
 *               - collectionAddress
 *               - owner
 *               - receiver
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: token id
 *               tokenId:
 *                 type: string
 *                 description: item id
 *               collectionAddress:
 *                 type: string
 *                 description: collection address
 *               transactionId:
 *                 type: string
 *                 description: transaction Id
 *               owner:
 *                 type: string
 *                 description: owner id
 *               receiver:
 *                 type: string
 *                 description: receiver id
 *               price:
 *                 type: integer
 *                 description: price item
 *               total:
 *                 type: integer
 *                 description: total item Id to transfer
 *             example:
 *               tokenId: '64'
 *               itemId: 60f997521e3f5329b47c2dd6
 *               collectionAddress: '0xA72b7d29Fc7B665555D315e8A3b4B09c1FF5b6d2'
 *               transactionId: 60f5960df751a53a58828f5b
 *               owner: 60f5960df751a53a58828f5b
 *               receiver: 60f30d6a5e422f00643601fc
 *               price: 0.01
 *               total: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /items/transfer/confirm:
 *   post:
 *     summary: Transfer items
 *     description: Transfer items
 *     tags: [Items]
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
 *               - transactionId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: item id
 *               transactionId:
 *                 type: string
 *                 description: transaction Id
 *               status:
 *                 type: integer
 *                 description: item status
 *             example:
 *               itemId: 60f997521e3f5329b47c2dd6
 *               transactionId: 60f5960df751a53a58828f5b
 *               status: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /items/favorite:
 *   patch:
 *     summary: Favorite a item
 *     description: Like item by Slug
 *     tags: [Items]
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
 *                 require: true
 *                 description: userId
 *               itemSlug:
 *                 type: string
 *                 require: true
 *                 description: itemSlug
 *             example:
 *               userId: 60f5960df751a53a58828f5b
 *               itemSlug: item-test
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /items/bulkInsert:
 *   post:
 *     summary: insert array items
 *     description: insert array items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             required:
 *               - itemId
 *               - owner
 *               - receiver
 *             properties:
 *               items:
 *                 type: array
 *                 description: array items
 *             example:
 *               items: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /items/confirm:
 *   post:
 *     summary: confirm insert array items
 *     description: confirm insert array items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             required:
 *               - itemId
 *               - creator
 *               - tokenIds
 *               - collectionId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: item id
 *               tokenIds:
 *                 type: string
 *                 description: token id
 *               collectionId:
 *                 type: string
 *                 description: collection id
 *               creator:
 *                 type: string
 *                 description: who mint this item, foreign key User
 *             example:
 *               itemId: 612e1b47d6ddc743603a1a78
 *               tokenIds: ['1', '2', '3']
 *               collectionId: 61055220a95d51006427145a
 *               creator: 60f5960df751a53a58828f5b
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /items/transfer/signature:
 *   post:
 *     summary: request signature for item transfer
 *     description: request signature for item transfer
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             required:
 *               - tokenId
 *               - itemId
 *               - ownerId
 *               - ownerAddress
 *               - collectionAddress
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: item id
 *               tokenId:
 *                 type: string
 *                 description: token id
 *               ownerId:
 *                 type: string
 *                 description: owner id
 *               ownerAddress:
 *                 type: string
 *                 description: owner address
 *               collectionAddress:
 *                 type: string
 *                 description: collection address
 *             example:
 *               tokenId: '1'
 *               itemId: 615711049759fb563c0c347b
 *               ownerId: 60f5960df751a53a58828f5b
 *               ownerAddress: '0x2CeAD891aCc9F38c94D6626A90ce3636F6c90324'
 *               collectionAddress: '0xD34E51267E935d81518024231E56AC50d4b81BCC'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Item'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */
