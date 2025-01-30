import mongoose, {Schema} from "mongoose";

//   Just testing version after testing sellerId will be attatched
const productSchema = new Schema(
    {
        name: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,

        },
        imagesArray:[
            {
             type:{
                 type: String,
                 required: true,
             }
            }
        ],
        mrp:{
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
        },
        availableUnit: {
            type:Number
        },
        sellerId: {
            type: String
        },
    },
    {
        timestamps: true
    }
)

export const Product = mongoose.model("Product", productSchema);