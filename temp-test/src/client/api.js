"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.EmailSettingsSchema = exports.ReportSchema = exports.NewsItemSchema = exports.KeywordSchema = exports.SourceSchema = void 0;
const zod_1 = require("zod");
// Схемы для валидации данных
exports.SourceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    url: zod_1.z.string(),
    isEnabled: zod_1.z.boolean(),
    type: zod_1.z.string()
});
exports.KeywordSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string()
});
exports.NewsItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    content: zod_1.z.string(),
    summary: zod_1.z.string(),
    sourceUrl: zod_1.z.string(),
    sourceName: zod_1.z.string(),
    sourceId: zod_1.z.string().nullable(),
    documentRef: zod_1.z.string().nullable(),
    taxType: zod_1.z.string().nullable(),
    subject: zod_1.z.string().nullable(),
    position: zod_1.z.string().nullable(),
    publishedAt: zod_1.z.date()
});
exports.ReportSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    fileUrl: zod_1.z.string(),
    dateFrom: zod_1.z.date(),
    dateTo: zod_1.z.date(),
    keywordsUsed: zod_1.z.string(),
    itemCount: zod_1.z.number(),
    createdAt: zod_1.z.date()
});
exports.EmailSettingsSchema = zod_1.z.object({
    email: zod_1.z.string(),
    isEnabled: zod_1.z.boolean(),
    summaryFrequency: zod_1.z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    lastSummaryDate: zod_1.z.date().nullable()
});
// API клиент
exports.apiClient = {
    // Источники
    listSources: async () => {
        const response = await fetch('/api/sources');
        const data = await response.json();
        return zod_1.z.array(exports.SourceSchema).parse(data);
    },
    toggleSource: async ({ id, isEnabled }) => {
        const response = await fetch(`/api/sources/${id}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isEnabled })
        });
        const data = await response.json();
        return exports.SourceSchema.parse(data);
    },
    toggleSourcesByType: async ({ type, isEnabled }) => {
        await fetch(`/api/sources/toggle-by-type`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, isEnabled })
        });
    },
    toggleSourcesByIds: async ({ ids, isEnabled }) => {
        await fetch(`/api/sources/toggle-by-ids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, isEnabled })
        });
    },
    deleteSource: async ({ id }) => {
        await fetch(`/api/sources/${id}`, { method: 'DELETE' });
    },
    addSource: async ({ name, url, type }) => {
        const response = await fetch('/api/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url, type })
        });
        const data = await response.json();
        return exports.SourceSchema.parse(data);
    },
    // Ключевые слова
    listKeywords: async () => {
        const response = await fetch('/api/keywords');
        const data = await response.json();
        return zod_1.z.array(exports.KeywordSchema).parse(data);
    },
    addKeyword: async ({ text }) => {
        const response = await fetch('/api/keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        return exports.KeywordSchema.parse(data);
    },
    removeKeyword: async ({ id }) => {
        await fetch(`/api/keywords/${id}`, { method: 'DELETE' });
    },
    // Новости
    getNews: async ({ dateFrom, dateTo, keywords, sourceType }) => {
        const params = new URLSearchParams();
        if (dateFrom)
            params.append('dateFrom', dateFrom);
        if (dateTo)
            params.append('dateTo', dateTo);
        if (keywords)
            params.append('keywords', keywords.join(','));
        if (sourceType)
            params.append('sourceType', sourceType);
        const response = await fetch(`/api/news?${params.toString()}`);
        const data = await response.json();
        return zod_1.z.array(exports.NewsItemSchema).parse(data);
    },
    fetchAndProcessNews: async () => {
        const response = await fetch('/api/news/fetch', { method: 'POST' });
        const data = await response.json();
        return data;
    },
    getNewsProcessingStatus: async ({ taskId }) => {
        const response = await fetch(`/api/news/status/${taskId}`);
        const data = await response.json();
        return data;
    },
    // Отчеты
    listReports: async () => {
        const response = await fetch('/api/reports');
        const data = await response.json();
        return zod_1.z.array(exports.ReportSchema).parse(data);
    },
    exportToExcel: async ({ dateFrom, dateTo, keywords }) => {
        const params = new URLSearchParams();
        if (dateFrom)
            params.append('dateFrom', dateFrom);
        if (dateTo)
            params.append('dateTo', dateTo);
        if (keywords)
            params.append('keywords', keywords.join(','));
        const response = await fetch(`/api/reports/export?${params.toString()}`);
        const data = await response.json();
        return data;
    },
    // Настройки email
    getEmailSettings: async () => {
        const response = await fetch('/api/email-settings');
        const data = await response.json();
        return exports.EmailSettingsSchema.parse(data);
    },
    updateEmailSettings: async ({ email, isEnabled, summaryFrequency }) => {
        const response = await fetch('/api/email-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, isEnabled, summaryFrequency })
        });
        const data = await response.json();
        return exports.EmailSettingsSchema.parse(data);
    },
    sendNewsEmailSummary: async ({ email }) => {
        const response = await fetch('/api/email-settings/send-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        return data;
    }
};
