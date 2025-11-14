const {
  Trainers,
  Users,
  service_bookings,
  enquiry,
  diet_plan,
  fitness_plan, // <-- added
  Payment,
  connection_data,
} = require("../models/index");
const {
  ReE,
  ReS,
  createAndSendEnquiry,
  sendOtp,
  resetPasswordOtp,
} = require("../utils/util.service");
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
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      name: fullname,
      email,
      mobile,
      password: hashedPassword,
    });

    const users = await Users.findOne({ where: { email } });
    let user = JSON.parse(JSON.stringify(users));
    delete user.password;

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
    const users = await Trainers.findAll();

    for (const user of users) {
      if (!user.password.startsWith("$2b$")) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
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

    console.log("serviceBookingsData.id=========", serviceBookingsData.id);

    let paymentResponse = await createOrder(
      req.body.service_type,
      user_id,
      0,
      "trainer",
      serviceBookingsData.id
    );

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

module.exports.natalEnquiry = async (req, res) => {
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

// NEW: fitnessPlan controller (mirrors dietPlan)
module.exports.fitnessPlan = async (req, res) => {
  try {
    const user_id = req.user.id;
    console.log("req,===============", req.body);
    let fitness_plan_detail = await fitness_plan.create({
      user_id,
      type: req.body.type,
      plan_for: req.body.plan_for,
      gender: req.body.gender,
      height: req.body.height,
      weight: req.body.weight,
      any_body_pain: req.body.any_body_pain,
      any_injury: req.body.any_injury,
      age: req.body.age,
      goal: req.body.goal,

      last_workout: req.body.last_workout,
      daily_physical_activity: req.body.daily_physical_activity,
      medical_condition: req.body.medical_condition,
      price: req.body.price,
      plan_type: req.body.plan_type,
    });

    console.log("here================", fitness_plan_detail);

    let paymentResponse = await createOrder(
      req.body.type,
      user_id,
      req.body.price,
      "fitness", // important: tells createOrder to write fitness_plan_id
      fitness_plan_detail.id
    );

    console.log("here======2222222==========", paymentResponse);

    return res.status(200).json({
      message: `Fitness plan updated successfully`,
      response: { paymentResponse },
    });
  } catch (error) {
    console.error("Fitness Plan Error:", error);
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

    return ReS(res, "Diet Payments fetched", payments);
  } catch (error) {
    console.error("Error fetching Diet Payments:", error);
    return ReE(res, "An error occurred while fetching Diet Payments", 500);
  }
};

// NEW: fitnessTransaction to list fitness plan payments
module.exports.fitnessTransaction = async function (req, res) {
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
          model: fitness_plan,
          as: "fitness_plan",
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
          ],
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

    console.log("Just before the webhook===================");
    console.log("Just before the webhook======body=============", body);

    if (signature === expectedSignature) {
      const notes =
        (req.body &&
          req.body.payload &&
          req.body.payload.payment &&
          req.body.payload.payment.entity &&
          req.body.payload.payment.entity.notes) ||
        {};

      switch (req.body.event) {
        case "payment.authorized":
          console.log("ℹ️ Payment authorized:");
          break;

        case "payment.captured":
          console.log("payment.captured notes:", notes);

          // handle trial payments (trail flag may be boolean or string)
          if (notes.trail === true || notes.trail === "true") {
            let service_booking_id = notes.service_booking_id;

            let paymentDetail = await Payment.findOne({
              where: {
                service_booking_id,
                service_type: notes.service_type,
                amount: 99,
              },
            });

            if (!paymentDetail) {
              throw new Error("Payment detail not found!");
            }

            await Payment.update(
              { status: "success" },
              { where: { id: paymentDetail.id } }
            );

            await service_bookings.update(
              {
                trial_taken: true,
                trainer_id: paymentDetail.trainer_id,
              },
              {
                where: {
                  id: service_booking_id,
                },
              }
            );

            let requiredTrainerExperience = await service_bookings.findOne({
              where: {
                id: service_booking_id,
              },
            });

            let requiredTrainerEx = requiredTrainerExperience?.trainer_type;
            let userDetail = await Users.findOne({
              where: {
                id: paymentDetail.user_id,
              },
              attributes: ["id", "email", "name", "lat", "lon"],
            });

            if (paymentDetail.trainer_id && paymentDetail.trainer_id == 123) {
              // we have a condition where admin can connect the user and trainer, but in normal case till here in payment table by defaul dummy trainer id 123
              await createAndSendEnquiry(
                userDetail,
                service_booking_id,
                requiredTrainerEx
              );
            } else {
              // Connecting the user with trainer and doing entry in connection_data

              

              let createNewEntry={
                user_id: userDetail.id,
                trainer_id: paymentDetail.trainer_id,
                status: 0,
                service_booking_id,
              };

              const trainerUser = await Trainers.findOne({
                where: { id: paymentDetail.trainer_id },
                attributes: ["fcm_token"],
              });

              if (trainerUser?.fcm_token) {
                try {
                  await admin.messaging().send({
                    notification: {
                      title: "New Enquiry Nearby!",
                      body: `${userDetail.name} is looking for training help near you.`,
                    },
                    android: {
                      notification: {
                        sound: "fitring",
                        channelId: "custom-sound-channel",
                      },
                    },
                    apns: {
                      payload: {
                        aps: {
                          sound: "fitring.wav",
                        },
                      },
                    },
                    token: trainerUser.fcm_token,
                  });
                } catch (notificationError) {
                  console.error(
                    `Failed to send notification to trainer id ${trainer.id}:`,
                    notificationError.message
                  );
                  
                }
              }

              await connection_data.create(createNewEntry);
            }
          } else {
            // Non-trial payments: trainer/service vs diet vs fitness
            if (notes.service_booking_id) {
              let amount = parseInt(
                req.body.payload.payment.entity.amount / 100
              );
              await Payment.update(
                { status: "success" },
                {
                  where: {
                    service_booking_id: notes.service_booking_id,
                    service_type: notes.service_type,
                    amount: { [Op.gt]: 99 },
                    order_id: req.body.payload.payment.entity.order_id,
                  },
                }
              );

              await service_bookings.update(
                { service_taken: true },
                { where: { id: notes.service_booking_id } }
              );

              await connection_data.update(
                { status: 3 },
                {
                  where: {
                    service_booking_id: notes.service_booking_id,
                    status: 1,
                  },
                }
              );
            } else {
              // diet or fitness
              if (notes.fitness_plan_id) {
                await Payment.update(
                  { status: "success" },
                  { where: { fitness_plan_id: notes.fitness_plan_id } }
                );
              } else {
                await Payment.update(
                  { status: "success" },
                  {
                    where: {
                      diet_plan_id: notes.diet_plan_id,
                    },
                  }
                );
              }
            }
          }
          break;

        case "payment.failed":
          // handle trial failures
          if (notes.trail === true || notes.trail === "true") {
            let service_booking_id = notes.service_booking_id;

            let paymentDetail = await Payment.findOne({
              where: {
                service_booking_id,
                service_type: notes.service_type,
                amount: 99,
              },
            });

            if (!paymentDetail) {
              throw new Error("Payment detail not found!");
            }

            await Payment.update(
              { status: "failed" },
              { where: { id: paymentDetail.id } }
            );
          } else {
            // Non-trial failed: service booking OR diet OR fitness
            if (notes.service_booking_id) {
              await Payment.update(
                { status: "failed" },
                {
                  where: {
                    service_booking_id: notes.service_booking_id,
                    service_type: notes.service_type,
                    amount: { [Op.gt]: 99 },
                  },
                }
              );
            } else {
              if (notes.fitness_plan_id) {
                await Payment.update(
                  { status: "failed" },
                  { where: { fitness_plan_id: notes.fitness_plan_id } }
                );
              } else {
                await Payment.update(
                  { status: "failed" },
                  {
                    where: {
                      diet_plan_id: notes.diet_plan_id,
                    },
                  }
                );
              }
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

module.exports.requestPasswordReset = async function (req, res) {
  try {
    const { email } = req.body;
    if (!email) return ReE(res, "Email is required.");

    const user = await Users.findOne({ where: { email } });
    if (!user) return ReE(res, "User with this email does not exist.");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Users.update({ password_reset_otp: otp }, { where: { email } });

    await resetPasswordOtp({
      email,
      otp,
      name: user.name || "User",
    });

    return ReS(res, "Password reset OTP sent to your email.");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error requesting password reset. Please try again.");
  }
};

module.exports.resetPassword = async function (req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return ReE(res, "Email, OTP, and new password are required.");
    }

    const user = await Users.findOne({ where: { email } });

    if (!user) return ReE(res, "User not found.");
    if (user.password_reset_otp !== otp) return ReE(res, "Invalid OTP.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Users.update(
      { password: hashedPassword, password_reset_otp: null },
      { where: { email } }
    );

    return ReS(res, "Password has been reset successfully.");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error resetting password. Please try again.");
  }
};
