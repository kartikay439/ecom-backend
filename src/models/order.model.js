import mongoose from "mongoose";

const OrderSchema =new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    min: 1,
                }
            }
        ],
    totalPrice: {
            type: Number,
        required: true,
    }

    }, {
        timestamps: true
    })

export default mongoose.model("Order", OrderSchema);