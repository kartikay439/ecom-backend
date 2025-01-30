import {Router} from 'express'
const router = Router()
import {createOrder} from '../contoller/order.controller.js'
router.route("/createOrder").post(
    createOrder
)

export default router