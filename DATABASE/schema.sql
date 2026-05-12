-- ============================================
-- RUNWAY DATABASE SCHEMA
-- For new deployments only - Safe to run on empty database
-- ============================================

CREATE DATABASE IF NOT EXISTS runway_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE runway_db;

-- ================= USERS =================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    date_of_birth DATE NULL,
    gender ENUM('male', 'female') NULL,
    email VARCHAR(100) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'visitor',
        'designer',
        'admin'
    ) NOT NULL DEFAULT 'visitor',
    bio TEXT,
    brand_name VARCHAR(200),
    specialty VARCHAR(200),
    location VARCHAR(200),
    website VARCHAR(300),
    instagram VARCHAR(200),
    facebook VARCHAR(200),
    twitter VARCHAR(200),
    avatar_url VARCHAR(500),
    cover_image VARCHAR(500),
    status ENUM(
        'active',
        'suspended',
        'banned'
    ) DEFAULT 'active',
    suspension_reason TEXT,
    suspension_end_date DATETIME,
    moderated_by INT,
    moderated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= DESIGNS =================
CREATE TABLE IF NOT EXISTS designs (
    design_id INT AUTO_INCREMENT PRIMARY KEY,
    designer_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    season VARCHAR(50),
    status ENUM(
        'active',
        'hidden',
        'under_review'
    ) DEFAULT 'active',
    moderation_reason TEXT,
    moderated_by INT,
    moderated_at TIMESTAMP,
    appeal_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (designer_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- ================= LIKES =================
CREATE TABLE IF NOT EXISTS likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    design_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (design_id) REFERENCES designs (design_id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, design_id)
);

-- ================= RATINGS =================
CREATE TABLE IF NOT EXISTS ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    design_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (design_id) REFERENCES designs (design_id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (user_id, design_id)
);

-- ================= FOLLOWS =================
CREATE TABLE IF NOT EXISTS follows (
    follow_id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    designer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (designer_id) REFERENCES users (user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, designer_id)
);

-- ================= ACTIVITY LOGS =================
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- ================= MODERATION LOGS =================
CREATE TABLE IF NOT EXISTS moderation_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    target_type ENUM('user', 'design') NOT NULL,
    target_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users (user_id)
);

-- ================= USER NOTIFICATIONS =================
CREATE TABLE IF NOT EXISTS user_notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM(
        'suspension',
        'design_hidden',
        'design_deleted',
        'warning'
    ) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- ================= PRODUCTS (future e-commerce) =================
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_designs_designer_created ON designs (designer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_designs_status_created ON designs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_designs_status ON designs (status);

CREATE INDEX IF NOT EXISTS idx_likes_user_design ON likes (user_id, design_id);

CREATE INDEX IF NOT EXISTS idx_likes_design ON likes (design_id);

CREATE INDEX IF NOT EXISTS idx_ratings_user_design ON ratings (user_id, design_id);

CREATE INDEX IF NOT EXISTS idx_ratings_design ON ratings (design_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows (follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_designer ON follows (designer_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role, status);

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);