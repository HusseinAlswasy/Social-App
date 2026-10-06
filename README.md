# Social App API

A RESTful backend for a social media application built with **Node.js**, **Express**, and **TypeScript**. It supports user authentication, file uploads (images, videos, attachments) to **AWS S3**, and a clean layered architecture (Router → Controller → Service → Database).

## Features

- User authentication and authorization
- File upload with **Multer** (memory or disk storage)
- Upload to **AWS S3**: single file, multiple files, and multipart upload for large files
- File type validation (images, videos, ...)
- Private files by default (access via pre-signed URLs)
- Centralized error handling with a custom `AppError`
- Consistent API response format

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| File Upload | Multer |
| Cloud Storage | AWS S3 (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`) |
| Database | MongoDB (Mongoose) |

## Project Structure

```
src/
├── common/
│   ├── enums/           # Shared enums (e.g. multer storeEnum)
│   ├── middleware/      # Global error handler, auth, ...
│   └── utils/
│       ├── multer/      # Multer configuration
│       └── s3.service.ts
├── config/              # Environment configuration
├── DB/                  # Models and connection
└── modules/             # Feature modules (auth, user, post, ...)
    └── auth/
        ├── auth.controller.ts
        └── auth.service.ts
```

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB instance
- AWS account with an S3 bucket

### Installation

```bash
git clone https://github.com/HusseinAlswasy/Social-App.git
cd Social-App
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=3000
DB_URI=mongodb://localhost:27017/social_app

AWS_REGION=your-region
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

> Never commit your `.env` file or AWS credentials.

### Run the App

```bash
# development
npm run dev

# build
npm run build

# production
npm start
```

## File Upload

### Multer Setup

```ts
router.post(
  "/upload",
  cloudFileUpload({
    storeType: storeEnum.memory,
    validation: ["image/png", "image/jpeg"],
  }).array("attachments", 5),
  authServices.uploadFiles
);
```

### S3 Service

```ts
const s3 = new s3Service();

// Single file
const key = await s3.uploadFile({ path: "users", file });

// Large file (multipart upload)
const largeKey = await s3.uploadLargeFile({ path: "videos", file });

// Multiple files
const keys = await s3.uploadFiles({
  path: "posts",
  files,
  isLarge: false,
});
```

Uploaded files are stored under:

```
Social_Media_App/<path>/<uuid>__<original-file-name>
```

### Sending a Request

- Method: `POST`
- Body type: `form-data`
- Key name: `attachments` (type **File**, can be repeated)

**Response:**

```json
{
  "message": "Uploaded Successfully",
  "data": [
    "Social_Media_App/users/3f2a...__image1.png",
    "Social_Media_App/users/9c1b...__image2.png"
  ]
}
```

## Notes

- Files are uploaded with the `private` ACL by default. Store the returned **Key** in the database, and generate a pre-signed URL when you need to display the file.
- If you use disk storage, remember to delete the temporary files after upload.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the server in development mode |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled app |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
