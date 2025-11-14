const {
  Trainers,
  Admins,
  TrainerDocument,
  Users,
  enquiry,
  service_bookings,
  diet_plan,
  Payment,
} = require("../models/index");
const {
  ReE,
  ReS,
  sendEmail,
  sendKycRejectionEmail,
} = require("../utils/util.service");
const { generateToken } = require("../utils/jwtUtils");
const { off } = require("../../app");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { createOrder } = require("../utils/payment.service");


module.exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    let findTrainer = await Admins.findOne({
      where: {
        email,
      },
    });
    if (!findTrainer) {
      return ReE(res, "Trainer not found!", 400);
    }

    const isMatch = await bcrypt.compare(password, findTrainer.password);
    if (!isMatch) {
      return ReE(res, "Password is not correct!");
    }
    const token = generateToken(findTrainer);

    return ReS(res, "Registration successful, Email is sent!", {
      token: token,
      type: "bearer",
    });
  } catch (error) {
    console.error(error);
    return ReE(res, "Error during registration. Please try again.");
  }
};

module.exports.getAllTrainers = async function (req, res) {
  try {
    let { limit, offset, search, kyc_status, block_status, service_type } =
      req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);

    let where = {};
    if (search) {
      where.name = { [Op.like]: `${search}%` };
    }
    if (kyc_status) {
      where.kyc_status = kyc_status;
    }
    if (block_status) {
      where.block_status = block_status;
    }

    if (service_type && service_type !== "all") {
      where.service_type = service_type; //Fitness Trainer,Yoga Trainer, all
    }

    const trainers = await Trainers.findAndCountAll({
      where: where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      distinct: true,
      include: [
        {
          model: TrainerDocument,
          as: "trainer_documents",
          required: false,
        },
      ],
    });

    return ReS(res, "Trainers list fetched", trainers);
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return ReE(res, "An error occurred while fetching trainers", 500);
  }
};

module.exports.getTrainerDetails = async function (req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return ReE(res, "Invalid trainer ID provided", 400);
    }

    const trainer = await Trainers.findOne({
      where: { id },
      paranoid: false,
      include: [
        {
          model: TrainerDocument,
          as: "trainer_documents",
          required: false,
        },
      ],
    });

    if (!trainer) {
      return ReE(res, "Trainer not found!", 404);
    }

    return ReS(res, "Trainer details fetched successfully", trainer);
  } catch (error) {
    console.error("Error fetching trainer details:", error);
    return ReS(res, "An error occurred while fetching trainer details", 500);
  }
};

module.exports.deleteTrainer = async function (req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return ReE(res, "Invalid trainer ID provided", 400);
    }

    const trainer = await Trainers.findByPk(id);
    if (!trainer) {
      return ReE(res, "Trainer not found", 404);
    }

    console.log("trainer===========", trainer);
    console.log("new Date()===========", new Date());
    console.log("id===========", id);

   
    await Trainers.destroy({
      where: { id },
      force: true  
    });

    await TrainerDocument.destroy({
      where: {
        trainer_id: id,
      },
    });
    
    return ReS(res, "Trainer deleted successfully");
  } catch (error) {
    console.error("Error deleting admin:", error);
    return ReE(res, "An error occurred while deleting the trainer", 500);
  }
};

module.exports.blockUnblock = async function (req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || isNaN(id)) {
      return ReE(res, "Invalid trainer ID provided", 400);
    }

    const trainer = await Trainers.findByPk(id);
    if (!trainer) {
      return ReE(res, "Trainer not found", 404);
    }

    let data = await Trainers.update(
      { block_status: status },
      { where: { id } }
    );

    return ReS(res, "Trainer updated successfully");
  } catch (error) {
    console.error("Error deleting admin:", error);
    return ReE(res, "An error occurred while updating the trainer", 500);
  }
};

module.exports.updateDocument = async function (req, res) {
  try {
    const { id } = req.params;
    const { verification_status } = req.body;
    if (!id || isNaN(id)) {
      return ReE(res, "Invalid trainer ID provided", 400);
    }

    // let data = await Trainers.update(
    //   { verification_status: verification_status },
    //   { where: { id } }
    // );

    let where = {
      id: id,
    };
    let data = await TrainerDocument.update(
      {
        verfication_status: verification_status,
      },
      {
        where,
      }
    );

    return ReS(res, "Trainer documnet status updated!");
  } catch (error) {
    console.error("Error while updating trainer", error);
    return ReE(res, "An error occurred while updating the trainer", 500);
  }
};
module.exports.verifyTrainerKyc = async function (req, res) {
  try {
    const { id } = req.params;
    const { kyc_status, reject_reason } = req.body;
    if (!id || isNaN(id)) {
      return ReE(res, "Invalid trainer ID provided", 400);
    }

    let trainerData = await Trainers.findOne({ where: { id } });

    if (!trainerData) {
      return ReE(res, "Trainer not found!", 404);
    }

    if (kyc_status === "done") {
      // KYC approved: clear any previous rejection reason
      await Trainers.update(
        { kyc_status: kyc_status, kyc_reject_reason: null },
        { where: { id } }
      );
      let where = {
        trainer_id: id,
      };
      await TrainerDocument.update(
        {
          verfication_status: "success",
        },
        {
          where,
        }
      );
      let emailData = {
        email: trainerData.email,
        name: trainerData.name,
      };
      await sendEmail(emailData);
    } else {
      // KYC failed: store rejection reason and mark documents as failed
      await Trainers.update(
        { kyc_status: kyc_status, kyc_reject_reason: reject_reason },
        { where: { id } }
      );
      const docWhere = { trainer_id: id };
      await TrainerDocument.update(
        { verfication_status: "failed" },
        { where: docWhere }
      );
      // Send rejection email to trainer
      await sendKycRejectionEmail({
        email: trainerData.email,
        name: trainerData.name,
        reject_reason: reject_reason,
      });
    }

    return ReS(res, "Trainer KYC status updated!");
  } catch (error) {
    console.error("Error while updating trainer", error);
    return ReE(res, "An error occurred while updating the trainer", 500);
  }
};

module.exports.getAllUsers = async function (req, res) {
  try {
    let { limit, offset, search } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);
    let where = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
        }
      : {};

    const userList = await Users.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Payment,
          as: "payments",
          required: false,
          include: [
            {
              model: service_bookings,
              as: "service_booking",
              required: false,
            },
            {
              model: Trainers,
              as: "trainer",
              required: false,
            },
          ],
        },
      ],
      distinct: true,
    });
    return ReS(res, "User list fetched", userList);
  } catch (error) {
    console.error("Error fetching Users:", error);
    return ReE(res, "An error occurred while fetching trainers", 500);
  }
};

module.exports.getUsersDetail = async function (req, res) {
  try {
    let { id } = req.params;

    const userList = await Users.findOne({
      where: {
        id,
      },
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Payment,
          as: "payments",
          required: false,
          include: [
            {
              model: service_bookings,
              as: "service_booking",
              required: false,
            },
            {
              model: Trainers,
              as: "trainer",
              required: false,
            },
          ],
        },
      ],
      distinct: true,
    });
    return ReS(res, "User list fetched", userList);
  } catch (error) {
    console.error("Error fetching Users:", error);
    return ReE(res, "An error occurred while fetching trainers", 500);
  }
};

module.exports.getAllNatalEnquiry = async function (req, res) {
  try {
    let { limit, offset, search } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);
    let where = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
          enquiry_for: "natal",
        }
      : { enquiry_for: "natal" };

    const natalList = await enquiry.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["user_id"] },
    });
    return ReS(res, "Natal list fetched", natalList);
  } catch (error) {
    console.error("Error fetching Users:", error);
    return ReE(res, "An error occurred while fetching natal enquiry", 500);
  }
};

module.exports.getAllCorporateEnquiry = async function (req, res) {
  try {
    let { limit, offset, search } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);
    let where = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
          enquiry_for: "corporate",
        }
      : { enquiry_for: "corporate" };

    const corporateList = await enquiry.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["user_id"] },
    });

    return ReS(res, "Corporate list fetched", corporateList);
  } catch (error) {
    console.error("Error fetching Users:", error);
    return ReE(res, "An error occurred while fetching Corporate enquiry", 500);
  }
};
module.exports.getAllFitnessgPayment = async function (req, res) {
  try {
    let { limit, offset, search, filterType, startDate, endDate } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);

    // User search filter
    const userFilter = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
        }
      : {};

    // Date range based on filterType
    const bookingFilter = {
      service_type: "fitness",
    };
    if (filterType) {
      let start, end;

      switch (filterType) {
        case "today":
          start = moment().startOf("day").toDate();
          end = moment().endOf("day").toDate();
          break;
        case "weekly":
          start = moment().startOf("week").toDate();
          end = moment().endOf("week").toDate();
          break;
        case "monthly":
          start = moment().startOf("month").toDate();
          end = moment().endOf("month").toDate();
          break;
        case "yearly":
          start = moment().startOf("year").toDate();
          end = moment().endOf("year").toDate();
          break;
        case "custom":
          if (startDate && endDate) {
            start = moment(startDate).startOf("day").toDate();
            end = moment(endDate).endOf("day").toDate();
          } else {
            return ReE(
              res,
              "Custom filter requires startDate and endDate",
              400
            );
          }
          break;
        default:
          return ReE(res, "Invalid filterType value", 400);
      }

      bookingFilter.created_at = {
        [Op.between]: [start, end],
      };
    }

    const payments = await Payment.findAndCountAll({
      include: [
        {
          model: service_bookings,
          as: "service_booking",
          required: true,
          where: bookingFilter,

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
          include: [
            {
              model: Users,
              where: userFilter,
              as: "user",
              attributes: ["id", "name", "email", "mobile", "address"],
              required: true,
            },
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

    const totalAmount = payments.rows.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);
    return ReS(res, "Fitness Payments fetched", { ...payments, totalAmount });
  } catch (error) {
    console.error("Error fetching Fitness Payments:", error);
    return ReE(res, "An error occurred while fetching Fitness Payments", 500);
  }
};

module.exports.getAllYogaPayment = async function (req, res) {
  try {
    let { limit, offset, search, filterType, startDate, endDate } = req.query;
    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);

    const userFilter = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
        }
      : {};

    const bookingFilter = {
      service_type: "yoga",
    };
    if (filterType) {
      let start, end;

      switch (filterType) {
        case "today":
          start = moment().startOf("day").toDate();
          end = moment().endOf("day").toDate();
          break;
        case "weekly":
          start = moment().startOf("week").toDate();
          end = moment().endOf("week").toDate();
          break;
        case "monthly":
          start = moment().startOf("month").toDate();
          end = moment().endOf("month").toDate();
          break;
        case "yearly":
          start = moment().startOf("year").toDate();
          end = moment().endOf("year").toDate();
          break;
        case "custom":
          if (startDate && endDate) {
            start = moment(startDate).startOf("day").toDate();
            end = moment(endDate).endOf("day").toDate();
          } else {
            return ReE(
              res,
              "Custom filter requires startDate and endDate",
              400
            );
          }
          break;
        default:
          return ReE(res, "Invalid filterType value", 400);
      }

      bookingFilter.created_at = {
        [Op.between]: [start, end],
      };
    }

    const payments = await Payment.findAndCountAll({
      include: [
        {
          model: service_bookings,
          as: "service_booking",
          required: true,
          where: bookingFilter,
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
          include: [
            {
              model: Users,
              as: "user",
              attributes: ["id", "name", "email", "mobile", "address"],
              where: userFilter,
              required: !!search, // ✅ Optional filter: only required true if search is given
            },
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
    const totalAmount = payments.rows.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);

    return ReS(res, "Yoga Payments fetched", { ...payments, totalAmount });
  } catch (error) {
    console.error("Error fetching Yoga Payments:", error);
    return ReE(res, "An error occurred while fetching Yoga Payments", 500);
  }
};

module.exports.getAlldietPlanPayment = async function (req, res) {
  try {
    let { limit, offset, search, filterType, startDate, endDate } = req.query;
    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);
    let where = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
        }
      : {};

    // Add date filter to same 'where' object
    if (filterType) {
      let start, end;

      switch (filterType) {
        case "today":
          start = moment().startOf("day").toDate();
          end = moment().endOf("day").toDate();
          break;
        case "weekly":
          start = moment().startOf("week").toDate();
          end = moment().endOf("week").toDate();
          break;
        case "monthly":
          start = moment().startOf("month").toDate();
          end = moment().endOf("month").toDate();
          break;
        case "yearly":
          start = moment().startOf("year").toDate();
          end = moment().endOf("year").toDate();
          break;
        case "custom":
          if (startDate && endDate) {
            start = moment(startDate).startOf("day").toDate();
            end = moment(endDate).endOf("day").toDate();
          } else {
            return ReE(
              res,
              "Custom filter requires startDate and endDate",
              400
            );
          }
          break;
        default:
          return ReE(res, "Invalid filterType value", 400);
      }

      where.created_at = {
        [Op.between]: [start, end],
      };
    }
    const serviceBookingList = await diet_plan.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "email", "mobile", "address"], // Add any fields you want from the Users table
        },
        {
          model:Payment,
          as:"payments",
          attributes: ["id", "status", "amount", "service_type"],
        }
      ],
    });

    const totalAmount = serviceBookingList.rows.reduce((sum, item) => {
      return sum + Number(item.price || 0);
    }, 0);

    return ReS(res, "Diet Payment feteched", {
      ...serviceBookingList,
      totalAmount,
    });
  } catch (error) {
    console.error("Error fetching Users:", error);
    return ReE(res, "An error occurred while fetching Diet Payment", 500);
  }
};

module.exports.trainerToConnect = async function (req, res) {
  try {
    let { limit, offset, search, service_type } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);

    let where = {
      kyc_status: "done",
    };
    if (search) {
      where.name = { [Op.like]: `${search}%` };
    }

    if (service_type && service_type !== "all") {
      where.service_type = service_type; //Fitness Trainer,Yoga Trainer, all
    }

    const trainers = await Trainers.findAndCountAll({
      where: where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      distinct: true,
    });

    return ReS(res, "Trainers list fetched", trainers);
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return ReE(res, "An error occurred while fetching trainers", 500);
  }
};



module.exports.connectUserWithTrainer = async (req, res) => {
  try {
    // const user_id = req.user.id;

    // get all the require data
    const {user_id,trainer_id,service_type,booking_name,preferred_time_to_be_served,training_for,trial_date,trial_time,trainer_type,training_needed_for,address,landmark,area,pincode}=req.body;

    console.log("requeest===========")
    let payload = {
      user_id,
      service_type:service_type,
      booking_name: booking_name,
      preferred_time_to_be_served: preferred_time_to_be_served,
      training_for:training_for,
      trial_date: trial_date,
      trial_time: trial_time,
      payment_status: "pending",
      trial_taken: false,
      service_taken: false,
      service_booking_step: "1",
      trainer_type: trainer_type,
      training_needed_for: training_needed_for,
      address: address,
      landmark: landmark,
      area: area,
      pincode: pincode,
    };

    console.log("requeest===========spayload:",payload)

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

    console.log("requeest===========serviceBookingsData:",serviceBookingsData)
    

    let paymentResponse = await createOrder(
      req.body.service_type,
      user_id,
      0,
      "trainer",
      serviceBookingsData.id,
      trainer_id
    );

     console.log("requeest===========paymentResponse:",paymentResponse)

    return res.status(200).json({
      message: `Booking data updated successfully`,
      response: { ...serviceBookingsData, paymentResponse },
    });
  } catch (error) {
    console.error("Service Booking Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};