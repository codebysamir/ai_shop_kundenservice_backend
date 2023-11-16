import mongoose from 'mongoose'

const CartSchema = new mongoose.Schema(
    {
        // userId: {
        //      type: String, required: true,
        // },
        products: [
            {
                // productId: {
                //     type: String,
                // },
                // quantity: {
                //     type: Number,
                //     default: 1,
                // }
                product: {
                    type: String,
                },
                details: {
                    type: String,
                },
                price: {
                    type: String,
                }
            }
        ],
        checkoutStatus: {
            type: Boolean
        }
    },
    { 
        timestamps: true
    }
)

export const Cart = mongoose.model('Cart', CartSchema)