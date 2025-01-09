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
    user: "adityapandey272002@gmail.com",
    pass: "jfax qkqm nfcp kyuu",
  },
});


module.exports.sendEmail = async function (emailData) {

  const receiver = {
    from: "adityapandey272002@gmail.com",
    to: `${emailData.email}`,
    subject: "Registration Success on Fitfinity!!",
    text: "Congraludation your resigtraion is successfully done on Fitfinity. Clickk here to download the app and complete the KYC"
  }
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