const nodemailer = require("nodemailer");
const {Users,Trainers} = require("../models/index");
const dotenv = require("dotenv");
dotenv.config();

module.exports.ReE = async function (res, err, code) {
  if (typeof err == "object" && typeof err.message != "undefined") {
    err = err.message;
  }
  if (typeof code !== "undefined") res.statusCode = code;
  return res.json({ success: false, message: err });
};

module.exports.ReS = async function (res, msg, data) {
  let send_data = { success: true, message: msg, response: data };
  res.statusCode = 200;

  return res.json(send_data);
};

console.log("process.env.USER=========",process.env.EMAIL);
console.log("process.env.USER=========",process.env.PASSWORD);


let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


module.exports.sendEmail = async function (emailData) {
  const receiver = {
    from: process.env.EMAIL,
    to: emailData.email,
    subject: `Congratulations & Welcome to Fitfinity Trainer, ${emailData.name}!`,
    html: `
     <div style="text-align: center;">
        <img src="https://fitfinitybucket.s3.ap-south-1.amazonaws.com/WhatsApp+Image+2025-03-09+at+3.03.53+AM.jpeg" 
             alt="Welcome to Fitfinity Trainer" 
             style="max-width: 100%; height: auto; border-radius: 10px; margin-bottom: 20px;" />
      </div>
      <p>Dear ${emailData.name},</p>

      <p>Congratulations and welcome to <strong>Fitfinity Trainer</strong>! We’re thrilled to have you join our team. Your passion for fitness and commitment to helping others achieve their goals make you a perfect fit for our community.</p>

      <p>At <strong>Fitfinity Trainer</strong>, we aim to provide an engaging and supportive environment where trainers like you can connect with clients, share expertise, and grow professionally.</p>

      <p>If you have any questions, our support team is always here to help. Feel free to reach out at <a href="mailto:fitfinitytrainer@gmail.com">fitfinitytrainer@gmail.com</a>.</p>

      <p>Follow us on Instagram: <a href="https://www.instagram.com/fitfinitytrainer?igsh=YmplM2c5azI1d21j&utm_source=qr" target="_blank">Fitfinity Trainer Instagram</a></p>
      <p>Follow us on Facebook: <a href="https://www.facebook.com/share/1B9HU1t77t/" target="_blank">Fitfinity Trainer Facebook</a></p>

      <p>Once again, welcome aboard! We’re excited to see you thrive and make a positive impact.</p>

      <p>Best regards,</p>
      <p><strong>Team Fitfinity Trainer</strong></p>
    `,
  };

  transporter.sendMail(receiver, (error, emailResponse) => {
    if (error) {
      console.log("Email sent failed!!", error);
      return;
    }

    console.log("Email Sent success!");
  });
}

async function sendTrainerNotificationEmail(emailData, user) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: emailData.email,
    subject: `A user is nearby — Secure your booking now!`,
    html: `
      <p>Dear ${emailData.name},</p>
      <p>Exciting news! A user is currently near your location and may be looking to book a service.</p>

      <p><strong>Details:</strong></p>
      <ul>
        <li>Name: ${user.name || 'N/A'}</li>
        <li>Email: ${user.email || 'N/A'}</li>
        <li>Location Coordinates: (${user.lat}, ${user.lon})</li>
      </ul>

      <p>We encourage you to check the Fitfinity Trainer app immediately and secure the booking opportunity before someone else does!</p>

      <p>📲 Be proactive. Stay ahead. Grow your business with Fitfinity.</p>

      <p>Best Regards,</p>
      <p><strong>Team Fitfinity Trainer</strong></p>
    `
  };

  
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Failed to send email to trainer:", err.message);
    } else {
      console.log(`Email sent to ${emailData.email}`);
    }
  });
}

module.exports.sendTrainerNotificationEmail = sendTrainerNotificationEmail;

async function sendAdminNoTrainerFoundEmail(user) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL, // Admin Email
    subject: `🚨 No Trainers Found Nearby for User ID ${user.id}`,
    html: `
      <p>Dear Admin,</p>
      <p>No trainers were found within ${RADIUS_KM} km radius for the following user:</p>
      <ul>
        <li>User ID: ${user.id}</li>
        <li>Name: ${user.name || 'N/A'}</li>
        <li>Email: ${user.email || 'N/A'}</li>
        <li>Location Coordinates: (${user.lat}, ${user.lon})</li>
      </ul>
      <p>This might be a good opportunity to onboard more trainers in this area.</p>
      <p>Thanks,<br/><strong>Fitfinity System</strong></p>
    `
  };

  await transporter.sendMail(mailOptions);
}


const RADIUS_KM = process.env.RADIUS_KM;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) +
             Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.min(1, dist);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  return dist * 1.609344; // KM
}

module.exports.createAndSendEnquiry = async function (userDetail) {
  try {

    console.log("Trainers===",Trainers);
    

    const trainerList = await Trainers.findAll({
      where: {
        kyc_status: "done",
        block_status: "Unblocked",
      },
      attributes: ['id', 'email', 'name', 'lat', 'lon']
    });

    console.log("trainerList==============",trainerList.length);
    
    const nearbyTrainers = [];

    console.log("RADIUS_KM====",RADIUS_KM);
    

    for (let trainer of trainerList) {
      if (trainer.lat && trainer.lon && userDetail.lat && userDetail.lon) {
        const distance = calculateDistance(userDetail.lat, userDetail.lon, trainer.lat, trainer.lon);
        console.log("distane========",distance);
        
        if (distance <= RADIUS_KM) {
          nearbyTrainers.push(trainer);
        }
      }
    }

    console.log("After for loooopppppppp",nearbyTrainers.length);
    

    if (nearbyTrainers.length === 0) {
      await sendAdminNoTrainerFoundEmail(userDetail);
    } else {
      for (let trainer of nearbyTrainers) {
        
        await sendTrainerNotificationEmail({
          email: trainer.email,
          name: trainer.name
        }, userDetail);
      }
    }

  } catch (error) {
    console.error("Error in createAndSendEnquiry:", error.message);
    throw new Error("Something went wrong while sending enquiry");
  }
};

