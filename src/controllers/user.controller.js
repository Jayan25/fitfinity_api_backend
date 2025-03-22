const { Trainers, Users, service_bookings,enquiry,diet_plan,Payment } = require("../models/index");
const { ReE, ReS, createAndSendEnquiry } = require("../utils/util.service");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/jwtUtils");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

module.exports.SignUp = async function (req, res) {
  try {
    const { fullname, email, mobile, password } = req.body;
    // send user detail like singin
    // const otp = Math.floor(1000 + Math.random() * 9000);

    // Create a new trainer instance using Sequelize
    console.log("trainers:::::::::::::", Users);
    const newUser = await Users.create({
      name: fullname,
      email,
      mobile,
      password,
      // otp,
      // email_verified_at:new Date(),
    });

    const users = await Users.findOne({ where: { email } });
    let user = JSON.parse(JSON.stringify(users));
    delete user.password;

    // let userData={
    //   name,
    //   lat,
    //   lon
    // }

    // let distance=createAndSendEnquiry(userData);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      "your_jwt_secret",
      { expiresIn: "30d" }
    );

    return ReS(res, "Registration successful! OTP sent to your email.",{users, token});
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during registration. Please try again.");
  }
};

module.exports.userLogin = async function (req, res) {
  try {
    const { email, password } = req.body;

    const users = await Users.findOne({ where: { email } });
    console.log("users:::::::::::::::::", users);
    if (!users) {
      return ReE(res, "Email not found.", 400);
    }

    if (password != users.password) {
      return ReE(res, "Incorrect password.", 400);
    }
    let token = generateToken(users);

    let user = JSON.parse(JSON.stringify(users));
    delete user.password;

    return ReS(res, "Login successful.", {
      user: user,
      authorisation: {
        token,
        type: "bearer",
      },
    });
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during login. Please try again.");
  }
};

module.exports.createOrUpdateServiceBooking = async (req, res) => {
  try {
    console.log("============================", req.user);
    const user_id = req.user.id;
    const { service_booking_step } = req.body;
    console.log("ServiceBooking================", service_bookings);

    let booking = await service_bookings.findOne({
      where: { user_id, payment_status: "pending" },
      order: [["created_at", "DESC"]],
    });
    if (!booking && service_booking_step !== 1) {
      return res
        .status(400)
        .json({ message: "Step 1 must be completed first." });
    }

    let serviceBookingsData= await service_bookings.create({
      user_id,
      service_type: req.body.service_type,
      booking_name: req.body.booking_name,
      preferred_time_to_be_served: req.body.preferred_time_to_be_served,
      training_for: req.body.training_for,
      trial_date: req.body.trial_date,
      trial_time: req.body.trial_time,
      payment_status: "pending",
      trial_taken: false,
      service_taken: false,
      service_booking_step: "1",
      trainer_type: req.body.trainer_type,
      training_needed_for: req.body.training_needed_for,
    });

    //1. After this write the payment code.
    //2. Take the above service id and update it with latest payment table entry.
   let paymentResponse= await createOrder(req.body.service_type,user_id,0,"trainer")
   
    let userDetail=await Users.findOne({
      where:{
        id:user_id
      },
      attributes: ['id', 'email', 'name', 'lat', 'lon']
    });

// code to send email to all the matched trainer in 10 KM radius
    // await createAndSendEnquiry(userDetail)
    return res.status(200).json({
      message: `Booking data updated successfully`,
      response:{...serviceBookingsData,paymentResponse}
    });
  } catch (error) {
    console.error("Service Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.latlonUpdation = async function (req, res) {
  try {
    const { id } = req.user;
    const { lat, lon } = req.body;
    let userDetail = await Users.findOne({
      where: {
        id: id,
      },
    });

    if (!userDetail) {
      return ReE(res, "User not found!", 400);
    }
    console.log("userDetail===================", userDetail);
    let dataData = {
      lat,
      lon,
    };
    await Users.update(dataData, { where: { id } });

    return ReS(res, "User lat lon updated");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error while updating user lat and lon");
  }
};
module.exports.natalEnquiry = async function (req, res) {
  try {
    let dataData = {
      name:  req.body.name,
      email:  req.body.email,
      address:  req.body.address,
      phone:  req.body.phone,
      requirement:  req.body.requirement,
      user_id:1,
      enquiry_for:"natal"
    };
    let a=await enquiry.create(dataData);
console.log("a=================================================",a);

    return ReS(res, "Enquiry submitted");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error while submitting enquiry");
  }
};
module.exports.corporatePlan = async function (req, res) {
  try {
  

    let dataData = {
      name:  req.body.name,
      email:  req.body.email,
      company_name:  req.body.company_name,
      phone:  req.body.phone,
      requirement:  req.body.requirement,
      user_id:1,
      enquiry_for:"corporate"

    };
    let a=await enquiry.create(dataData);

    return ReS(res, "Enquiry submitted");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error while submitting enquiry");
  }
};



module.exports.dietPlan = async (req, res) => {
  try {
    const user_id = req.user.id;

    // "type": "weight and muscle gain", //[ "weight and muscle gain","weight and fat loss","thyroid and diabetic","meal plan"]


    await diet_plan.create(
      {
        user_id,
        type:req.body.type,
        price:req.body.price,
        plan_for: req.body.plan_for, 
        gender:req.body.gender,
        name: req.body.name,
        number: req.body.number,
        age:req.body.age,
        height: req.body.height,
        weight: req.body.weight,
        goal: req.body.goal,
        diet_type:req.body.diet_type,
        daily_physical_activity: req.body.daily_physical_activity,
        allergy: req.body.allergy,
        plan_type: req.body.plan_type,
        final_price: req.body.final_price
    })

    let paymentResponse= await createOrder(req.body.type,user_id,req.body.price,"diet")

    return res.status(200).json({
      message: `Diet plan updated successfully`,
      response:{paymentResponse}
    });
  } catch (error) {
    console.error("Service Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.transaction = async (req, res) => {
  try {

    
    // let data = await Payment.find({})

    return ReS(res,"Transaction Fetched success!",response={
      count:0,
      data:[]
    })
  } catch (error) {
    console.error("Service Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const SERVICE_PRICES = {
  "fitness": 99,
  "yoga": 99,
  "weight_loss_trainer": 6000,
  "kickboxing_trainer": 4500,
  "mma_trainer": 7000,
  "cardio_trainer": 5500,
};

const createOrder = async (service_type,user_id,price,from) => {
  try {
    console.log("service_type,user_id,price,from======",service_type,user_id,price,from);
    let amount=price;
    if(from==="trainer")
    {
      if (!SERVICE_PRICES[service_type]) {
        throw new Error("Invalid service type")
      }
      amount = SERVICE_PRICES[service_type] * 100;
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        key1: "value3",
        key2: "value2"
    }
    });

    // Store order in DB
    await Payment.create({
      user_id: user_id,
      service_type,
      order_id: order.id,
      trainer_id:123,
      amount,
      status: "pending",
    });

    let data={
      amount,
      order_id:order.id
    }
    return data
  } catch (error) {
    console.error(error);
    throw new Error("Payment Failed!")
  }
};

// 📌 Verify Payment After Completion
module.exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, razorpay_signature } = req.body;

    // Verify Razorpay Signature
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await Payment.update(
        { status: "success", payment_id },
        { where: { order_id } }
      );
      return res.json({ success: true, message: "Payment verified" });
    } else {
      await Payment.update(
        { status: "failed" },
        { where: { order_id } }
      );
      return res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Payment verification failed" });
  }
};

module.exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", "xrazorpaysignature")
      .update(body)
      .digest("hex");

    if (signature === expectedSignature) {
      console.log(" Webhook Signature Verified");
      console.log(" Event Data:", req.body);
      console.log(" Event Data:", req.body.payload);
      console.log(" Event Data:", req.body.payload.payment.entity.notes);

      return res.status(200).json({ success: true, message: "Webhook verified and processed" });
    } else {
      console.log(" Signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};