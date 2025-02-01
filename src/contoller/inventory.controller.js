import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"

import {uploadOnCLoudinary} from '../utils/cloudinary.service.js'


import mongoose from "mongoose";
import {Product} from "../models/inventory.model.js";


const addProduct = asyncHandler(
    async (req, res) => {
        const {
            name, description, category, mrp, discount, quantity,
            availableUnit, sellerId
        } = req.body;

        console.log(name)

        // if any one field is empty string then it wil, return true
        if ([name, category].some(v => v?.trim === "")) {
            throw new ApiError(400, "All fileds reuqired");
        }

        //handling image from then  body   we are using .files with thwen help of multer
        const imagesLocalPath = req.files?.images[0]?.path;

        console.log(imagesLocalPath);

        // image will be accessed from local path and will uplod on cloud
        const images = await uploadOnCLoudinary(imagesLocalPath);

        console.log(images.url);

        const product = await Product.create(
            {
                name,
                description,
                category,
                imagesArray:new Array(images.url.toString()),
                mrp,
                discount,
                quantity,
                availableUnit,
                sellerId
            }
        )
        if (!product) {
            throw new ApiError(400, "new product not added")
        }
        const newProduct = await Product.findById(product._id);

        return res.status(201).json(
            new ApiResponse(200, newProduct, "Product added Successfully")
        )
    }
)

const getProductById = asyncHandler(async (req, res) => {
    let {productId} = req.query;
    console.log(productId);
    const product =await Product.findById({_id:productId});
    if(!product) {
        throw new ApiError(403, "Product not found");
    }
    res.status(200).json(
        new ApiResponse(200, product, "Product added Successfully")
    )
})



const getAllProducts = asyncHandler(
    async (req, res) => {
        let allProduct = await Product.aggregate([
            {
                $project: {
                    id: {$toString: "$_id"},
                    name:1,
                    description:1,
                    category:1,
                    imagesArray:1,
                    mrp:1,
                    discount:1,
                    quantity:1,
                    availableUnit:1,
                    sellerId:1,
                    _id:0// Exclude the original _id field
                }
            }
        ]);

        console.log(allProduct);

        if (!allProduct || allProduct.length === 0) {
            throw new ApiError(400, "No products found");
        }

        console.log("All products are requested");
        return res.json(allProduct); // Return the modified array
    }
);


export {addProduct,getAllProducts,getProductById}

