"use strict";

const { class_plans } = require("../models");

const DEFAULT_CLASSES = [
  {
    service_code: "zumba",
    name: "Zumba",
    monthly_rate_6m: 30,
    monthly_rate_12m: 19,
    six_month_price: 211,
    yearly_price: 269,
    is_active: true,
  },
  {
    service_code: "yoga",
    name: "Yoga",
    monthly_rate_6m: 30,
    monthly_rate_12m: 19,
    six_month_price: 211,
    yearly_price: 269,
    is_active: true,
  },
  {
    service_code: "hiit",
    name: "HIIT",
    monthly_rate_6m: 30,
    monthly_rate_12m: 19,
    six_month_price: 211,
    yearly_price: 269,
    is_active: true,
  },
  {
    service_code: "dance",
    name: "Dance",
    monthly_rate_6m: 30,
    monthly_rate_12m: 19,
    six_month_price: 211,
    yearly_price: 269,
    is_active: true,
  },
];

/**
 * Seed initial 4 class plans into the database if not present.
 */
module.exports.seedDefaultClassPlans = async function () {
  try {
    if (!class_plans) return;
    const count = await class_plans.count();
    if (count === 0) {
      console.log("Seeding default class plans...");
      for (const item of DEFAULT_CLASSES) {
        await class_plans.findOrCreate({
          where: { service_code: item.service_code },
          defaults: item,
        });
      }
      console.log("Default class plans seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding default class plans:", error.message);
  }
};
