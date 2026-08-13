import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';

const router = express.Router();

router.route('/')
  .get(getHotels)
  .post(createHotel);

router.route('/:id')
  .get(getHotelById)
  .put(updateHotel)
  .delete(deleteHotel);

export default router;
