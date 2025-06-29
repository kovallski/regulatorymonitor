"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.apiRouter = router;
const prisma = new client_1.PrismaClient();
// Получение списка источников
router.get('/sources', async (req, res) => {
    try {
        const sources = await prisma.source.findMany();
        res.json(sources);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sources' });
    }
});
// Создание источника
router.post('/sources', async (req, res) => {
    try {
        const source = await prisma.source.create({ data: req.body });
        res.json(source);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create source', details: error.message });
    }
});
// Получение списка ключевых слов
router.get('/keywords', async (req, res) => {
    try {
        const keywords = await prisma.keyword.findMany();
        res.json(keywords);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch keywords' });
    }
});
// Создание ключевого слова
router.post('/keywords', async (req, res) => {
    try {
        const keyword = await prisma.keyword.create({ data: req.body });
        res.json(keyword);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create keyword', details: error.message });
    }
});
// Получение новостей
router.get('/news', async (req, res) => {
    try {
        const { dateFrom, dateTo, keywords, sourceType } = req.query;
        const where = {};
        if (dateFrom || dateTo) {
            where.publishedAt = {};
            if (dateFrom)
                where.publishedAt.gte = new Date(dateFrom);
            if (dateTo)
                where.publishedAt.lte = new Date(dateTo);
        }
        if (sourceType) {
            where.source = { type: sourceType };
        }
        if (keywords) {
            const keywordArray = keywords.split(',').map(k => k.trim());
            where.keywords = {
                some: {
                    text: {
                        in: keywordArray
                    }
                }
            };
        }
        const news = await prisma.newsItem.findMany({
            where,
            include: {
                source: true,
                keywords: true
            },
            orderBy: {
                publishedAt: 'desc'
            }
        });
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});
// Создание новости
router.post('/news', async (req, res) => {
    try {
        const _a = req.body, { keywords } = _a, newsData = __rest(_a, ["keywords"]);
        const created = await prisma.newsItem.create({
            data: Object.assign(Object.assign({}, newsData), { keywords: keywords && keywords.length > 0 ? {
                    connect: keywords.map((id) => ({ id }))
                } : undefined }),
            include: { keywords: true, source: true }
        });
        res.json(created);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create news', details: error.message });
    }
});
// Получение настроек email
router.get('/email-settings', async (req, res) => {
    try {
        const settings = await prisma.emailSettings.findFirst();
        res.json(settings || { email: '', isEnabled: false, summaryFrequency: 'DAILY' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch email settings' });
    }
});
