# Smart Verify E-commerce Frontend

## Overview

Modern e-commerce frontend for the Smart Verify platform, built with Next.js, Tailwind CSS, and shadcn/UI. This frontend connects to the Smart Verify microservices backend to provide a seamless shopping experience with AI-powered product verification.

## Features

- **Modern UI/UX**: Clean and responsive design with Tailwind CSS and shadcn/UI
- **Product Browsing**: Browse products by category, brand, or search
- **Product Details**: View detailed product information, variants, and reviews
- **AI Verification**: Verify product authenticity using AI and blockchain technology
- **User Authentication**: Register, login, and manage your account
- **Shopping Cart**: Add products to cart and checkout
- **Order Management**: View and track your orders
- **Wishlist**: Save products for later
- **Responsive Design**: Works on all devices - mobile, tablet, and desktop
- **Dark Mode**: Support for light and dark themes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Smart Verify backend services running (see `/services` directory)

### Installation

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd smart_verify/frontend

# Install dependencies
npm install
# or
yarn install

# Create .env.local file with API endpoints
cp .env.example .env.local

# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

The frontend uses environment variables to connect to the backend services. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost
NEXT_PUBLIC_AUTH_API_PORT=8001
NEXT_PUBLIC_PRODUCT_API_PORT=8002
NEXT_PUBLIC_INVENTORY_API_PORT=8003
NEXT_PUBLIC_ORDER_API_PORT=8004
NEXT_PUBLIC_PAYMENT_API_PORT=8005
NEXT_PUBLIC_REVIEW_API_PORT=8006
NEXT_PUBLIC_FAVORITE_API_PORT=8007
NEXT_PUBLIC_AI_API_PORT=8008
```

## API Integration

The frontend connects to the Smart Verify microservices backend through API endpoints. The API routes are handled by a catch-all API route handler in `src/app/api/[...path]/route.ts` that proxies requests to the appropriate backend service:

- `/api/auth/*` → Auth Service (8001)
- `/api/products/*` → Product Service (8002)
- `/api/inventory/*` → Inventory Service (8003)
- `/api/orders/*` → Order Service (8004)
- `/api/payments/*` → Payment Service (8005)
- `/api/reviews/*` → Review Service (8006)
- `/api/favorites/*` → Favorite Service (8007)
- `/api/ai/*` → AI Agentic Service (8008)

The catch-all API route handler automatically routes requests to the appropriate backend service based on the first segment of the path.

## Project Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   │   ├── layout/    # Layout components (navbar, footer, etc.)
│   │   └── ui/        # UI components (buttons, cards, etc.)
│   ├── lib/           # Utility functions and hooks
│   │   ├── services/  # API services
│   │   └── store.ts   # Global state management
│   └── styles/        # Global styles
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

## State Management

The application uses Zustand for global state management:

- `useAuthStore`: Manages user authentication state
- `useCartStore`: Manages shopping cart state

## Development

### Adding New Pages

1. Create a new directory in `src/app/` for the page
2. Create a `page.tsx` file in the directory
3. Import the necessary components and implement the page

### Adding New Components

1. Create a new file in `src/components/ui/` or `src/components/layout/`
2. Implement the component using Tailwind CSS and shadcn/UI
3. Export the component for use in pages

## License

MIT License - see LICENSE file for details