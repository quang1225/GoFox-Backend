const express = require('express');
const validate = require('../middlewares/validate');
const itemOwnerController = require('../controllers/itemOwner.controller');
const itemOwnerValidation = require('../validations/itemOwner.validation');

const router = express.Router();

router.route('/').post(validate(itemOwnerValidation.updateItemOwner), itemOwnerController.updateItemOwner);
router.route('/:ownerId').get(validate(itemOwnerValidation.getOwnerItems), itemOwnerController.getOwnerItems);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Item management
 */

/**
 * @swagger
 * /owner/{id}:
 *   get:
 *     summary: Get items of owner
 *     description: Logged in items can fetch only their own item information. Only admins can fetch other items.
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner id
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
 * /owner:
 *   post:
 *     summary: Update Item Owner
 *     description: Update Item Owner
 *     tags: [Owner]
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
 *               - oldOwner
 *               - newOwner
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: item id
 *               tokenId:
 *                 type: string
 *                 description: token id
 *               oldOwner:
 *                 type: string
 *                 description: item old owner address
 *               newOwner:
 *                 type: string
 *                 description: item new owner address
 *               collectionAddress:
 *                 type: string
 *                 description: collection address
 *               price:
 *                 type: decimal
 *                 description: item price
 *             example:
 *               itemId: 61c6fe95bcd1ba41947a87d4
 *               tokenId: '44'
 *               oldOwner: '0x2CeAD891aCc9F38c94D6626A90ce3636F6c90324'
 *               newOwner: '0xEaE05240A38067dE04B5dF5314343611E249a60d'
 *               collectionAddress: '0xC6097F6A80b2d4891FD74FB27bd8104a4536cb27'
 *               price: 0.654
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
