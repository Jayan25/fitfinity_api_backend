const {
  Trainers,
  Users,
  service_bookings,
  enquiry,
  diet_plan,
  fitness_plan,     // <-- added this
  Payment,
  connection_data,
} = require("../models/index");

const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// const razorpay = new Razorpay({
//   key_id: rzp_test_RIoYb2nTkuFG0w,
//   key_secret: OiiR2UmXhLMU9yxoxCwDb6Xt,
// });

const SERVICE_PRICES = {
  fitness: 1,
  yoga: 1,
  weight_loss_trainer: 6000,
  kickboxing_trainer: 4500,
  mma_trainer: 7000,
  cardio_trainer: 5500,
};
// const SERVICE_PRICES = {
//   fitness: 99,
//   yoga: 99,
//   weight_loss_trainer: 6000,
//   kickboxing_trainer: 4500,
//   mma_trainer: 7000,
//   cardio_trainer: 5500,
// };

/**
 * createOrder(service_type, user_id, price, from, id)
 *
 * - service_type: original service type string (eg. "fitness", "yoga", trainer subtype etc.)
 * - user_id: id of user placing order
 * - price: numeric price (rupees)
 * - from: string indicating caller context: "trainer" (service booking), "diet", "fitness"
 * - id: id of the entity to associate (service_booking id, diet_plan id, fitness_plan id)
 *
 * This function will:
 * - create a Razorpay order with notes indicating which entity it belongs to
 * - create a Payment row with diet_plan_id or fitness_plan_id or service_booking_id accordingly
 * - return an object { amount, order_id }
 */
module.exports.createOrder = async (service_type, user_id, price, from, id) => {
  try {
    let amount = price;
    let service_booking_id = null;
    let diet_plan_id = null;
    let fitness_plan_id = null;
    let trail=true;  // there is no trail for diet and fitness services

    console.log("id==========",id);

    console.log("from========",from)
    

    // If it's a trainer booking, amount is from SERVICE_PRICES and id is service_booking_id
    if (from === "trainer") {
      if (!SERVICE_PRICES[service_type]) {
        throw new Error("Invalid service type");
      }
      console.log("I am inside=======")
      amount = SERVICE_PRICES[service_type];
      service_booking_id = id;
    } else if (from === "diet") {
      // diet plan creation flow
      diet_plan_id = id;
      trail=false;
    } else if (from === "fitness") {
      // fitness plan creation flow
      fitness_plan_id = id;
      trail=false;
    } else {
      // fallback: treat as diet plan if unspecified (preserves previous behavior)
      diet_plan_id = id;
      trail=false;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        service_booking_id,
        diet_plan_id,
        fitness_plan_id,
        service_type,
        trail, 
      },
    });


    console.log("order======22222222====",order)

    // Store order in DB (keep trainer_id default as before — adjust as needed)
    let paymanredata = await Payment.create({
      user_id: user_id,
      service_type,
      order_id: order.id,
      trainer_id: 123,
      amount,
      status: "pending",
      service_booking_id,
      diet_plan_id,
      fitness_plan_id,
      currency: "INR",
    });


console.log("paymanredata==",paymanredata)
    let data = {
      amount,
      order_id: order.id,
    };
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Payment Failed!");
  }
};

module.exports.genereateDynamicPaymentLink = async (
  findConnection,
  userDetail,
  trainerDetail
) => {
  try {
    let serviceBookingsData= await service_bookings.findOne({
        where:{
            id:findConnection.service_booking_id
        }
    })

    if(!serviceBookingsData)
    {
      throw new Error("Service detail not found, try again!");
    }
    let priceAcordingToTrainerExperience=0;
    switch(serviceBookingsData?.trainer_type){
      case "basic":
        priceAcordingToTrainerExperience=1;
        break;
      case "standard":
        priceAcordingToTrainerExperience=10328;
        break;
      case "premium":
        priceAcordingToTrainerExperience=12160;
        break;
      case "couple/group":
        priceAcordingToTrainerExperience=13989;
        break;
      default:
        console.log("trainer type not found")
    }
  
    const order =await razorpay.orders.create({
      amount:priceAcordingToTrainerExperience*100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        service_booking_id: serviceBookingsData.id,
        service_type: serviceBookingsData.service_type,
        trail:false
      },
    });
    let paymanredata = await Payment.create({
        user_id: userDetail.id,
        order_id: order.id,
        trainer_id: trainerDetail.id,
        amount:100,
        status: "pending",
        service_type: serviceBookingsData.service_type,
        currency: "INR",
        service_booking_id:findConnection.service_booking_id
      });

      
    const paymentLink = `https://www.fitfinitytrainer.com/pay?order_id=${order.id}`;
    return paymentLink;
  } catch (error) {
    console.error(error);
    throw new Error("Payment Failed!");
  }
};
