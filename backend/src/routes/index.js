const express = require('express');

const authRoutes = require('./auth.routes');
const allocationRoutes = require('./allocation.routes');
const healthRoutes = require('./health.routes');
const maintenanceRoutes = require('./maintenance.routes');
const roomRoutes = require('./room.routes');
const studentRoutes = require('./student.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/rooms', roomRoutes);
router.use('/allocations', allocationRoutes);
router.use('/maintenance-requests', maintenanceRoutes);

module.exports = router;
