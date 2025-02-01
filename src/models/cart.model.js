import mongoose, {mongo, Schema} from "mongoose";
const CartSchema = new Schema({
   products:[
       {
       productId:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "Product",
       // type: String
       },
       quantity:{
           type: Number,
           min:1,
           required:true
       }
   }]
    ,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Buyer",
        required: true,
    },
    },
    {
        timestamps:true
    }
    )

export default mongoose.model('Cart', CartSchema);