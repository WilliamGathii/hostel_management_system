const express = require('express');

const authRoutes = require('./auth.routes');
const allocationRoutes = require('./allocation.routes');
const announcementRoutes = require('./announcement.routes');
const healthRoutes = require('./health.routes');
const maintenanceRoutes = require('./maintenance.routes');
const notificationRoutes = require('./notification.routes');
const paymentRoutes = require('./payment.routes');
const reportRoutes = require('./report.routes');
const roomRoutes = require('./room.routes');
const roomTypeRoutes = require('./room-type.routes');
const studentRoutes = require('./student.routes');
const visitorRoutes = require('./visitor.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/rooms', roomRoutes);
router.use('/room-types', roomTypeRoutes);
router.use('/allocations', allocationRoutes);
router.use('/maintenance-requests', maintenanceRoutes);
router.use('/visitors', visitorRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
