import Stripe from 'stripe'
import Transaction from '../models/Transaction.js';
import User from '../models/User.js'

export const stripeWebhooks =async (request,response) => {
    const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET)
    const sig =request.headers["stripe-signature"]
    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body,sig,process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return response.status(400).send(`webhooks Error:${error.message}`) 
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded":{
                const paymentIntent = event.data.object;
                const sessionsList = await stripe.checkout.sessions.list({
                    payment_intent:paymentIntent.id,
                })
                const session = sessionsList.data[0];
                const {transactionId, aapId} = session.metadata;
                if (aapId === "chatbot") {
                    const transaction = await Transaction.findOne({_id:transactionId,isPaid:false})
                   
                    //update credits in user account

                    await User.updateOne({_id:transactionId.userId},{$inc:
                    {credits:transaction.credits }})

                    //update payment status
                    transaction.isPaid = true;
                    await transaction.save();
                }
                else{
                    return response.json({received:true, message:"Ignored event:Invlid aap"})
                } 
                break;
            }
                
                
        
            default:
                console.log("Unhandled event type:",event.type);
                
                break;
        }
        response.json({received:true})
    } catch (error) {
        console.error("webhook processing error:",error)
        response.status(500).send("Internal Server Error")
    }
    
}