import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import razorpayInstance from "../utils/razorpay.service.js";

const createOrder = asyncHandler(
    async (req,res) => {
        const {amount,currency,reciept} = req.body;
        const order =await razorpayInstance.orders.create(
            {
                amount:amount*100,
                currency,
                reciept
            }
        );
        if(!order){
            throw new ApiError(
                400,
                "order not creates"
            )
        }
        console.log(order)

        return res.status(201).json(
            new ApiResponse(
                200,
                "order id created",
                order
            )
        )

         
    }
)
export default createOrder;