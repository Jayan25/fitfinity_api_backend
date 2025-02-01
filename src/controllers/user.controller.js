  const {Trainers,Users} = require("../models/index")
  const { ReE, ReS,createAndSendEnquiry } = require("../utils/util.service");
  const jwt = require("jsonwebtoken");
  const {generateToken}=require("../utils/jwtUtils")

  module.exports.SignUp = async function (req, res) {
    try {
      const { fullname, email, mobile, password } = req.body;
      // const otp = Math.floor(1000 + Math.random() * 9000);

      // Create a new trainer instance using Sequelize
      console.log("trainers:::::::::::::",Users)
      const newUser = await Users.create({
        name:fullname,
        email,
        mobile,
        password,
        // otp,
        // email_verified_at:new Date(),
      });

      // let userData={
      //   name,
      //   lat,
      //   lon
      // }

      // let distance=createAndSendEnquiry(userData);

      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, 'your_jwt_secret', { expiresIn: '30d' });

      return ReS(res, "Registration successful! OTP sent to your email.", token);
    } catch (error) {
      console.error(error);
      return ReE(res, "Error during registration. Please try again.");
    }
  };

  module.exports.userLogin = async function (req, res){
    try {
      const { email, password } = req.body;
  
      const users = await Users.findOne({ where: { email } });
      console.log("users:::::::::::::::::",users)
      if (!users) {
        return ReE(res, "Email not found.", 400);
      }
      
    
      if (password!=users.password) {
        return ReE(res, "Incorrect password.", 400);
      }
      let token=generateToken(users)

      let user=JSON.parse(JSON.stringify(users))
      delete user.password
  
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
  }

module.exports.createOrUpdateServiceBooking = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { service_booking_step } = req.body;

        let booking = await ServiceBooking.findOne({
          where: { user_id, payment_status: "pending" },
          order: [["createdAt", "DESC"]]
      });
        if (!booking && service_booking_step !== 1) {
            return res.status(400).json({ message: "Step 1 must be completed first." });
        }

         let bookingData = await ServiceBooking.create({
                user_id,
                service_type: req.body.service_type,
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
       

        return res.status(200).json({
            message: `Step ${service_booking_step} completed successfully`,
            booking,
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
        id: id
      }
    })

    if (!userDetail) {
      return ReE(res, "User not found!", 400)
    }
    console.log("userDetail===================", userDetail)
    let dataData = {
      lat,
      lon
    }
    await Users.update(dataData, { where: { id } })

    return ReS(res, "User lat lon updated");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error while updating user lat and lon");
  }
};
