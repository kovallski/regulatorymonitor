async function testMinfinAPI() {
  try {
    console.log('Тестируем OpenDataAPI Минфина...');
    
    const response = await fetch('https://minfin.gov.ru/OpenDataAPI/api/json/dataset/7710349494-documents/version/1.0/items?limit=3', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Ответ API:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.items && data.items.length > 0) {
      console.log(`\nНайдено ${data.items.length} документов`);
      console.log('Первый документ:');
      console.log(JSON.stringify(data.items[0], null, 2));
    }
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

testMinfinAPI(); 