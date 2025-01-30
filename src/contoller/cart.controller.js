import Cart from '../models/cart.model.js';
import AsyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

//THERE WILL BE A TABLE WHICH WILL HAVE PRODUCT QUANTITY AND PRODUCT ID
//NOW IF ANYONE WANTS TO ADD PRODUCT IN CART IT WILL BE CHECKED IN INVENTORY

const add = AsyncHandler(
    async (req, res, next) => {
        const product = req.body.product;
        let userId = req.body.userId;
        userId =new mongoose.Types.ObjectId(userId);
        console.log(product, userId, "he");

        if (!userId || !product) {
            throw new ApiError(403, 'Missing product or userId');
        }

        const existed_user = await Cart.findOne({
            userId: userId,
        });

        const productId = new mongoose.Types.ObjectId(product.productId)

        if (existed_user) {
            const existedCartItem = await Cart.findOne({
                userId: userId,
                "products.productId": productId
            });

            if (existedCartItem)
                console.log(existedCartItem.products[0].quantity + "Existed Cart item");

            // If the cart with the given productId exists, update the product’s quantity
            if (existedCartItem) {
                await Cart.updateOne(
                    {
                        userId: userId,
                        "products.productId": productId
                    },
                    {
                        $set: {
                            "products.$.quantity": product.quantity + existedCartItem.products[0].quantity,
                        }
                    }
                );
            } else {
                // If the cart doesn't exist, add the product to the cart
                await Cart.updateOne(
                    {userId: userId},
                    {
                        $push: {
                            products: {
                                productId: productId,
                                quantity: product.quantity
                            }
                        }
                    },
                    {upsert: true} // This option creates a new document if no document matches the filter
                );
            }
        } else {
            const cart = await Cart.create({
                products: [product],
                userId: userId
            });

            // Return the response after adding the new cart item
            if (cart) {
                return res.status(200).json(new ApiResponse(200, cart, "Cart item added successfully"));
            }
        }
    }
);

export {add};
