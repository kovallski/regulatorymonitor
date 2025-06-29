async function testParser() {
  try {
    console.log('=== Тестирование парсера с фильтром от 1 июня 2025 ===');
    
    // Сначала получаем список источников
    const sourcesResponse = await fetch('http://localhost:3001/api/sources');
    const sources = await sourcesResponse.json();
    
    const minfinSource = sources.find(s => s.url.includes('minfin.gov.ru'));
    
    if (!minfinSource) {
      console.error('Источник Минфина не найден');
      return;
    }
    
    console.log(`Найден источник: ${minfinSource.name} (ID: ${minfinSource.id})`);
    
    // Запускаем парсинг с фильтром от 1 июня
    const dateFrom = '2025-06-01';
    console.log(`Запускаем парсинг с фильтром от: ${dateFrom}`);
    
    const parseResponse = await fetch(`http://localhost:3001/api/sources/${minfinSource.id}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateFrom: dateFrom,
        limit: 200
      })
    });
    
    const result = await parseResponse.json();
    
    console.log('\n=== Результат парсинга ===');
    console.log(`Сообщение: ${result.message}`);
    console.log(`Статус: ${result.status}`);
    console.log(`Количество: ${result.count}`);
    
    // Проверяем новости в базе
    const newsResponse = await fetch(`http://localhost:3001/api/news?dateFrom=${dateFrom}`);
    const newsData = await newsResponse.json();
    
    console.log(`\n=== Новости в базе с ${dateFrom} ===`);
    console.log(`Всего найдено: ${newsData.items?.length || 0}`);
    
    if (newsData.items && newsData.items.length > 0) {
      // Группируем по датам
      const groupedByDate = {};
      newsData.items.forEach(news => {
        const date = new Date(news.publishedAt).toLocaleDateString('ru-RU');
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(news);
      });
      
      // Выводим по датам
      Object.keys(groupedByDate).sort().forEach(date => {
        console.log(`\n${date} (${groupedByDate[date].length} новостей):`);
        groupedByDate[date].forEach(news => {
          console.log(`  - ${news.title}`);
        });
      });
    }
    
  } catch (error) {
    console.error('Ошибка при тестировании парсера:', error);
  }
}

testParser(); 