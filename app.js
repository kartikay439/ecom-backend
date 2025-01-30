import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

//Allow app to use cookie 
app.use(cookieParser())

// Routes import
import userRouter from './src/router/buyer.route.js'

//routes declaration
app.use("/api/v1/user",userRouter)

//product route
import productRoute from './src/router/inventory.route.js'
app.use("/api/v1/product",productRoute);

import paymentsRoute from './src/router/payment.routes.js'
app.use("/api/v1/payment",paymentsRoute)

import cartRoute from './src/router/cart.router.js'
app.use("/api/v1/cart",cartRoute)


import orderRouter from './src/router/order.route.js'
app.use("/api/v1/order",orderRouter)

export default app
