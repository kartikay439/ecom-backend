//order make delete no-modify

import asyncHandler from "../utils/asyncHandler.js";
import CartModel from "../models/cart.model.js";
import OrderModel from "../models/order.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

//buy not feature yet to be included

const createOrder = asyncHandler(
    async (req, res, next) => {
        let { userId, price } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid User ID!");
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        console.log("Finding cart for userId:", objectId);

        const order = await CartModel.findOne({ userId: objectId }).lean();

        console.log(order);
        // if (!order) {
        //     console.log("No cart found for user:", objectId);
        //     throw new ApiError(400, "Cart is Empty!");
        // }

        //also check respected item are in inventory or not*****

        console.log("Cart found:", order);
// Proceed with order processing...

        const orderItem = await OrderModel.create({
            userId: userId,
            products: order.products,
            totalPrice: price,
            status: "created"
        })
        // await CartModel.deleteOne({
        //     userId: userId,
        // })

        if (!orderItem) {
            throw new ApiError(400, "Unable to create order at the movement !")
        }
        res.status(200).json(
            new ApiResponse(200, orderItem, "order created successfully!")
        )


    }
)

export {createOrder}