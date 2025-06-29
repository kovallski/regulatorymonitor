import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ParsedNewsItem {
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  documentRef?: string;
  taxType?: string;
  subject?: string;
  position?: string;
}

export class ParsingService {
  private browser: puppeteer.Browser | null = null;

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async parseMinfin(): Promise<ParsedNewsItem[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      console.log('[PARSER] Открытие страницы Минфина...');
      await page.goto('https://minfin.gov.ru/ru/document/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Ждем загрузки контента
      await page.waitForSelector('.document_card', { timeout: 10000 });
      
      console.log('[PARSER] Парсинг карточек документов...');
      
      const newsItems = await page.evaluate(() => {
        const cards = document.querySelectorAll('.document_card');
        const items: any[] = [];

        cards.forEach((card, index) => {
          try {
            const titleEl = card.querySelector('.document_title') as HTMLElement;
            const dateEl = card.querySelector('.date') as HTMLElement;
            const tagEls = card.querySelectorAll('ul.tag_list li a');

            if (titleEl && dateEl) {
              const title = titleEl.textContent?.trim() || '';
              const url = titleEl.getAttribute('href') || '';
              const dateText = dateEl.textContent?.trim() || '';
              const tags = Array.from(tagEls).map(tag => tag.textContent?.trim() || '');

              // Парсим дату (предполагаем формат DD.MM.YYYY)
              let publishedAt = new Date();
              if (dateText) {
                console.log(`Парсинг даты: "${dateText}"`);
                const dateParts = dateText.split('.');
                if (dateParts.length === 3) {
                  const year = parseInt(dateParts[2]);
                  const month = parseInt(dateParts[1]) - 1; // Месяцы в JS начинаются с 0
                  const day = parseInt(dateParts[0]);
                  
                  if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    publishedAt = new Date(year, month, day);
                    console.log(`Дата успешно распарсена: ${publishedAt.toISOString()}`);
                  } else {
                    console.log(`Неверный формат даты: ${dateText}`);
                  }
                } else {
                  console.log(`Неожиданный формат даты: ${dateText}`);
                }
              } else {
                console.log('Дата не найдена, используем текущую');
              }

              // Формируем summary из тегов и заголовка
              const summary = `${title}. ${tags.join(', ')}`;

              items.push({
                title,
                summary,
                sourceUrl: url.startsWith('http') ? url : `https://minfin.gov.ru${url}`,
                sourceName: 'Минфин',
                publishedAt,
                documentRef: url.split('/').pop() || undefined,
                taxType: tags.find(tag => tag.toLowerCase().includes('налог')) || undefined,
                subject: title,
                position: tags.join(', ')
              });
              
              console.log(`Обработана карточка ${index + 1}: ${title} (дата: ${publishedAt.toISOString()})`);
            }
          } catch (error) {
            console.error('[PARSER] Ошибка при парсинге карточки:', error);
          }
        });

        return items;
      });

      console.log(`[PARSER] Найдено ${newsItems.length} новостей`);
      return newsItems;

    } catch (error) {
      console.error('[PARSER] Ошибка при парсинге Минфина:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async saveNewsToDatabase(newsItems: ParsedNewsItem[], sourceId: string) {
    console.log(`[PARSER] Сохранение ${newsItems.length} новостей в базу данных...`);
    
    let savedCount = 0;
    
    for (const item of newsItems) {
      try {
        // Проверяем, не существует ли уже такая новость
        const existing = await prisma.newsItem.findFirst({
          where: {
            sourceUrl: item.sourceUrl,
            sourceId: sourceId
          }
        });

        if (!existing) {
          // Проверяем, что publishedAt является валидной датой
          if (!(item.publishedAt instanceof Date) || isNaN(item.publishedAt.getTime())) {
            console.log(`[PARSER] Некорректная дата для новости "${item.title}", используем текущую дату`);
            item.publishedAt = new Date();
          }
          
          console.log(`[PARSER] Сохраняем новость: "${item.title}" (дата: ${item.publishedAt.toISOString()})`);
          
          await prisma.newsItem.create({
            data: {
              title: item.title,
              summary: item.summary,
              sourceUrl: item.sourceUrl,
              sourceName: item.sourceName,
              publishedAt: item.publishedAt,
              documentRef: item.documentRef,
              taxType: item.taxType,
              subject: item.subject,
              position: item.position,
              sourceId: sourceId
            }
          });
          savedCount++;
        }
      } catch (error) {
        console.error('[PARSER] Ошибка при сохранении новости:', error);
      }
    }

    console.log(`[PARSER] Сохранено ${savedCount} новых новостей`);
    return savedCount;
  }

  async parseSource(sourceId: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      // Получаем информацию об источнике
      const source = await prisma.source.findUnique({
        where: { id: sourceId }
      });

      if (!source) {
        throw new Error('Источник не найден');
      }

      console.log(`[PARSER] Начинаем парсинг источника: ${source.name}`);

      let newsItems: ParsedNewsItem[] = [];

      // Парсим в зависимости от типа источника
      if (source.type === 'website') {
        if (source.url.includes('minfin.gov.ru')) {
          newsItems = await this.parseMinfin();
        } else {
          throw new Error(`Парсер для ${source.url} не реализован`);
        }
      } else if (source.type === 'telegram') {
        throw new Error('Парсинг Telegram пока не реализован');
      } else {
        throw new Error(`Неизвестный тип источника: ${source.type}`);
      }

      // Сохраняем новости в базу данных
      const savedCount = await this.saveNewsToDatabase(newsItems, sourceId);

      return {
        success: true,
        message: `Парсинг завершен. Найдено ${newsItems.length} новостей, сохранено ${savedCount} новых.`,
        count: savedCount
      };

    } catch (error) {
      console.error('[PARSER] Ошибка при парсинге источника:', error);
      return {
        success: false,
        message: `Ошибка парсинга: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        count: 0
      };
    }
  }
}

export const parsingService = new ParsingService(); 