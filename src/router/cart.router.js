import {Router} from "express";
import {add} from "../contoller/cart.controller.js";

const router = Router();

//adding item to cart
router.route("/add").post(
add
)

export default router;