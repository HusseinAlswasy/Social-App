# Social App API

`social-app` (version `1.0.0`) is a Node.js and TypeScript backend built with Express 5. It currently provides user registration, email verification code delivery, and image uploads to AWS S3, with MongoDB persistence and Redis-backed temporary data. The API is an active work in progress; the sign-in route is present but does not yet authenticate credentials.

## Features

- User registration with Zod request validation.
- Password hashing through a Mongoose save hook.
- Verification code generation and email delivery through Nodemailer.
- Temporary verification data stored in Redis.
- User data stored in MongoDB with Mongoose.
- Image uploads to AWS S3.
- Express middleware for CORS, Helmet, and rate limiting (100 requests per 15 minutes).
- Centralized handling for application errors and unmatched routes.

## Tech Stack

| Category | Packages / technology |
| --- | --- |
| Runtime and language | Node.js, TypeScript |
| HTTP server | `express` `^5.2.1` |
| Database | MongoDB, `mongoose` `^9.10.2` |
| Cache | `redis` `^6.3.0` |
| Validation | `zod` `^4.6.5` |
| Security and middleware | `bcrypt` `^6.0.0`, `jsonwebtoken` `^9.0.3`, `helmet` `^8.3.0`, `cors` `^2.8.6`, `express-rate-limit` `^8.7.0` |
| Email | `nodemailer` `^10.0.12` |
| Uploads and AWS | `multer` `^2.4.0`, `@aws-sdk/client-s3` `^3.1146.0`, `@aws-sdk/lib-storage` `^3.1146.0` |
| Configuration and scripts | `dotenv` `^18.0.4`, `cross-env` `^10.1.0`, `concurrently` `^10.0.5` |
| Other declared packages | `crypto` `^1.0.1`, `encrypt` `^0.0.1` |
| Development type packages | `@types/bcrypt` `^6.0.0`, `@types/cors` `^2.8.19`, `@types/dotenv` `^6.1.1`, `@types/express` `^5.0.6`, `@types/jsonwebtoken` `^9.0.10`, `@types/multer` `^2.3.0`, `@types/nodemailer` `^8.0.2` |

## Project Structure

```text
src/
├── common/                 # Shared middleware, security, services, types, enums, and utilities
│   ├── enums/              # User, event, and upload enums
│   ├── middleware/         # Authentication, validation, upload, and error middleware
│   ├── security/           # Hashing and encryption helpers
│   ├── service/            # Redis, S3, and email services
│   ├── token/              # JWT token utilities
│   ├── types/              # Shared Express request types
│   └── utils/              # Response and email-template helpers
├── config/                 # Environment variable loading and configuration
├── DB/                     # MongoDB connection and repository classes
│   └── repositories/       # Base and user data repositories
├── events/                 # Email-related event handling
├── models/                 # Mongoose models (currently User)
├── modules/                # Feature modules and route controllers
│   └── auth/               # User registration, sign-in, upload routes, and validation
├── app.bootstrap.ts        # Express middleware, routes, and server startup
└── index.ts                # Application entry point
```

## Getting Started

### Prerequisites

- Node.js and npm. The repository does not specify a tested Node.js version; the TypeScript target is ES2023.
- MongoDB and Redis instances.
- Gmail credentials for verification email delivery.
- AWS credentials and an S3 bucket for uploads.

### Installation

```bash
git clone https://github.com/HusseinAlswasy/Social-App.git
cd Social-App
npm install
```

### Environment variables

Configuration loads `.env.${NODE_ENV}` from the project root. Create `.env.development` for the development script or `.env.production` for the production script. The following example uses placeholders only:

```dotenv
NODE_ENV=development
PORT=3001
DB_URL=mongodb://<username>:<password>@<host>:<port>/<database>
MONGO_URI=<mongodb-uri-unused-by-current-connector>
REDIS_URL=redis://<username>:<password>@<host>:<port>
ENCRYPTION_KEY=<32-byte-key>
JWT_SECRET=<jwt-secret>
JWT_REFRESH_SECRET=<jwt-refresh-secret>
CLOUDINARY_NAME=<cloudinary-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
EMAIL_ADDRESS=<gmail-address>
EMAIL_PASSWORD=<gmail-app-password>
AWS_ACCESS_KEY=<aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
AWS_REGION=<aws-region>
AWS_BUCKET_NAME=<s3-bucket-name>
```

`DB_URL` is used by the MongoDB connection. `MONGO_URI` and the Cloudinary variables are read into configuration but are not used by the current routes/services. JWT configuration is present, and the authentication middleware uses `JWT_SECRET`, but no current route applies that middleware. Do not commit environment files or real credentials.

### Run

```bash
npm run start:dev
```

```bash
npm run start:prod
```

The server defaults to port `3001` when `PORT` is not set. The scripts invoke `tsc --watch` and `nodemon`; neither TypeScript nor Nodemon is declared in `package.json`, so they must be available in the environment for these scripts to run.

## API Endpoints

All current routes are mounted without the authentication middleware. Therefore, the routes below do not require authentication as implemented.

### Application

| Method | Route | Auth required | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Returns a welcome message. |

### Users / Auth

| Method | Route | Auth required | Description |
| --- | --- | --- | --- |
| `POST` | `/users/signUp` | No | Validates registration data, creates a user, stores verification data in Redis, and sends an email verification code. |
| `POST` | `/users/signIn` | No | Route exists, but does not validate credentials or issue tokens; currently returns a success-shaped response. |
| `POST` | `/users/upload` | No | Accepts image file(s) in the `attachments` multipart field and uploads them to S3. |

The sign-up validator requires `fName`, `lName`, `email`, `password`, `cPassword`, and `age`; names must be at least two characters, email must be valid, age must be at least 20, and passwords must match. Although `phone` is optional in the request schema, the User model requires it; provide a phone number for a successful database save.

## File Upload

The `/users/upload` route uses Multer's in-memory storage and accepts multiple files in the `attachments` field. The default file filter accepts `image/jpeg`, `image/png`, and `image/jpg`. The configured upload flow passes these in-memory files to the S3 service, which uploads them concurrently using `PutObjectCommand` with a private ACL. Object keys are stored under `Social_Media_App/users/` and include a generated UUID and the original filename.

Example `multipart/form-data` fields:

| Field | Type | Value |
| --- | --- | --- |
| `attachments` | File (repeatable) | One or more JPEG or PNG images |

Example response shape (the key is illustrative):

```json
{
  "message": "Uploaded Successfuly",
  "data": [
    "Social_Media_App/users/<uuid>__<original-filename>"
  ]
}
```

The S3 service also contains disk-storage and large-upload helpers, but the current route uses the default memory-storage and regular upload path.

## Error Handling and Response Format

- Successful service responses use `{ "message": "...", "data": ... }`; `data` may be absent when the handler does not provide it.
- The root route returns `{ "message": "..." }`.
- Application errors and unmatched routes use `{ "message": "...", "stack": "..." }` with the error status code (500 by default; unmatched routes use 404).
- The rate limiter returns HTTP 429 with `{ "message": "many request" }`.
- Upload failures are converted to an application error by the S3 service.

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `start:dev` | `cross-env NODE_ENV=development concurrently "tsc --watch" "nodemon dist/index.js"` | Sets development mode, watches TypeScript compilation, and runs the compiled server with Nodemon. |
| `start:prod` | `cross-env NODE_ENV=production concurrently "tsc --watch" "nodemon dist/index.js"` | Sets production mode and runs the same watch-based compilation/server commands. |

## Contributing

Contributions are welcome. Keep changes aligned with the existing TypeScript and module structure, document any new routes or environment variables, and include tests when test infrastructure is added.
