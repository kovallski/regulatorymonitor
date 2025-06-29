const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearNews() {
  try {
    console.log('=== Очистка старых новостей Минфина ===');
    
    // Получаем количество новостей перед удалением
    const countBefore = await prisma.newsItem.count({
      where: {
        sourceName: 'Минфин'
      }
    });
    
    console.log(`Найдено ${countBefore} новостей Минфина для удаления`);
    
    if (countBefore === 0) {
      console.log('Новости для удаления не найдены');
      return;
    }
    
    // Удаляем все новости Минфина
    const result = await prisma.newsItem.deleteMany({
      where: {
        sourceName: 'Минфин'
      }
    });
    
    console.log(`✅ Удалено ${result.count} новостей Минфина`);
    
    // Проверяем количество после удаления
    const countAfter = await prisma.newsItem.count({
      where: {
        sourceName: 'Минфин'
      }
    });
    
    console.log(`Осталось новостей Минфина: ${countAfter}`);
    
  } catch (error) {
    console.error('Ошибка при очистке новостей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearNews(); 