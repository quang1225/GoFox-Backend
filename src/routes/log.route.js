const express = require('express');

const router = express.Router();

router.use('/', express.static(`${__dirname}/../../logs`));

module.exports = router;
