import ApiError from "../utils/ApiError.js";

function validateOrder(req,res,next){
    const{amount,currency,receipt} = req.body;
    console.log(amount)
    console.log(receipt)
    console.log(currency)

    if(!amount || !currency || !receipt){
        throw new ApiError(400,"missing field : amount or currency or reciept")
    }
    next();

}
export default validateOrder;