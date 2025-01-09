  const {Trainers,Users} = require("../models/index")
  const { ReE, ReS,createAndSendEnquiry } = require("../utils/util.service");
  const jwt = require("jsonwebtoken");
  const {generateToken}=require("../utils/jwtUtils")

  module.exports.SignUp = async function (req, res) {
    try {
      const { name, email, mobile, password,lat,lon } = req.body;
      const otp = Math.floor(1000 + Math.random() * 9000);

      // Create a new trainer instance using Sequelize
      console.log("trainers:::::::::::::",Users)
      const newUser = await Users.create({
        name,
        email,
        mobile,
        password,
        otp,
        email_verified_at:new Date(),
        lat,
        lon
      });

      let userData={
        name,
        lat,
        lon
      }

      let distance=createAndSendEnquiry(userData);

      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, 'your_jwt_secret', { expiresIn: '1d' });

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
  
      return ReS(res, "Login successful.", {
        user: users,
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