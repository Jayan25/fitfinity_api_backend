const { Trainers, TrainerDocument } = require("../models/index")
const { ReE, ReS, sendEmail } = require("../utils/util.service");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/jwtUtils");
const { generateOrderSignedUploadUrl } = require("../utils/aws.service");
const { UPDATE } = require("sequelize/lib/query-types");


module.exports.SignUp = async function (req, res) {
  try {
    const { name, email, phone, password, gender, service_type, current_address, pin } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    let findTrainer = await Trainers.findOne({
      where: {
        email
      }
    })
    if (findTrainer) {
      return ReE(res, "Email alreay exist, try with another one", 400)
    }

    console.log("service_type==============", service_type)
    const newUser = await Trainers.create({
      name,
      email,
      phone,
      password,
      otp,
      gender,
      service_type,
      current_address,
      pin

    });

    let emailData = {
      email: email
    }
    await sendEmail(emailData)

    const token = generateToken(newUser)

    return ReS(res, "Registration successful, Email is sent!", { token: token, type: 'bearer' });
  } catch (error) {
    console.error("Error===============================", error);

    return ReE(res, "Error during registration. Please try again.");
  }
};

module.exports.kyc = async function (req, res) {
  try {
    let { kyc_step, education, service_type, alternate_phone, addhar_address, experience, bank_name, account_no, ifsc_code, account_holder_name } = req.body;
    let { id } = req.user;

    console.log("=========================================", req.body)

    let where = {
      id: id
    }
    console.log("where:::::::::::::::", where)
    let isInstructorActive = await Trainers.findOne({
      where
    })
    console.log("isInstructorActive::::::::::", isInstructorActive)
    if (!isInstructorActive) {
      return ReE(res, "Instructor not found!");
    }
    if (kyc_step === 1) {
      service_type = service_type[0];
      kyc_step = kyc_step + 1;

      await Trainers.update(
        {
          education, service_type, alternate_phone, addhar_address, experience, bank_name, account_no, ifsc_code: ifsc_code, education, account_holder_name, kyc_step
        },
        {
          where
        }
      )

    } else {

      console.log("TrainerDocument=============", TrainerDocument)
      let findDocumentExist = await TrainerDocument.findOne({
        where: {
          trainer_id: id
        }
      })

      if (findDocumentExist) {
        return ReE(res, "Documents already added", 400)
      }
      console.log("====================", req.body)
      const dataToUpdate = req.body?.documents?.map((item) => ({
        trainer_id: id,
        document_type: item.name,
        document_url: `https://fitfinitybucket.s3.ap-south-1.amazonaws.com/` + item.url,
        verification_status: 'inprocess'
      }));
      console.log("dataToUpdate==========================", dataToUpdate);
      await TrainerDocument.bulkCreate(dataToUpdate);
      await Trainers.update(
        {
          kyc_status: "inprocess"
        },
        {
          where: {
            id: id
          }
        }
      )

    }


    return ReS(res, "Details Added successfully!");
  } catch (error) {
    console.error(error);
    return ReE(res, error);
  }
};


module.exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    let findTrainer = await Trainers.findOne({
      where: {
        email
      }
    })
    if (!findTrainer) {
      return ReE(res, "Email not found!", 400)
    }

    if (findTrainer?.password !== password) {
      return ReE(res, "Password is not correct!");
    }
    const token = generateToken(findTrainer)

    return ReS(res, "Login is successfully done!", { token: token, type: 'bearer' });
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during login. Please try again.");
  }
};

module.exports.trainerStatus = async function (req, res) {
  try {
    const { id } = req.user;
    let findTrainer = await Trainers.findOne({
      where: {
        id: id
      }
    })
    console.log("findTrainer====================", findTrainer)

    if (!findTrainer) {
      return ReE(res, "Trainer not found!", 400)
    }

    let resopnse = {
      kyc_step: findTrainer.kyc_step,
      kyc_status: findTrainer.kyc_status
    }

    return ReS(res, "Trainer detail", resopnse);
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during registration. Please try again.");
  }
};

module.exports.latlonUpdation = async function (req, res) {
  try {
    const { id } = req.user;
    const { lat, lon } = req.body;
    let findTrainer = await Trainers.findOne({
      where: {
        id: id
      }
    })

    if (!findTrainer) {
      return ReE(res, "Trainer not found!", 400)
    }
    console.log("findTrainer===================", findTrainer)
    let dataData = {
      lat,
      lon
    }
    await Trainers.update(dataData, { where: { id } })

    return ReS(res, "Trainer lat lon updated");
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during registration. Please try again.");
  }
};


module.exports.profileData = async function (req, res) {
  try {
    const { id } = req.user;

    let findTrainer = await Trainers.findOne({
      where: {
        id: id
      },
      include: [
        {
          model: TrainerDocument,
          as: 'trainer_documents',
          required: false,
          where: { document_type: "training_photo" }
        },
      ],
    });

    if (!findTrainer) {
      return ReE(res, "Trainer not found!", 400);
    }
    let response = JSON.parse(JSON.stringify(findTrainer));
    delete response.otp;
    delete response.password;
    delete response.created_at;
    delete response.updated_at;
    delete response.id;
    response.rating = null;

    return ReS(res, "Trainer data retrived", response);
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during registration. Please try again.");
  }
};


module.exports.generateSignedUrl = async function (req, res) {
  try {
    const { bucketName, expiresIn, key } = req.body;

    if (!bucketName || !expiresIn || !key) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters: bucketName, expiresIn, or key.',
      });
    }

    const result = await generateOrderSignedUploadUrl({ bucketName, expiresIn, key });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: error.message || 'Internal Server Error',
    });
  }
};