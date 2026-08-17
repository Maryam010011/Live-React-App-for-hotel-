import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();

// GET /api/bookings/my — logged-in customer sees only their own bookings
// Must be BEFORE /:id to avoid "my" being treated as an ID param
router.get('/my', protect, async (req, res) => {
  const { BookingModel } = await import('../models/Booking.js');
  try {
    const bookings = await BookingModel.find({ email: req.user.email }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch your bookings.' });
  }
});

// GET /api/bookings — admin only (all bookings)
router.get('/', protect, requireAdmin, getBookings);

// POST /api/bookings — PUBLIC (guests can book without an account)
router.post('/', createBooking);

// Individual booking routes (admin only for full management)
router.get('/:id', protect, requireAdmin, getBookingById);
router.put('/:id', protect, requireAdmin, updateBooking);
router.delete('/:id', protect, requireAdmin, deleteBooking);

export default router;
