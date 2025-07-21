-- Create schema for auth service
CREATE SCHEMA IF NOT EXISTS auth_service;

-- Create tables in auth_service schema
CREATE TABLE IF NOT EXISTS auth_service.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_service.sellers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone VARCHAR(15),
    shop_name VARCHAR(100) NOT NULL,
    shop_description TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_service.admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_service.password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(128) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON auth_service.users(email);
CREATE INDEX IF NOT EXISTS idx_sellers_email ON auth_service.sellers(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON auth_service.password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON auth_service.password_resets(token);