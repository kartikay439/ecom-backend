import {Router} from "express";
import {addToCart,fetchCart,getAllProductInCart} from "../contoller/cart.controller.js";

const router = Router();

//adding item to cart
router.route("/add").post(
addToCart
)

router.route("/fetch").get(
    fetchCart
)

router.route("/getAll").get(getAllProductInCart)

export default router;