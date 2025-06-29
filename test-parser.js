async function testParser() {
  try {
    console.log('Тестируем парсинг Минфина...');
    
    const response = await fetch('http://localhost:3001/api/sources/minfin/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Результат парсинга:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

testParser(); 