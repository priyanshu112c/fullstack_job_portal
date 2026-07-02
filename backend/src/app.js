import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js"
import authRoutes from "./routes/auth.routes.js"
import jobRoutes from "./routes/job.routes.js"
import applicationRoutes from "./routes/application.routes.js"
import userRoutes from "./routes/user.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import messageRoutes from "./routes/message.routes.js"
import adminRoutes from './routes/admin.routes.js'
import companyRoutes from './routes/company.routes.js'
import profileRoutes from './routes/profile.routes.js'
import errorHandler from './middleware/error.middleware.js'

const app = express();

app.use(helmet())
app.use(compression())
app.use(morgan("dev"))

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (no origin header)
        if (!origin) return callback(null, true);

        const allowed =
            process.env.CLIENT_URL &&
            origin === process.env.CLIENT_URL;

        const isLocalhost =
            /^https?:\/\/localhost:\d+$/.test(origin) ||
            /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);

        if (allowed || isLocalhost) return callback(null, true);

        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// app.use(compression())

app.use("/api/v1/auth", authRoutes)

app.use("/api/v1/health", healthRoutes)

app.use("/api/v1/jobs", jobRoutes)

app.use("/api/v1/applications", applicationRoutes)

app.use("/api/v1/users", userRoutes)

app.use('/api/v1/ai', aiRoutes)

app.use('/api/v1/message', messageRoutes)

app.use('/api/v1/admin', adminRoutes)

app.use('/api/v1/companies', companyRoutes)

app.use('/api/v1/profile', profileRoutes)

app.use(errorHandler)

export default app;

