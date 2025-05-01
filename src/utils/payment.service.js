const {
  Trainers,
  Users,
  service_bookings,
  enquiry,
  diet_plan,
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

const SERVICE_PRICES = {
  fitness: 99,
  yoga: 99,
  weight_loss_trainer: 6000,
  kickboxing_trainer: 4500,
  mma_trainer: 7000,
  cardio_trainer: 5500,
};

module.exports.createOrder = async (service_type, user_id, price, from, id) => {
  try {
    let amount = price;
    let service_booking_id;
    let diet_plan_id;
    if (from === "trainer") {
      if (!SERVICE_PRICES[service_type]) {
        throw new Error("Invalid service type");
      }
      amount = SERVICE_PRICES[service_type];
      service_booking_id = id;
    } else {
      diet_plan_id = id;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        service_booking_id,
        diet_plan_id,
        service_type,
        trail: true,
      },
    });

    // Store order in DB
    let paymanredata = await Payment.create({
      user_id: user_id,
      service_type,
      order_id: order.id,
      trainer_id: 123,
      amount,
      status: "pending",
      service_booking_id,
      diet_plan_id,
      currency: "INR",
    });
    console.log("paymanredata=====", paymanredata);

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
    console.log("fiding serive detail using findConnection111111111111",serviceBookingsData)
    let priceAcordingToTrainerExperience=0;
    switch(serviceBookingsData?.trainer_type){
      case "basic":
        priceAcordingToTrainerExperience=7500;
        console.log("priceAcordingToTrainerExperience=7500",priceAcordingToTrainerExperience);
        
        break;
        case "standard":
          priceAcordingToTrainerExperience=10328;
          console.log("priceAcordingToTrainerExperience=10328",priceAcordingToTrainerExperience);
          break;
          case "premium":
            priceAcordingToTrainerExperience=12160;
            console.log("priceAcordingToTrainerExperience=12160",priceAcordingToTrainerExperience);
          break;
          case "couple/group":
            priceAcordingToTrainerExperience=13989;
            console.log("priceAcordingToTrainerExperience=13989",priceAcordingToTrainerExperience);
          break;
          default: console.log("trainer type not found")
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
    console.log("order=====",order);
    let paymanredata = await Payment.create({
        user_id: userDetail.id,
        order_id: order.id,
        trainer_id: trainerDetail.id,
        amount:100,
        status: "pending",
        service_type: serviceBookingsData.service_type,
        currency: "INR"
      });

    console.log("order=========", paymanredata);

    const paymentLink = `https://y9lm3v.csb.app/pay?order_id=${order.id}`;
    console.log("paymentLink====", paymentLink);
    return paymentLink;
  } catch (error) {
    console.error(error);
    throw new Error("Payment Failed!");
  }
};
