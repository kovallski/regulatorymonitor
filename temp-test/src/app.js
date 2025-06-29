"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const api_1 = require("./routes/api");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Базовый маршрут для проверки работоспособности
app.get('/', (req, res) => {
    res.json({ message: 'TaxNewsRadar API is running' });
});
// API маршруты
app.use('/api', api_1.apiRouter);
