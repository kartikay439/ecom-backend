import mongoose, {mongo, Schema} from "mongoose";
const CartSchema = new Schema({
   products:[
       {
       productId:{
       type: String
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
        type: String,
        required: true,
    },
    },
    {
        timestamps:true
    }
    )

export default mongoose.model('Cart', CartSchema);