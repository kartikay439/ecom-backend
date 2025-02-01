import { Router } from "express";
 import { addProduct ,getAllProducts,getProductById} from "../contoller/inventory.controller.js";
 import {upload} from '../middleware/multer.middleware.js'

  const router = new Router()
   router.route("/addProduct").post(
    upload.fields(
        [
            {
                name:"images",
                maxCount:1
            }
        ]
    ),
    addProduct
   )

   router.route("/getAllProduct").get(
    getAllProducts
   );

 router.route("/getProductById").get(
     getProductById
 )


   export default router;