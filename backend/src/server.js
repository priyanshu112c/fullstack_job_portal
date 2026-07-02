import "dotenv/config";
import app from "./app.js";
import connectDB from "./database/db.js"
const PORT = process.env.PORT || 5000;
import http from "http"
import { Server } from "socket.io";
import socketHandler from "./sockets/socket.js"

// const startServer = async () => {
//     await connectDB();
//     app.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`)
//     })
// }
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Allow non-browser requests (no origin header)
            if (!origin) return callback(null, true);

            const allowedClientUrl = process.env.CLIENT_URL;
            if (allowedClientUrl && origin === allowedClientUrl) return callback(null, true);

            // Match common local dev origins (same logic used in Express CORS)
            const isLocalhost =
                /^https?:\/\/localhost:\d+$/.test(origin) ||
                /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);

            return isLocalhost ? callback(null, true) : callback(new Error(`Not allowed by Socket.IO CORS: ${origin}`));
        },
        credentials: true,
    }
});


socketHandler(io)

// Handle port conflicts (EADDRINUSE) explicitly
server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing process and restart the server.`)
        process.exit(1)
    }
    console.error('Server error:', err)
})

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (err) {
        console.log(err)
    }
}
startServer();
