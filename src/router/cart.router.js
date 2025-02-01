import {Router} from "express";
import {addToCart,fetchCart} from "../contoller/cart.controller.js";

const router = Router();

//adding item to cart
router.route("/add").post(
addToCart
)

router.route("/fetch").get(
    fetchCart
)

export default router;