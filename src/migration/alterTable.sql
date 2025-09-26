CREATE TABLE fitness_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('muscle building','weight loss') NOT NULL,
    plan_for ENUM('myself','others') NOT NULL,
    gender ENUM('male','female') NOT NULL,
    height VARCHAR(50) NOT NULL,
    weight VARCHAR(50) NOT NULL,
    price VARCHAR(255) NOT NULL,
    any_body_pain TEXT NOT NULL,
    any_enquiry TEXT NOT NULL,
    age INT NOT NULL,
    goal TEXT NOT NULL,
    last_workout TEXT NULL,
    daily_physical_activity ENUM('low','sedentary','moderate') NOT NULL,
medical_condition TEXT NOT NULL,

    plan_type ENUM('1month','3month') NOT NULL,


    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

ALTER TABLE payments
  ADD COLUMN fitness_plan_id BIGINT NULL;