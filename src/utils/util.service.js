const nodemailer = require("nodemailer");
const Trainers = require("../models/trainer.model");
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


let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "fitfinitytrainer@gmail.com",
    pass: "hlon bqic fvxe erhd",
  },
});


module.exports.sendEmail = async function (emailData) {

  const receiver = {
    from: "fitfinitytrainer@gmail.com",
    to: emailData.email,
    subject: `Congratulations & Welcome to Fitfinity Trainer, ${emailData.name}!`,
    html: `
      <p>Dear ${emailData.name},</p>
  
      <p>Congratulations and welcome to <strong>Fitfinity Trainer</strong>! We’re thrilled to have you join our team. Your passion for fitness and commitment to helping others achieve their goals make you a perfect fit for our community.</p>
  
      <p>At <strong>Fitfinity Trainer</strong>, we aim to provide an engaging and supportive environment where trainers like you can connect with clients, share expertise, and grow professionally.</p>
  
      <p>If you have any questions, our support team is always here to help. Feel free to reach out at <a href="mailto:fitfinitytrainer@gmail.com">fitfinitytrainer@gmail.com</a>.</p>
  
      <p>Follow us on Instagram: <a href="https://www.instagram.com/fitfinitytrainer?igsh=YmplM2c5azI1d21j&utm_source=qr" target="_blank">Fitfinity Trainer Instagram</a></p>
  
      <p>Once again, welcome aboard! We’re excited to see you thrive and make a positive impact.</p>
  
      <p>Best regards,</p>
      <p><strong>Team Fitfinity Trainer</strong></p>
    `,
  };
  transporter.sendMail(receiver, (error, emailResponse) => {
    if (error) {
      console.log("Email sent failed!!", error)
      return;
    }

    console.log("Email Sent success!")
  })
}


module.exports.createAndSendEnquiry = async function (userDetail) {
  try {

    let trainerList = await Trainers.find({
      where: {
        kyc_status: "done",
        block_status: "Unblocked",
      }
    })

    for (let i = 0; i < trainerList.length; i++) {
      let trainer = trainerList[i];
      if (userDetail.lat == trainer.lat && userDetail.lon == trainer.lon) {
        return resolve(0);
      }

      const radlat1 = (Math.PI * userDetail.lat) / 180;
      const radlat2 = (Math.PI * instructor_lat) / 180;
      const theta = userDetail.lon - trainer.lon;
      const radtheta = (Math.PI * theta) / 180;

      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;

      // dist in KM
      const final_dist = dist * 1.609344;

      return parseFloat(distance).toFixed(2)

    }
  } catch {
    throw new Error("Something went wrong while sending enquiry");
  }

}