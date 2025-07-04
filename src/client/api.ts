import { z } from "zod";

// Схемы для валидации данных
export const SourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  isEnabled: z.boolean(),
  type: z.string()
});

export const KeywordSchema = z.object({
  id: z.string(),
  text: z.string()
});

export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  sourceUrl: z.string(),
  sourceName: z.string(),
  sourceId: z.string(),
  documentRef: z.string().nullable(),
  taxType: z.string().nullable(),
  subject: z.string().nullable(),
  position: z.string().nullable(),
  publishedAt: z.string().transform((str) => new Date(str))
});

export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
});

export const NewsResponseSchema = z.object({
  items: z.array(NewsItemSchema),
  pagination: PaginationSchema
});

export const ReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  fileUrl: z.string(),
  dateFrom: z.date(),
  dateTo: z.date(),
  keywordsUsed: z.string(),
  itemCount: z.number(),
  createdAt: z.date()
});

export const EmailSettingsSchema = z.object({
  email: z.string(),
  isEnabled: z.boolean(),
  summaryFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  lastSummaryDate: z.date().nullable()
});

// Типы на основе схем
export type Source = z.infer<typeof SourceSchema>;
export type Keyword = z.infer<typeof KeywordSchema>;
export type NewsItem = z.infer<typeof NewsItemSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type NewsResponse = z.infer<typeof NewsResponseSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type EmailSettings = z.infer<typeof EmailSettingsSchema>;

// API клиент
export const apiClient = {
  // Источники
  listSources: async (): Promise<Source[]> => {
    const response = await fetch('/api/sources');
    const data = await response.json();
    return z.array(SourceSchema).parse(data);
  },

  toggleSource: async ({ id, isEnabled }: { id: string; isEnabled: boolean }): Promise<Source> => {
    const response = await fetch(`/api/sources/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled })
    });
    const data = await response.json();
    return SourceSchema.parse(data);
  },

  toggleSourcesByType: async ({ type, isEnabled }: { type: string; isEnabled: boolean }): Promise<void> => {
    await fetch(`/api/sources/toggle-by-type`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, isEnabled })
    });
  },

  toggleSourcesByIds: async ({ ids, isEnabled }: { ids: string[]; isEnabled: boolean }): Promise<void> => {
    await fetch(`/api/sources/toggle-by-ids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, isEnabled })
    });
  },

  deleteSource: async ({ id }: { id: string }): Promise<void> => {
    await fetch(`/api/sources/${id}`, { method: 'DELETE' });
  },

  parseSource: async ({ 
    id, 
    dateFrom, 
    dateTo, 
    limit 
  }: { 
    id: string; 
    dateFrom?: string; 
    dateTo?: string; 
    limit?: number; 
  }): Promise<{ message: string; sourceId: string; status: string; count?: number; filters?: any }> => {
    const response = await fetch(`/api/sources/${id}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateFrom, dateTo, limit })
    });
    const data = await response.json();
    return data;
  },

  addSource: async ({ name, url, type }: { name: string; url: string; type: string }): Promise<Source> => {
    const response = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, type })
    });
    const data = await response.json();
    return SourceSchema.parse(data);
  },

  // Ключевые слова
  listKeywords: async (): Promise<Keyword[]> => {
    const response = await fetch('/api/keywords');
    const data = await response.json();
    return z.array(KeywordSchema).parse(data);
  },

  addKeyword: async ({ text }: { text: string }): Promise<Keyword> => {
    const response = await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    return KeywordSchema.parse(data);
  },

  removeKeyword: async ({ id }: { id: string }): Promise<void> => {
    await fetch(`/api/keywords/${id}`, { method: 'DELETE' });
  },

  // Новости
  getNews: async ({ dateFrom, dateTo, keywords, sourceType, page = 1, limit = 10 }: {
    dateFrom?: string;
    dateTo?: string;
    keywords?: string[];
    sourceType?: string;
    page?: number;
    limit?: number;
  }): Promise<NewsResponse> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (keywords && keywords.length > 0) params.append('keywords', keywords.join(','));
    if (sourceType) params.append('sourceType', sourceType);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`/api/news?${params.toString()}`);
    const data = await response.json();
    return NewsResponseSchema.parse(data);
  },

  fetchAndProcessNews: async ({ dateFrom, dateTo, keywords, sourceType }: {
    dateFrom?: string;
    dateTo?: string;
    keywords?: string[];
    sourceType?: string;
  } = {}): Promise<{ taskId: string | null; message: string; status: string }> => {
    const response = await fetch('/api/news/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateFrom, dateTo, keywords, sourceType })
    });
    const data = await response.json();
    return data;
  },

  getNewsProcessingStatus: async ({ taskId }: { taskId: string }): Promise<{ status: string }> => {
    const response = await fetch(`/api/news/status/${taskId}`);
    const data = await response.json();
    return data;
  },

  // Отчеты
  listReports: async (): Promise<Report[]> => {
    const response = await fetch('/api/reports');
    const data = await response.json();
    return z.array(ReportSchema).parse(data);
  },

  exportToExcel: async ({ dateFrom, dateTo, keywords }: {
    dateFrom?: string;
    dateTo?: string;
    keywords?: string[];
  }): Promise<{ reportId: string; fileUrl: string; itemCount: number }> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    if (keywords) params.append('keywords', keywords.join(','));

    const response = await fetch(`/api/reports/export?${params.toString()}`);
    const data = await response.json();
    return data;
  },

  // Настройки email
  getEmailSettings: async (): Promise<EmailSettings> => {
    const response = await fetch('/api/email-settings');
    const data = await response.json();
    return EmailSettingsSchema.parse(data);
  },

  updateEmailSettings: async ({ email, isEnabled, summaryFrequency }: {
    email: string;
    isEnabled: boolean;
    summaryFrequency: string;
  }): Promise<EmailSettings> => {
    const response = await fetch('/api/email-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, isEnabled, summaryFrequency })
    });
    const data = await response.json();
    return EmailSettingsSchema.parse(data);
  },

  sendNewsEmailSummary: async ({ email }: { email: string }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch('/api/email-settings/send-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data;
  }
};
