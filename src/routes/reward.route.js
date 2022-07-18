const express = require('express');
const validate = require('../middlewares/validate');
const rewardController = require('../controllers/reward.controller');
const rewardValidation = require('../validations/reward.validation');

const router = express.Router();

router.route('/').get(validate(rewardValidation.getReward), rewardController.getReward);

router.route('/claim').post(validate(rewardValidation.claimReward), rewardController.claimReward);

router.route('/generateSignature').post(validate(rewardValidation.generateSignature), rewardController.generateSignature);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Rewards
 *   description: Reward management
 */

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: get rewards
 *     description: get rewards
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: user Id
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rewards'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /rewards/claim:
 *   post:
 *     summary: rewards claim
 *     description: rewards claim
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - userId
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: transactionId create by 32 bytes string hex
 *               userId:
 *                 type: string
 *                 description: userId address
 *             example:
 *               transactionId: '0xa7506542260f470b483bc7967a839e2e1c22021a78adb209b9b1e1b6a565842a'
 *               userId: 60f30d6a5e422f00643601fc
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rewards'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 * /rewards/generateSignature:
 *   post:
 *     summary: generate reward signature
 *     description: generate reward signature
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: recipent reward
 *             example:
 *               userId: 60f5960df751a53a58828f5b
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rewards'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
