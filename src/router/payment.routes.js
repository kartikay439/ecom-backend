import express from "express"
 const router = express.Router()
 import validateOrder from "../middleware/validate_order.middleware.js"
import createOrder from "../contoller/payment.controller.js";

 router.post("/create-order",validateOrder,createOrder);


export default router;