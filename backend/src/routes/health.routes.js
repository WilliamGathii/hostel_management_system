const express = require('express');

const { env } = require('../config/env');
const { sendSuccess } = require('../utils/api-response');

const router = express.Router();

router.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'Hostel Management System API is running',
    data: {
      status: 'healthy',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
