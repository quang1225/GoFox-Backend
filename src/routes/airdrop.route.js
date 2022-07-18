const express = require('express');
const validate = require('../middlewares/validate');
const airdropController = require('../controllers/airdrop.controller');
const airdropValidation = require('../validations/airdrop.validation');

const router = express.Router();

router.route('/distribute').post(validate(airdropValidation.distributeAirDrop), airdropController.distributeAirDrop);
router.route('/generateSignature').post(validate(airdropValidation.generateSignature), airdropController.generateSignature);

router
  .route('/:walletAddress')
  .get(validate(airdropValidation.validateAirDrop), airdropController.validateAirDrop)
  .post(validate(airdropValidation.updateClaimAirDropFilter), airdropController.updateClaimAirDropFilter);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: AirDrops
 *   description: AirDrop management
 */

/**
 * @swagger
 * /airdrops/distribute:
 *   post:
 *     summary: distribute airdrop to user
 *     description: distribute airdrop to user
 *     tags: [AirDrops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/AirDrops'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 * /airdrops/generateSignature:
 *   post:
 *     summary: generate airdrop signature
 *     description: generate airdrop signature
 *     tags: [AirDrops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reciept
 *               - amount
 *             properties:
 *               reciept:
 *                 type: string
 *                 description: recipent airdrop address
 *               amount:
 *                 type: interger
 *                 description: amount airdrop
 *             example:
 *               reciept:
 *               amount: 5
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/AirDrops'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /airdrops/{walletAddress}:
 *   post:
 *     summary: Update a airdrop claim status
 *     description: Update a airdrop claim status
 *     tags: [AirDrops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: walletAddress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/AirDrops'
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
 *     summary: validate airdrop
 *     description: validate airdrop
 *     tags: [AirDrops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: walletAddress
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/AirDrops'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
