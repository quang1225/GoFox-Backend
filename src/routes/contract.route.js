const express = require('express');
const validate = require('../middlewares/validate');
const contractController = require('../controllers/contract.controller');
const contractValidation = require('../validations/contract.validation');
const credentials = require('../middlewares/credentials');

const router = express.Router();

router
  .route('/dynamicCall')
  .post(credentials, validate(contractValidation.dynamicCallContract), contractController.dynamicCallContract);

router
  .route('/dynamicSend')
  .post(credentials, validate(contractValidation.dynamicSendContract), contractController.dynamicSendContract);

router
  .route('/updateConfirm')
  .get(credentials, validate(contractValidation.updateConfirmData), contractController.updateConfirmData);

module.exports = router;

/**
 * @swagger
 * /smart-contract/updateConfirm:
 *   get:
 *     summary: update Confirm Items from smart contract
 *     description: update Confirm Items from smart contract.<br />  <a href="http://localhost:8080/smart-contract/updateConfirm?data=items&data=listings&data=rewards&data=owners" target="_blank">http://localhost:8080/smart-contract/updateConfirm?data=items&data=listings&data=rewards&data=owners</a>
 *     tags: [Contract]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data
 *         type: array
 *         minItems: 1
 *         required: true
 *         items:
 *             type: string
 *             enum: [items, listings, owners, rewards]
 *         collectionFormat: multi
 *       - in: query
 *         name: token
 *         type: string
 *         required: true
 *     responses:
 *       "201":
 *         description:  update Confirm Contract from smart contract
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contract'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /smart-contract/dynamicCall:
 *   post:
 *     summary: dynamic call test smart contract
 *     description: dynamic call test smart contract
 *     tags: [Contract]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - abi
 *               - address
 *               - method
 *               - params
 *             properties:
 *               abi:
 *                 type: array
 *                 description: link json abi of Contract
 *               address:
 *                 type: string
 *                 description: address of Contract
 *               method:
 *                 type: string
 *                 description: method of Contract
 *               params:
 *                 type: array
 *                 description: array of method params
 *             example:
 *               abi: 'NFTCollection.json'
 *               address: '0xA72b7d29Fc7B665555D315e8A3b4B09c1FF5b6d2'
 *               method: ownerOf
 *               params: ['792']
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contract'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 * /smart-contract/dynamicSend:
 *   post:
 *     summary: dynamic send contract
 *     description: dynamic send smart contract
 *     tags: [Contract]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - signedData
 *             properties:
 *               signedData:
 *                 type: string
 *                 description: signedData send to Contract
 *             example:
 *               signedData: ''
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Contract'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
