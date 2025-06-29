async function clearNews() {
  try {
    console.log('Очищаем новости из базы данных...');
    
    // Получаем все новости
    const response = await fetch('http://localhost:3001/api/news');
    const news = await response.json();
    
    console.log(`Найдено ${news.length} новостей для удаления`);
    
    // Удаляем каждую новость (в реальном приложении лучше сделать bulk delete)
    for (const item of news) {
      const deleteResponse = await fetch(`http://localhost:3001/api/news/${item.id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log(`Удалена новость: ${item.title}`);
      } else {
        console.log(`Ошибка удаления: ${item.title}`);
      }
    }
    
    console.log('Очистка завершена');
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

clearNews(); 