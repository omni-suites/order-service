# Order Service

The **Order Service** handles customer orders, communicates with the Inventory Service to deduct stock, and notifies the Notification Service to send confirmations.

## Technology Stack
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **HTTP Client:** Axios

## Getting Started Locally

### Prerequisites
- Node.js (v20+)
- Docker (for local database)

### Installation
```bash
npm install
```

### Database Setup
Ensure your local PostgreSQL container is running, then apply migrations and seed the database:
```bash
npx prisma db push
npx prisma db seed
```

### Running the App
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Endpoints
- `GET /orders` - Fetch all orders
- `POST /orders` - Create a new order (Requires `itemId` and `quantity`)
