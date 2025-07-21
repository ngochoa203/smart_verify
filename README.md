# 🛍️ Smart Verify E-commerce Platform

A microservices-based e-commerce platform with AI-powered product authenticity verification.

## 🏗️ Architecture

Smart Verify uses a microservices architecture with the following components:

- **Auth Service**: User authentication and authorization
- **Product Service**: Product catalog management
- **Inventory Service**: QR code and blockchain verification
- **Order Service**: Order processing
- **Payment Service**: Payment processing
- **Review Service**: Product reviews and comments
- **Favorite Service**: User favorites
- **AI Agentic Service**: AI-powered risk assessment and authenticity verification

For detailed architecture information, see [ARCHITECTURE.md](services/ARCHITECTURE.md).

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.12+
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart_verify.git
   cd smart_verify
   ```

2. Set up environment variables:
   ```bash
   cp services/.env.example services/.env
   # Edit .env with your configuration
   ```

3. Start the services:
   ```bash
   cd services
   chmod +x manage.sh
   ./manage.sh full
   ```

4. Access the services:
   - Auth Service: http://localhost:8001
   - Product Service: http://localhost:8002
   - Inventory Service: http://localhost:8003
   - Order Service: http://localhost:8004
   - Payment Service: http://localhost:8005
   - Review Service: http://localhost:8006
   - Favorite Service: http://localhost:8007
   - AI Agentic Service: http://localhost:8008
   - MindsDB: http://localhost:47334

## 📊 Features

- User and seller registration/authentication
- Product catalog with variants
- QR code generation and verification
- Blockchain-based product authenticity
- Order processing and payment integration
- Product reviews and sentiment analysis
- AI-powered risk assessment for counterfeit products
- Favorites management

## 🧪 Development

See [services/README.md](services/README.md) for detailed development instructions.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.