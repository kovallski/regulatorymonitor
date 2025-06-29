const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUrls() {
  try {
    console.log('=== Проверка URL новостей в базе данных ===');
    
    // Получаем последние 10 новостей
    const recentNews = await prisma.newsItem.findMany({
      where: {
        sourceName: 'Минфин'
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        publishedAt: true
      }
    });

    console.log(`Найдено ${recentNews.length} последних новостей Минфина:\n`);
    
    recentNews.forEach((news, index) => {
      console.log(`${index + 1}. ${news.title}`);
      console.log(`   Дата: ${news.publishedAt.toLocaleDateString('ru-RU')}`);
      console.log(`   URL: ${news.sourceUrl}`);
      
      // Проверяем, является ли URL правильным
      if (news.sourceUrl.includes('minfin.gov.ru/ru/document/')) {
        console.log(`   ✅ Правильный URL документа`);
      } else if (news.sourceUrl.includes('minfin.gov.ru/ru/')) {
        console.log(`   ✅ Правильный URL раздела`);
      } else if (news.sourceUrl.includes('.pdf') || news.sourceUrl.includes('.doc')) {
        console.log(`   ✅ Правильный URL файла`);
      } else if (news.sourceUrl === 'https://minfin.gov.ru') {
        console.log(`   ❌ Неправильный URL - главная страница`);
      } else {
        console.log(`   ❓ Неизвестный формат URL`);
      }
      console.log('');
    });

    // Проверяем статистику URL
    const urlStats = await prisma.newsItem.groupBy({
      by: ['sourceName'],
      where: {
        sourceName: 'Минфин'
      },
      _count: {
        id: true
      }
    });

    console.log('=== Статистика URL ===');
    urlStats.forEach(stat => {
      console.log(`${stat.sourceName}: ${stat._count.id} новостей`);
    });

  } catch (error) {
    console.error('Ошибка при проверке URL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUrls(); 