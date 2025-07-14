# Auth Service

## Overview
Authentication and authorization microservice for Smart Verify E-commerce platform.

## Features
- User registration and authentication
- Seller registration and verification
- Admin management
- JWT token-based authentication
- Password reset functionality
- Email notifications

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### User Management
- `GET /users` - Get users (admin only)
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Seller Management
- `POST /sellers/register` - Seller registration
- `GET /sellers` - Get sellers
- `PUT /sellers/{id}/verify` - Verify seller (admin only)

### Password Reset
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

## Environment Variables
See `src/config.py` for all configuration options.

## Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Run tests
pytest

# Start development server
python src/main.py
```
