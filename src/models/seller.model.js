import mongoose, {mongo} from "mongoose";

const SellerSchema = new mongoose.Schema({
    name: String,
    mobile:String,
    panCardNumber: Number,
    address: String,
    email: String,
    profilePhoto: String,
    password: String,
    gstNumber: Number,
    accountNumber: String,
    ifsc: String,
    bank: String,
    refreshToken: String,
})

export default mongoose.model("seller", SellerSchema);