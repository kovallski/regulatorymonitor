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
    
    // Запускаем реальный парсинг
    const result = await parsingService.parseSource(id);
    
    if (result.success) {
      res.json({ 
        message: result.message,
        sourceId: id,
        status: 'completed',
        count: result.count
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
    const { dateFrom, dateTo, keywords, sourceType } = req.query;
    
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
    
    const news = await prisma.newsItem.findMany({
      where,
      include: {
        source: true,
        keywords: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 100 // Ограничиваем количество для производительности
    });
    
    res.json(news);
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