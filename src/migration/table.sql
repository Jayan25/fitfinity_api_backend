-- 1
CREATE TABLE service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary Key
    user_id INT NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    date_of_birth DATE,
    time_of_birth TIME,
    star VARCHAR(255),
    gotram VARCHAR(255),
    requirement_of_puja TEXT,
    problem TEXT,
    muhurtham VARCHAR(255),
    muhurtham_place VARCHAR(255),
    details TEXT,
    address TEXT,
    currency_type VARCHAR(10) DEFAULT 'USD', -- Default value for currency
    amount DECIMAL(10, 2) NOT NULL, -- Decimal type for monetary values
    number_of_gows INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Auto timestamp for creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Auto timestamp for updates
);


-- 2
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary Key with Auto Increment
    name VARCHAR(255) NOT NULL,        -- Name of the service
    code VARCHAR(255) NOT NULL,        -- Service code
    category VARCHAR(255),             -- Category of the service
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Auto timestamp for record creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Auto timestamp for record updates
);


--3
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary Key with Auto Increment
    user_id INT NOT NULL,              -- Foreign Key (User ID)
    r_payment_id VARCHAR(255) NOT NULL, -- Razorpay Payment ID
    r_order_id VARCHAR(255) NOT NULL,   -- Razorpay Order ID
    r_signature VARCHAR(255),          -- Razorpay Signature (Optional)
    method VARCHAR(255),               -- Payment Method (Optional)
    currency VARCHAR(10) NOT NULL,     -- Currency Type
    user_email VARCHAR(255),           -- User Email Address (Optional)
    amount FLOAT NOT NULL,             -- Payment Amount
    json_response JSON,                -- JSON Response from Gateway
    status VARCHAR(50) NOT NULL,       -- Payment Status
    booked_service_id INT,             -- Associated Booked Service ID
    service_type VARCHAR(255),         -- Type of Service (Optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for record creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp for record updates
);


--4
CREATE TABLE otp_logs (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Primary Key with Auto Increment
    mobile VARCHAR(20) NOT NULL,       -- Mobile Number (Non-Nullable)
    otp VARCHAR(10) NOT NULL,          -- OTP Code (Non-Nullable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for record creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp for record updates
);


--5
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Auto-increment primary key
    title VARCHAR(255) NOT NULL,        -- Blog title (Non-Nullable)
    description TEXT,                   -- Blog description
    content TEXT,                       -- Full blog content
    language VARCHAR(10),               -- Language of the blog
    short_description VARCHAR(255),     -- Short description of the blog
    thumbnail VARCHAR(255),             -- Thumbnail URL or file path
    data_id INT,                        -- Data ID, optionally linked to another table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Created timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Updated timestamp
);


-- 6
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- Auto-increment primary key
    name VARCHAR(255) NOT NULL,         -- Admin name (Non-Nullable)
    email VARCHAR(255) NOT NULL UNIQUE, -- Admin email (Non-Nullable and Unique)
    password VARCHAR(255) NOT NULL,     -- Admin password (Non-Nullable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Created timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Updated timestamp
    deleted_at TIMESTAMP NULL  -- For soft deletes (paranoid)
);


-- 7 create trainer table
CREATE TABLE trainers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male',
    pin VARCHAR(10),
    alternate_phone VARCHAR(20),
    addhar_address VARCHAR(255),
    education VARCHAR(255),
    experience VARCHAR(255),
    bank_name VARCHAR(255),
    account_holder_name VARCHAR(255),
    account_no VARCHAR(255),
    ifsc_code VARCHAR(20),
    service_type JSON DEFAULT '[]', -- Array of strings stored as JSON
    otp INT,
    kyc_status ENUM('pending', 'inprocess', 'done', 'failed') DEFAULT 'pending',
    block_status ENUM('Blocked', 'Unblocked') DEFAULT 'Unblocked',
    email_verified_at DATETIME,
    kyc_step INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME
);


-- 8 trainer documnet table
CREATE TABLE TrainerDocument (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trainer_id BIGINT NOT NULL, -- Foreign key referencing `trainers.id`
    document_type ENUM('aadhar', 'pan', 'certificate', 'training_photo'),
    verfication_status ENUM('not uploaded', 'pending', 'success', 'failed') DEFAULT 'not uploaded',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    CONSTRAINT fk_trainer_id FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE ON UPDATE CASCADE
);




