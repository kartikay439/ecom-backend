import Cart from '../models/cart.model.js';
import AsyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";
import {Product} from "../models/inventory.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import CartModel from "../models/cart.model.js";

//THERE WILL BE A TABLE WHICH WILL HAVE PRODUCT QUANTITY AND PRODUCT ID
//NOW IF ANYONE WANTS TO ADD PRODUCT IN CART IT WILL BE CHECKED IN INVENTORY


//quantity not working properly****
const addToCart = AsyncHandler(
    async (req, res, next) => {
        const product = req.body;
        // console.log(product);
        let userId = req.query.userId;
        // userId = new mongoose.Types.ObjectId(userId);
        console.log(product, userId, "he");

        if (!userId || !product) {
            throw new ApiError(403, 'Missing product or userId');
        }

        const existed_user = await Cart.findOne({
            userId: userId,
        });


        const productId = new mongoose.Types.ObjectId(product.productId)
        const productInInventory = await Product.findById(productId)
        if (productInInventory.availableUnit <= 0) {
            throw new ApiError(403, 'Product out of stock');
        }

        // productInInventory.availableUnit = productInInventory.availableUnit - 1 ;
        // await productInInventory.save({validateBeforeSave: true})

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
                            "products.$.quantity": 1 + existedCartItem.products[0].quantity,
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

const getAllProductInCart = asyncHandler(
    async (req, res, next) => {
        const cart = await Cart.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.query.userId) } // Ensure userId is a string in MongoDB
            },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products", // MongoDB uses **collection name** (lowercase, plural in most cases)
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    "productDetails._id": 1,
                    "productDetails.name": 1,
                    "productDetails.mrp": 1,
                    "productDetails.quantity": 1,
                    "productDetails.imagesArray": 1,
                }
            }
        ]);

        console.log(cart)


        res.json(cart);
    }
)

const fetchCart = asyncHandler(
    async (req, res, next) => {
        console.log(req.query);
        let {userId} = req.query;
        userId = userId.toString();
        console.log(userId);

        const cart = await CartModel.find({userId});

        if (cart.length === 0) {
            throw new ApiError(403, 'Add item to cart first');
        }

        console.log(cart);

        res.status(200).json(
            new ApiResponse(200, cart, "Cart fetched successfully")
        );
    }
);


export {addToCart, fetchCart, getAllProductInCart};
