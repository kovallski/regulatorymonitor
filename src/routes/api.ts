import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { parsingService } from '../services/parsing';

const router = Router();
const prisma = new PrismaClient();

// Получение списка источников
router.get('/sources', async (req, res) => {
  try {
    const sources = await prisma.source.findMany();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// Создание источника
router.post('/sources', async (req, res) => {
  try {
    const source = await prisma.source.create({ data: req.body });
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create source', details: error.message });
  }
});

// Удаление источника
router.delete('/sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.source.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete source', details: error.message });
  }
});

// Переключение состояния источника
router.post('/sources/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled } = req.body;
    const source = await prisma.source.update({
      where: { id },
      data: { isEnabled }
    });
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle source', details: error.message });
  }
});

// Ручной запуск парсинга источника
router.post('/sources/:id/parse', async (req, res) => {
  try {
    const { id } = req.params;
    const { dateFrom, dateTo, limit } = req.body; // Получаем фильтры из body
    
    // Получаем источник
    const source = await prisma.source.findUnique({
      where: { id }
    });
    
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    if (!source.isEnabled) {
      return res.status(400).json({ error: 'Source is disabled' });
    }
    
    console.log(`Starting manual parsing for source: ${source.name} (${source.url})`);
    console.log(`Filters: dateFrom=${dateFrom}, dateTo=${dateTo}, limit=${limit}`);
    
    // Парсим даты если они переданы
    let parsedDateFrom: Date | undefined;
    let parsedDateTo: Date | undefined;
    let parsedLimit: number | undefined;
    
    if (dateFrom) {
      parsedDateFrom = new Date(dateFrom);
      if (isNaN(parsedDateFrom.getTime())) {
        return res.status(400).json({ error: 'Invalid dateFrom format' });
      }
    }
    
    if (dateTo) {
      parsedDateTo = new Date(dateTo);
      if (isNaN(parsedDateTo.getTime())) {
        return res.status(400).json({ error: 'Invalid dateTo format' });
      }
    }
    
    if (limit) {
      parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return res.status(400).json({ error: 'Invalid limit value' });
      }
    }
    
    // Запускаем парсинг с фильтрами
    const result = await parsingService.parseSourceWithFilters(id, parsedDateFrom, parsedDateTo, parsedLimit);
    
    if (result.success) {
      res.json({ 
        message: result.message,
        sourceId: id,
        status: 'completed',
        count: result.count,
        filters: {
          dateFrom: parsedDateFrom,
          dateTo: parsedDateTo,
          limit: parsedLimit
        }
      });
    } else {
      res.status(500).json({ 
        error: result.message,
        sourceId: id,
        status: 'failed'
      });
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to start parsing', details: error.message });
  }
});

// Получение списка ключевых слов
router.get('/keywords', async (req, res) => {
  try {
    const keywords = await prisma.keyword.findMany();
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
});

// Создание ключевого слова
router.post('/keywords', async (req, res) => {
  try {
    const keyword = await prisma.keyword.create({ data: req.body });
    res.json(keyword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create keyword', details: error.message });
  }
});

// Получение новостей
router.get('/news', async (req, res) => {
  try {
    const { dateFrom, dateTo, keywords, sourceType, page = '1', limit = '10' } = req.query;
    
    // Парсим параметры пагинации
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    const where: any = {};
    
    if (dateFrom || dateTo) {
      where.publishedAt = {};
      if (dateFrom) where.publishedAt.gte = new Date(dateFrom as string);
      if (dateTo) where.publishedAt.lte = new Date(dateTo as string);
    }
    
    if (sourceType) {
      where.source = { type: sourceType };
    }
    
    if (keywords) {
      const keywordArray = (keywords as string).split(',').map(k => k.trim());
      where.OR = keywordArray.map((keyword: string) => ({
        OR: [
          { title: { contains: keyword } },
          { summary: { contains: keyword } },
          { subject: { contains: keyword } },
          { taxType: { contains: keyword } }
        ]
      }));
    }
    
    // Получаем общее количество новостей
    const total = await prisma.newsItem.count({ where });
    
    // Получаем новости с пагинацией
    const news = await prisma.newsItem.findMany({
      where,
      include: {
        source: true,
        keywords: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip: offset,
      take: limitNum
    });
    
    res.json({
      items: news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Создание новости
router.post('/news', async (req, res) => {
  try {
    const { keywords, ...newsData } = req.body;
    const created = await prisma.newsItem.create({
      data: {
        ...newsData,
        keywords: keywords && keywords.length > 0 ? {
          connect: keywords.map((id: string) => ({ id }))
        } : undefined
      },
      include: { keywords: true, source: true }
    });
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news', details: error.message });
  }
});

// Удаление новости
router.delete('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.newsItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news', details: error.message });
  }
});

// Массовый парсинг всех активных источников
router.post('/news/fetch', async (req, res) => {
  try {
    console.log('[API] Запуск массового парсинга всех активных источников...');
    const { dateFrom, dateTo, keywords, sourceType, limit } = req.body;
    // Получаем все активные источники
    const activeSources = await prisma.source.findMany({
      where: { isEnabled: true }
    });
    if (activeSources.length === 0) {
      return res.json({
        taskId: null,
        message: 'Нет активных источников для парсинга',
        status: 'completed'
      });
    }
    console.log(`[API] Найдено ${activeSources.length} активных источников`);
    let totalParsed = 0;
    const results = [];
    // Парсим каждый активный источник
    for (const source of activeSources) {
      try {
        console.log(`[API] Парсинг источника: ${source.name}`);
        // Передаём фильтры в парсер
        const parsedDateFrom = dateFrom ? new Date(dateFrom) : undefined;
        const parsedDateTo = dateTo ? new Date(dateTo) : undefined;
        const parsedLimit = limit ? parseInt(limit) : undefined;
        const result = await parsingService.parseSourceWithFilters(
          source.id,
          parsedDateFrom,
          parsedDateTo,
          parsedLimit
        );
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: result.success,
          message: result.message,
          count: result.count
        });
        if (result.success) {
          totalParsed += result.count;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[API] Ошибка при парсинге источника ${source.name}:`, error);
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          success: false,
          message: `Ошибка: ${error.message}`,
          count: 0
        });
      }
    }
    const successCount = results.filter(r => r.success).length;
    const message = `Парсинг завершен. Обработано ${successCount}/${activeSources.length} источников. Всего добавлено ${totalParsed} новых новостей.`;
    console.log(`[API] ${message}`);
    res.json({
      taskId: null,
      message,
      status: 'completed',
      results,
      totalParsed
    });
  } catch (error) {
    console.error('[API] Ошибка при массовом парсинге:', error);
    res.status(500).json({
      taskId: null,
      message: `Ошибка при массовом парсинге: ${error.message}`,
      status: 'failed'
    });
  }
});

// Получение статуса обработки (для совместимости)
router.get('/news/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    // В текущей реализации нет асинхронных задач, поэтому всегда возвращаем completed
    res.json({ status: 'completed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Получение настроек email
router.get('/email-settings', async (req, res) => {
  try {
    const settings = await prisma.emailSettings.findFirst();
    res.json(settings || { email: '', isEnabled: false, summaryFrequency: 'DAILY' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email settings' });
  }
});

export { router as apiRouter }; 