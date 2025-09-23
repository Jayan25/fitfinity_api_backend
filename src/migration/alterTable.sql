CREATE TABLE fitness_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('muscle building','weight loss') NOT NULL,
    price VARCHAR(255) NOT NULL,
    plan_for ENUM('myself','others') NOT NULL,
    gender ENUM('male','female') NOT NULL,
    name VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    age INT NOT NULL,
    height VARCHAR(50) NOT NULL,
    weight VARCHAR(50) NOT NULL,
    goal TEXT NOT NULL,
    daily_physical_activity ENUM('low','sedentary','moderate') NOT NULL,
    allergy TEXT NULL,
    plan_type ENUM('1month','3month') NOT NULL,
    final_price VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);


ALTER TABLE payments
  ADD COLUMN fitness_plan_id BIGINT NULL;