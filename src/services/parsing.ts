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

  async parseMinfin(dateFrom?: Date, dateTo?: Date, limit?: number): Promise<ParsedNewsItem[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    const allNewsItems: ParsedNewsItem[] = [];
    let pageNum = 1;
    let shouldContinue = true;
    try {
      console.log(`[PARSER] === НАЧАЛО парсинга Минфина ===`);
      while (shouldContinue) {
        const url = `https://minfin.gov.ru/ru/document/?page_4=${pageNum}`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('.document_card, .document-item, .news-item, .card', { timeout: 20000 });

        // Делаем скриншот для отладки
        await page.screenshot({ path: `debug-minfin-page-${pageNum}.png` });
        console.log(`[PARSER] Скриншот сохранен: debug-minfin-page-${pageNum}.png`);

        // Получаем HTML структуру для отладки
        const debugHtml = await page.evaluate(() => {
          const cards = document.querySelectorAll('.document_card, .document-item, .news-item, .card');
          if (cards.length > 0) {
            const firstCard = cards[0];
            return {
              cardHtml: firstCard.outerHTML,
              allText: firstCard.textContent,
              className: firstCard.className
            };
          }
          return null;
        });
        
        if (debugHtml) {
          console.log(`[PARSER] Отладка HTML структуры:`);
          console.log(`[PARSER] Класс карточки: ${debugHtml.className}`);
          console.log(`[PARSER] Весь текст: ${debugHtml.allText?.substring(0, 200)}...`);
        }

        const pageNews = await page.evaluate(() => {
          const selectors = ['.document_card', '.document-item', '.news-item', '.card'];
          let cards: Element[] = [];
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              cards = Array.from(elements);
              break;
            }
          }
          return cards.map(card => {
            // Заголовок и URL - улучшенная логика
            let title = '';
            let url = '';
            
            // Сначала ищем ссылку на конкретный документ (/ru/document?id_4=...)
            const docLink = card.querySelector('a[href*="/ru/document?id_4="]');
            if (docLink) {
              url = docLink.getAttribute('href') || '';
            } else {
              // fallback: ищем любую ссылку на /document/
              const anyDocLink = card.querySelector('a[href*="/document/"]');
              if (anyDocLink) {
                url = anyDocLink.getAttribute('href') || '';
              }
            }
            // Если url относительный, добавляем https://minfin.gov.ru
            if (url && url.startsWith('/')) {
              url = 'https://minfin.gov.ru' + url;
            }
            // Заголовок
            if (!title) {
              const titleEl = card.querySelector('.document_title, .title, h3, h4, .document-name, .news-title, a[href]');
              title = titleEl?.textContent?.trim() || '';
            }
            // Логируем для отладки
            console.log(`[PARSER] Найдена новость: "${title}" -> URL: ${url}`);
            // Дата публикации: ищем текст "Опубликовано: DD.MM.YYYY"
            let publishedDate = '';
            const allEls = Array.from(card.querySelectorAll('*'));
            for (const el of allEls) {
              if (el.textContent && el.textContent.includes('Опубликовано:')) {
                const match = el.textContent.match(/Опубликовано:\s*(\d{2}\.\d{2}\.\d{4})/);
                if (match) {
                  publishedDate = match[1];
                  break;
                }
              }
            }
            // Если не нашли, fallback к старой логике
            let dateText = publishedDate;
            if (!dateText) {
              // Старый способ: ищем по селекторам и паттернам
              const dateSelectors = [
                '.date', '.time', '.published', '[class*="date"]', 
                '.document-date', '.news-date', '.pub-date',
                'time', '[datetime]', '.meta-date',
                '.document-meta', '.news-meta', '.meta',
                'span[class*="date"]', 'div[class*="date"]',
                '.document-info', '.news-info'
              ];
              let dateEl = null;
              for (const selector of dateSelectors) {
                dateEl = card.querySelector(selector);
                if (dateEl) {
                  dateText = dateEl.getAttribute('datetime') || dateEl.textContent?.trim() || '';
                  if (dateText) break;
                }
              }
              if (!dateText) {
                const allText = card.textContent || '';
                const datePatterns = [
                  /\d{1,2}\.\d{1,2}\.\d{4}/g,  // DD.MM.YYYY
                  /\d{4}-\d{1,2}-\d{1,2}/g,    // YYYY-MM-DD
                  /\d{1,2}\/\d{1,2}\/\d{4}/g   // DD/MM/YYYY
                ];
                for (const pattern of datePatterns) {
                  const matches = allText.match(pattern);
                  if (matches && matches.length > 0) {
                    dateText = matches[0];
                    break;
                  }
                }
              }
            }
            // Теги
            const tagEls = card.querySelectorAll('ul.tag_list li a, .tags a, .category, [class*="tag"]');
            const tags = Array.from(tagEls).map(tag => tag.textContent?.trim() || '').filter(Boolean);
            
            return { title, url, dateText, tags };
          });
        });

        let oldestOnPage: Date | undefined = undefined;
        let relevantOnThisPage = 0;
        
        for (const item of pageNews) {
          // Парсим дату с улучшенной логикой
          let publishedAt = new Date();
          let dateParsed = false;
          
          if (item.dateText) {
            // Явная проверка формата DD.MM.YYYY
            if (/^\d{2}\.\d{2}\.\d{4}$/.test(item.dateText)) {
              const [day, month, year] = item.dateText.split('.').map(Number);
              // Строгая валидация даты
              const currentYear = new Date().getFullYear();
              if (year >= 2020 && year <= currentYear + 1 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                publishedAt = new Date(year, month - 1, day);
                dateParsed = true;
              } else {
                console.log(`[PARSER] Неразумная дата: ${day}.${month}.${year}, пропускаем`);
              }
            } else {
              // Пробуем разные форматы даты
              const dateFormats = [
                // DD.MM.YYYY
                /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
                // YYYY-MM-DD
                /(\d{4})-(\d{1,2})-(\d{1,2})/,
                // DD/MM/YYYY
                /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
                // ISO формат
                /(\d{4})-(\d{1,2})-(\d{1,2})T/
              ];
              
              for (const format of dateFormats) {
                const match = item.dateText.match(format);
                if (match) {
                  let year, month, day;
                  
                  if (format.source.includes('T')) {
                    // ISO формат
                    year = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    day = parseInt(match[3]);
                  } else if (format.source.includes('YYYY')) {
                    // Формат с годом в конце
                    year = parseInt(match[3]);
                    month = parseInt(match[2]) - 1;
                    day = parseInt(match[1]);
                  } else {
                    // Формат с годом в начале
                    year = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    day = parseInt(match[3]);
                  }
                  
                  if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    // Строгая проверка разумности даты
                    const currentYear = new Date().getFullYear();
                    if (year >= 2020 && year <= currentYear + 1 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                      publishedAt = new Date(year, month, day);
                      dateParsed = true;
                      break;
                    } else {
                      console.log(`[PARSER] Неразумная дата: ${day}.${month + 1}.${year}, пропускаем`);
                    }
                  }
                }
              }
            }
            
            if (!dateParsed) {
              console.log(`[PARSER] Не удалось распарсить дату: "${item.dateText}", используем текущую дату`);
            }
          } else {
            console.log(`[PARSER] Дата не найдена для новости "${item.title}", используем текущую дату`);
          }
          
          if (!oldestOnPage || publishedAt < oldestOnPage) oldestOnPage = publishedAt;

          // Проверяем, подходит ли новость под фильтры
          let shouldInclude = true;
          if (dateFrom && publishedAt < dateFrom) {
            shouldInclude = false;
            console.log(`[PARSER] Новость "${item.title}" (${publishedAt.toLocaleDateString()}) старше dateFrom (${dateFrom.toLocaleDateString()}), пропускаем`);
          }
          if (dateTo && publishedAt > dateTo) {
            shouldInclude = false;
            console.log(`[PARSER] Новость "${item.title}" (${publishedAt.toLocaleDateString()}) новее dateTo (${dateTo.toLocaleDateString()}), пропускаем`);
          }

          if (shouldInclude) {
            relevantOnThisPage++;
            allNewsItems.push({
              title: item.title,
              summary: `${item.title}. ${item.tags.join(', ')}`,
              sourceUrl: item.url.startsWith('http') ? item.url : `https://minfin.gov.ru${item.url}`,
              sourceName: 'Минфин',
              publishedAt,
              documentRef: item.url.split('/').pop() || undefined,
              taxType: item.tags.find((tag: string) => tag.toLowerCase().includes('налог')) || undefined,
              subject: item.title,
              position: item.tags.join(', ')
            });
            console.log(`[PARSER] Добавлена новость: "${item.title}" (${publishedAt.toLocaleDateString()})`);
            
            if (limit && allNewsItems.length >= limit) {
              shouldContinue = false;
              console.log(`[PARSER] Достигнут лимит ${limit}, останавливаем парсинг`);
              break;
            }
          }
        }
        
        // Краткое логирование по странице
        console.log(`[PARSER] Страница ${pageNum}: найдено ${pageNews.length}, подходящих под фильтры: ${relevantOnThisPage}, всего собрано: ${allNewsItems.length}`);
        
        // Останавливаемся только если:
        // 1. Достигнут лимит
        // 2. Нет новостей на странице
        // 3. Есть dateFrom И вся страница содержит новости старше dateFrom
        if (!shouldContinue || !pageNews.length) {
          console.log(`[PARSER] Останавливаем парсинг: shouldContinue=${shouldContinue}, pageNews.length=${pageNews.length}`);
          break;
        }
        
        if (dateFrom && oldestOnPage && oldestOnPage < dateFrom) {
          console.log(`[PARSER] Вся страница ${pageNum} содержит новости старше ${dateFrom.toLocaleDateString()} (самая старая: ${oldestOnPage.toLocaleDateString()}), останавливаем парсинг`);
          break;
        }
        
        if (!dateFrom && !limit) {
          console.log(`[PARSER] Нет фильтров и лимита, останавливаем после первой страницы`);
          break;
        }
        
        pageNum++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log(`[PARSER] === ЗАВЕРШЕНО. Всего загружено: ${allNewsItems.length} ===`);
      return allNewsItems;
    } catch (error) {
      console.error('[PARSER] Ошибка при постраничном парсинге Минфина:', error);
      throw error;
    } finally {
      await page.close();
    }
  }
  
  // Вспомогательный метод для извлечения типа налога из заголовка
  private extractTaxType(title: string): string | undefined {
    const taxKeywords = [
      'НДС', 'НДФЛ', 'налог на прибыль', 'налог на доходы', 'налог на имущество',
      'транспортный налог', 'земельный налог', 'акциз', 'пошлина', 'сбор'
    ];
    
    const lowerTitle = title.toLowerCase();
    for (const keyword of taxKeywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        return keyword;
      }
    }
    
    return undefined;
  }

  async saveNewsToDatabase(newsItems: ParsedNewsItem[], sourceId: string) {
    console.log(`[PARSER] Сохранение ${newsItems.length} новостей в базу данных...`);
    let savedCount = 0;
    let skippedCount = 0;
    
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
          
          console.log(`[PARSER] Сохраняем новость: "${item.title}" (дата: ${item.publishedAt.toLocaleDateString()})`);
          
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
        } else {
          console.log(`[PARSER] Новость уже существует: "${item.title}" (дата: ${item.publishedAt.toLocaleDateString()})`);
          skippedCount++;
        }
      } catch (error) {
        console.error('[PARSER] Ошибка при сохранении новости:', error);
      }
    }
    console.log(`[PARSER] Сохранено ${savedCount} новых новостей, пропущено ${skippedCount} дубликатов`);
    return savedCount;
  }

  async parseSource(sourceId: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const source = await prisma.source.findUnique({
        where: { id: sourceId }
      });

      if (!source) {
        return { success: false, message: 'Источник не найден', count: 0 };
      }

      console.log(`[PARSER] Начинаем парсинг источника: ${source.name}`);

      let newsItems: ParsedNewsItem[] = [];

      // Определяем тип источника и вызываем соответствующий парсер
      if (source.url.includes('minfin.gov.ru')) {
        newsItems = await this.parseMinfin();
      } else {
        return { success: false, message: `Неподдерживаемый тип источника: ${source.url}`, count: 0 };
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
      return { success: false, message: `Ошибка парсинга: ${error.message}`, count: 0 };
    }
  }

  async parseSourceWithFilters(
    sourceId: string, 
    dateFrom?: Date, 
    dateTo?: Date, 
    limit?: number
  ): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const source = await prisma.source.findUnique({
        where: { id: sourceId }
      });

      if (!source) {
        return { success: false, message: 'Источник не найден', count: 0 };
      }

      console.log(`[PARSER] Начинаем парсинг источника: ${source.name}`);
      console.log(`[PARSER] Фильтры: dateFrom=${dateFrom}, dateTo=${dateTo}, limit=${limit}`);

      let newsItems: ParsedNewsItem[] = [];

      // Определяем тип источника и вызываем соответствующий парсер с фильтрами
      if (source.url.includes('minfin.gov.ru')) {
        newsItems = await this.parseMinfin(dateFrom, dateTo, limit);
      } else {
        return { success: false, message: `Неподдерживаемый тип источника: ${source.url}`, count: 0 };
      }

      // Сохраняем новости в базу данных
      const savedCount = await this.saveNewsToDatabase(newsItems, sourceId);

      return {
        success: true,
        message: `Парсинг завершен. Найдено ${newsItems.length} новостей (с учетом фильтров), сохранено ${savedCount} новых.`,
        count: savedCount
      };

    } catch (error) {
      console.error('[PARSER] Ошибка при парсинге источника с фильтрами:', error);
      return { success: false, message: `Ошибка парсинга: ${error.message}`, count: 0 };
    }
  }
}

export const parsingService = new ParsingService();