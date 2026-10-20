-- Migration: Create class_plans and class_subscriptions tables
-- Date: 2026-10-19

-- 1. Table for Online Classes Plans & Prices (Zumba, Yoga, HIIT, Dance)
CREATE TABLE IF NOT EXISTS class_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    monthly_rate_6m INT NOT NULL DEFAULT 30,
    monthly_rate_12m INT NOT NULL DEFAULT 19,
    six_month_price INT NOT NULL DEFAULT 211,
    yearly_price INT NOT NULL DEFAULT 269,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial 4 services
INSERT INTO class_plans (service_code, name, monthly_rate_6m, monthly_rate_12m, six_month_price, yearly_price, is_active)
VALUES 
    ('zumba', 'Zumba', 30, 19, 211, 269, TRUE),
    ('yoga', 'Yoga', 30, 19, 211, 269, TRUE),
    ('hiit', 'HIIT', 30, 19, 211, 269, TRUE),
    ('dance', 'Dance', 30, 19, 211, 269, TRUE)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    monthly_rate_6m = VALUES(monthly_rate_6m),
    monthly_rate_12m = VALUES(monthly_rate_12m),
    six_month_price = VALUES(six_month_price),
    yearly_price = VALUES(yearly_price);

-- 2. Table for storing user purchases of online class memberships
CREATE TABLE IF NOT EXISTS class_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    services TEXT NOT NULL,
    service_names VARCHAR(255) NOT NULL,
    duration_months INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    payment_id VARCHAR(100) NULL,
    payment_status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    start_date DATE NULL,
    expiry_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Add class_subscription_id to payments table
ALTER TABLE payments
    ADD COLUMN class_subscription_id BIGINT NULL;
