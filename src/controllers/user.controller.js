const {
  Trainers,
  Users,
  service_bookings,
  enquiry,
  diet_plan,
  Payment,
  connection_data,
} = require("../models/index");
const { ReE, ReS, createAndSendEnquiry } = require("../utils/util.service");
const { createOrder } = require("../utils/payment.service");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/jwtUtils");
const { Op } = require("sequelize");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

module.exports.SignUp = async function (req, res) {
  try {
    const { fullname, email, mobile, password } = req.body;
    // send user detail like singin
    // const otp = Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new trainer instance using Sequelize
    const newUser = await Users.create({
      name: fullname,
      email,
      mobile,
      password: hashedPassword,
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

    // const token = jwt.sign(
    //   { userId: newUser.id, email: newUser.email },
    //   "your_jwt_secret",
    //   { expiresIn: "30d" }
    // );
    let token = generateToken(users);

    return ReS(res, "Registration successful!", {
      user,
      authorisation: { token, type: "bearer" },
    });
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during registration. Please try again.");
  }
};

module.exports.hashExistingPasswords = async function (req, res) {
  try {
    // Fetch all users
    const users = await Trainers.findAll();

    for (const user of users) {
      // Check if the password is already hashed
      if (!user.password.startsWith("$2b$")) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Update user password
        await Trainers.update(
          { password: hashedPassword },
          { where: { id: user.id } }
        );
      }
    }

    return res.json({ message: "All passwords updated successfully." });
  } catch (error) {
    console.error("Error updating passwords:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports.userLogin = async function (req, res) {
  try {
    const { email, password } = req.body;

    const users = await Users.findOne({ where: { email } });
    if (!users) {
      return ReE(res, "Email not found.", 400);
    }

    const isMatch = await bcrypt.compare(password, users.password);
    if (!isMatch) {
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
    const user_id = req.user.id;
    const { service_booking_step } = req.body;

    let booking = await service_bookings.findOne({
      where: { user_id, payment_status: "pending" },
      order: [["created_at", "DESC"]],
    });
    if (!booking && service_booking_step !== 1) {
      return res
        .status(400)
        .json({ message: "Step 1 must be completed first." });
    }

    let payload = {
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
      address: req.body.address,
      landmark: req.body.landmark,
      area: req.body.area,
      pincode: req.body.pincode,
    };

    // Conditionally add area and pincode if training_needed_for is "other"
    if (req.body.training_needed_for === "other") {
      payload.name = req.body.name;
      payload.contact_number = req.body.contact_number;
    } else {
      let userData = await Users.findOne({
        where: { id: user_id },
      });
      if (!userData) {
        return ReE(res, "User Data Not found");
      }
      payload.contact_number = userData.mobile;
    }

    let serviceBookingsData = await service_bookings.create(payload);

    //1. After this write the payment code.
    //2. Take the above service id and update it with latest payment table entry.
    let paymentResponse = await createOrder(
      req.body.service_type,
      user_id,
      0,
      "trainer",
      serviceBookingsData.id
    );

    // let userDetail = await Users.findOne({
    //   where: {
    //     id: user_id,
    //   },
    //   attributes: ["id", "email", "name", "lat", "lon"],
    // });

    // code to send email to all the matched trainer in 10 KM radius
    // await createAndSendEnquiry(userDetail, serviceBookingsData.id);
    return res.status(200).json({
      message: `Booking data updated successfully`,
      response: { ...serviceBookingsData, paymentResponse },
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
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      phone: req.body.phone,
      requirement: req.body.requirement,
      user_id: 1,
      enquiry_for: "natal",
    };
    let a = await enquiry.create(dataData);

    return ReS(res, "Enquiry submitted");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error while submitting enquiry");
  }
};
module.exports.corporatePlan = async function (req, res) {
  try {
    let dataData = {
      name: req.body.name,
      email: req.body.email,
      company_name: req.body.company_name,
      phone: req.body.phone,
      requirement: req.body.requirement,
      user_id: 1,
      enquiry_for: "corporate",
    };
    let a = await enquiry.create(dataData);

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

    let diet_pan_detail = await diet_plan.create({
      user_id,
      type: req.body.type,
      price: req.body.price,
      plan_for: req.body.plan_for,
      gender: req.body.gender,
      name: req.body.name,
      number: req.body.number,
      age: req.body.age,
      height: req.body.height,
      weight: req.body.weight,
      goal: req.body.goal,
      diet_type: req.body.diet_type,
      daily_physical_activity: req.body.daily_physical_activity,
      allergy: req.body.allergy,
      plan_type: req.body.plan_type,
      final_price: req.body.final_price,
    });

    let paymentResponse = await createOrder(
      req.body.type,
      user_id,
      req.body.price,
      "diet",
      diet_pan_detail.id
    );

    return res.status(200).json({
      message: `Diet plan updated successfully`,
      response: { paymentResponse },
    });
  } catch (error) {
    console.error("Service Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports.transaction = async function (req, res) {
  try {
    let { limit, offset, search } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);

    const payments = await Payment.findAndCountAll({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: service_bookings,
          as: "service_booking",
          required: true,
          attributes: [
            "id",
            "booking_name",
            "preferred_time_to_be_served",
            "training_for",
            "trial_date",
            "trial_time",
            "trainer_type",
            "training_needed_for",
            "payment_status",
            "service_booking_step",
            "created_at",
          ],
        },
      ],
      attributes: [
        "id",
        "order_id",
        "payment_id",
        "amount",
        "status",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return ReS(res, "Fitness Payments fetched", payments);
  } catch (error) {
    console.error("Error fetching Fitness Payments:", error);
    return ReE(res, "An error occurred while fetching Fitness Payments", 500);
  }
};

module.exports.dietTransaction = async function (req, res) {
  try {
    let { limit, offset, search } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);

    const payments = await Payment.findAndCountAll({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: diet_plan,
          as: "diet_plan",
          required: true,
        },
      ],
      attributes: [
        "id",
        "order_id",
        "payment_id",
        "amount",
        "status",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return ReS(res, "Fitness Payments fetched", payments);
  } catch (error) {
    console.error("Error fetching Fitness Payments:", error);
    return ReE(res, "An error occurred while fetching Fitness Payments", 500);
  }
};

module.exports.ongoingEnquiry = async (req, res) => {
  try {

    let allReceivedConnectionList = await connection_data.findAndCountAll({
      where: {
        user_id: req.user.id,
        status: 1,
      },
      include: [
        {
          model: Trainers,
          as: "trainer",
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "service_type",
            "experience",
          ], // Add more fields if needed
        },
      ],
    });

    return ReS(
      res,
      "Enquiry Fetched success!",
      (response = {
        allReceivedConnectionList,
      })
    );
  } catch (error) {
    console.error("ongoing Enquiry fetching error:", error);
    return res
      .status(500)
      .json({ message: "ongoing Enquiry fetching error", error });
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
      switch (req.body.event) {
        case "payment.authorized":
          console.log("ℹ️ Payment authorized:");
          break;

        case "payment.captured":

          if (req.body.payload.payment.entity.notes.trail === true) {
            let service_booking_id =
              req.body.payload.payment.entity.notes.service_booking_id;

            let paymentDetail = await Payment.findOne({
              where: {
                service_booking_id,
                service_type:
                  req.body.payload.payment.entity.notes.service_type,
                amount: 1,
              },
            });

            if (!paymentDetail) {
              throw new Error("Payment detail not found!");
            }


            await Payment.update(
              {
                status: "success",
              },
              {
                where: {
                  id: paymentDetail.id,
                },
              }
            );

            await service_bookings.update(
              {
                trial_taken: true,
                trainer_id: paymentDetail.trainer_id,
              },
              {
                where: {
                  id:service_booking_id,
                },
              }
            );

            let requiredTrainerExperience = await service_bookings.findOne({
              where: {
                id:service_booking_id,
                
              },
            })

            let requiredTrainerEx=requiredTrainerExperience.trainer_type;
            let userDetail = await Users.findOne({

              where: {
                id: paymentDetail.user_id,
              },
              attributes: ["id", "email", "name", "lat", "lon"],
            });

            console.log("just befoer===========================")
            await createAndSendEnquiry(userDetail, service_booking_id,requiredTrainerEx);
          } else {
            // there will be two condition
            // 1. payment after taile which is service
            //2. payment of diet plan

            // if service id is present means, it is for service of type trainer or yoga
            //else is s payment for diet
            if (req.body.payload.payment.entity.notes.service_booking_id) {
              let amount = parseInt(
                req.body.payload.payment.entity.amount / 100
              );
              await Payment.update(
                {
                  status: "success",
                },
                {
                  where: {
                    service_booking_id:
                      req.body.payload.payment.entity.notes.service_booking_id,
                    service_type:
                      req.body.payload.payment.entity.notes.service_type,
                    amount: { [Op.gt]: 99 },
                  },
                }
              );

              await service_bookings.update(
                {
                  service_taken: true,
                },
                {
                  where: {
                    id:
                      req.body.payload.payment.entity.notes.service_booking_id,
                  },
                }
              );
            } else {
              await Payment.update(
                {
                  status: "success",
                },
                {
                  where: {
                    diet_plan_id:
                      req.body.payload.payment.entity.notes.diet_plan_id,
                  },
                }
              );
            }
          }
          break;

        case "payment.failed":
         

          // condition for trail payment fail for trainer or yoga
          if (req.body.payload.payment.entity.notes.trail === true) {
            let service_booking_id =
              req.body.payload.payment.entity.notes.service_booking_id;

            let paymentDetail = await Payment.findOne({
              where: {
                service_booking_id,
                service_type:
                  req.body.payload.payment.entity.notes.service_type,
                amount: 99,
              },
            });

            if (!paymentDetail) {
              throw new Error("Payment detail not found!");
            }

            await Payment.update(
              {
                status: "failed",
              },
              {
                where: {
                  id: paymentDetail.id,
                },
              }
            );
          } else {
            // condition for diet plan or trainer or yoga full payment faile
            if (req.body.payload.payment.entity.notes.service_booking_id) {
              await Payment.update(
                {
                  status: "failed",
                },
                {
                  where: {
                    service_booking_id:
                      req.body.payload.payment.entity.notes.service_booking_id,
                    service_type:
                      req.body.payload.payment.entity.notes.service_type,
                    amount: { [Op.gt]: 99 },
                  },
                }
              );
            } else {
              await Payment.update(
                {
                  status: "failed",
                },
                {
                  where: {
                    diet_plan_id:
                      req.body.payload.payment.entity.notes.diet_plan_id,
                  },
                }
              );
            }
          }

          break;
        default:
          console.log("Found nothing:");
      }

      return res
        .status(200)
        .json({ success: true, message: "Webhook verified and processed" });
    } else {
      console.log(" Signature mismatch");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports.new = (req, res) => {
  try {
    console.log("body", req.body);

    return ReS(res, "Success");
  } catch (error) {
    console.log(error);
    ReE(res, "Failed");
  }
};
