"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const campaignRoutes_1 = __importDefault(require("./routes/campaignRoutes"));
const ipfsRoutes_1 = __importDefault(require("./routes/ipfsRoutes"));
const blockchainIndexer_1 = require("./indexer/blockchainIndexer");
const campaignCron_1 = require("./jobs/campaignCron");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || parseInt(process.env.SERVER_PORT || '8000', 10);
const prisma = new client_1.PrismaClient();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Basic Health Check
app.get('/health', async (req, res) => {
    try {
        // Check DB connection
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({ status: 'OK', database: 'Connected' });
    }
    catch (error) {
        res.status(500).json({ status: 'ERROR', database: 'Disconnected', error: String(error) });
    }
});
// API Routes
app.use('/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/campaigns', campaignRoutes_1.default);
app.use('/api/ipfs', ipfsRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // Start Blockchain Indexer
    (0, blockchainIndexer_1.startIndexer)();
    // Start Background Cron Jobs
    (0, campaignCron_1.startCronJobs)();
});
exports.default = app;
