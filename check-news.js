const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNews() {
  try {
    console.log('=== Проверка новостей с 1 июня 2025 ===');
    
    // Получаем все новости с 1 июня 2025
    const newsFromJune1 = await prisma.newsItem.findMany({
      where: {
        publishedAt: {
          gte: new Date('2025-06-01'),
          lte: new Date('2025-06-30')
        }
      },
      orderBy: {
        publishedAt: 'asc'
      },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        sourceName: true,
        sourceUrl: true
      }
    });

    console.log(`Найдено ${newsFromJune1.length} новостей с июня 2025:`);
    
    // Группируем по датам
    const groupedByDate = {};
    newsFromJune1.forEach(news => {
      const date = news.publishedAt.toLocaleDateString('ru-RU');
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(news);
    });

    // Выводим по датам
    Object.keys(groupedByDate).sort().forEach(date => {
      console.log(`\n${date} (${groupedByDate[date].length} новостей):`);
      groupedByDate[date].forEach(news => {
        console.log(`  - ${news.title} (${news.sourceName})`);
      });
    });

    // Проверяем общее количество новостей в базе
    const totalNews = await prisma.newsItem.count();
    console.log(`\n=== Общая статистика ===`);
    console.log(`Всего новостей в базе: ${totalNews}`);

    // Проверяем новости по источникам
    const newsBySource = await prisma.newsItem.groupBy({
      by: ['sourceName'],
      _count: {
        id: true
      }
    });

    console.log('\nНовости по источникам:');
    newsBySource.forEach(source => {
      console.log(`  ${source.sourceName}: ${source._count.id}`);
    });

  } catch (error) {
    console.error('Ошибка при проверке новостей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNews(); 