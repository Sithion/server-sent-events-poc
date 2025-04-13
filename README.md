# Monorepo Setup

This monorepo contains three projects organized under the `apps` directory:

1. **Frontend**: A React application built with Next.js and TypeScript.
2. **BFF (Backend-for-Frontend)**: A Nest.js application that serves as a backend for the frontend.
3. **Microservice**: A Nest.js microservice that handles specific business logic.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- pnpm (version 6 or higher)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd monorepo
   ```

2. Install dependencies using pnpm:

   ```
   pnpm install
   ```

### Running the Projects

- **Frontend**: Navigate to the `apps/frontend` directory and run:

  ```
  pnpm dev
  ```

- **BFF**: Navigate to the `apps/bff` directory and run:

  ```
  pnpm start
  ```

- **Microservice**: Navigate to the `apps/microservice` directory and run:

  ```
  pnpm start
  ```

### Project Structure

- **apps/frontend**: Contains the frontend application.
- **apps/bff**: Contains the backend-for-frontend application.
- **apps/microservice**: Contains the microservice application.

### Scripts

Each project has its own `package.json` file with scripts for building, testing, and running the application. Refer to the respective `package.json` files for more details.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.