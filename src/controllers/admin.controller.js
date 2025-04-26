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
const { ReE, ReS, sendEmail, sendKycRejectionEmail } = require("../utils/util.service");
const { generateToken } = require("../utils/jwtUtils");
const { off } = require("../../app");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    let findTrainer = await Admins.findOne({
      where: {
        email,
      },
    });
    console.log(findTrainer);
    console.log(password);
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
    let { limit, offset, search, kyc_status, block_status } = req.query;

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

    await Trainers.update({ deleted_at: new Date() }, { where: { id } });

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

    console.log("id=======", id);
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

    console.log("data===========", data);

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
    let { limit, offset, search } = req.query;

    limit = isNaN(Number(limit)) ? 10 : Number(limit);
    offset = isNaN(Number(offset)) ? 0 : Number(offset);
    const userFilter = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
        }
      : {};

    const payments = await Payment.findAndCountAll({
      include: [
        {
          model: service_bookings,
          as: "service_booking",
          required: true,
          where: {
            service_type: "fitness",
          },
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

    return ReS(res, "Fitness Payments fetched", payments);
  } catch (error) {
    console.error("Error fetching Fitness Payments:", error);
    return ReE(res, "An error occurred while fetching Fitness Payments", 500);
  }
};

module.exports.getAllYogaPayment = async function (req, res) {
  try {
    let { limit, offset, search } = req.query;
    limit = isNaN(Number(limit)) ? 10 : Number(limit); // ✅ fix here
    offset = isNaN(Number(offset)) ? 0 : Number(offset);

    // Search filter by user name
    const userFilter = search
      ? {
          name: {
            [Op.like]: `${search}%`,
          },
        }
      : {};

    const payments = await Payment.findAndCountAll({
      include: [
        {
          model: service_bookings,
          as: "service_booking",
          required: true,
          where: {
            service_type: "yoga",
          },
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

    return ReS(res, "Yoga Payments fetched", payments);
  } catch (error) {
    console.error("Error fetching Yoga Payments:", error);
    return ReE(res, "An error occurred while fetching Yoga Payments", 500);
  }
};

module.exports.getAlldietPlanPayment = async function (req, res) {
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
      ],
    });

    return ReS(res, "Diet Payment feteched", serviceBookingList);
  } catch (error) {
    console.error("Error fetching Users:", error);
    return ReE(res, "An error occurred while fetching Diet Payment", 500);
  }
};
