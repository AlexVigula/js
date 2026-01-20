// Настройки
const config = {
  delayBetweenClicks: 2000, // Задержка между кликами в миллисекундах
  maxAttempts: 100, // Максимальное количество попыток
  targetButtonTexts: ['Добавить', 'Подписаться'], // Тексты кнопок для клика
  scrollDelay: 1000, // Задержка после скролла
  scrollStep: 500, // Шаг скролла
};

// Переменные состояния
let processedButtons = new Set();
let totalClicks = 0;
let errors = 0;
let isRunning = true;

// Функция для поиска кнопок
function findButtons() {
  return Array.from(document.querySelectorAll('button[data-testid="desktop_catalog_user_button"]'))
    .filter(button => {
      const buttonText = button.textContent.trim();
      const isTargetButton = config.targetButtonTexts.some(text => 
        buttonText.includes(text)
      );
      const notProcessed = !processedButtons.has(button);
      const isVisible = button.offsetParent !== null;
      
      return isTargetButton && notProcessed && isVisible;
    });
}

// Функция для скролла страницы
function scrollPage() {
  window.scrollBy({
    top: config.scrollStep,
    behavior: 'smooth'
  });
  console.log('📜 Скролл страницы выполнен');
}

// Функция клика по кнопке
async function clickButton(button) {
  return new Promise((resolve, reject) => {
    try {
      processedButtons.add(button);
      
      // Сохраняем текст кнопки для логирования
      const buttonText = button.textContent.trim();
      const userName = button.closest('[data-testid="userrichcell"]')?.querySelector('[data-testid="userrichcell-name"]')?.textContent || 'Неизвестный пользователь';
      
      console.log(`🔄 Пытаюсь кликнуть: ${buttonText} для ${userName}`);
      
      // Симулируем клик
      button.click();
      totalClicks++;
      
      // Ждем изменения состояния кнопки
      setTimeout(() => {
        const newButtonText = button.textContent.trim();
        if (newButtonText !== buttonText) {
          console.log(`✅ Успешно: ${userName} - кнопка изменилась на "${newButtonText}"`);
        } else {
          console.log(`⚠️  Предупреждение: ${userName} - кнопка не изменилась`);
        }
        resolve();
      }, 500);
      
    } catch (error) {
      errors++;
      console.error(`❌ Ошибка при клике: ${error.message}`);
      reject(error);
    }
  });
}

// Основная функция обработки
async function processPage() {
  console.log('🚀 Запуск автоматической обработки...');
  console.log('⚙️  Настройки:', config);
  
  let attempts = 0;
  
  while (isRunning && attempts < config.maxAttempts) {
    attempts++;
    console.log(`\n🔍 Попытка ${attempts} из ${config.maxAttempts}`);
    
    // Ищем кнопки
    const buttons = findButtons();
    console.log(`📊 Найдено кнопок для обработки: ${buttons.length}`);
    
    if (buttons.length > 0) {
      // Обрабатываем каждую кнопку
      for (let i = 0; i < buttons.length; i++) {
        if (!isRunning) break;
        
        const button = buttons[i];
        await clickButton(button);
        
        // Задержка между кликами
        if (i < buttons.length - 1) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenClicks));
        }
      }
    } else {
      console.log('📜 Новых кнопок не найдено, скроллим...');
      scrollPage();
      
      // Ждем подгрузки контента
      await new Promise(resolve => setTimeout(resolve, config.scrollDelay));
    }
    
    // Обновляем статистику
    console.log('\n📊 Статистика:');
    console.log(`   Всего кликов: ${totalClicks}`);
    console.log(`   Обработано кнопок: ${processedButtons.size}`);
    console.log(`   Ошибок: ${errors}`);
    
    // Проверяем условие остановки
    if (processedButtons.size >= config.maxAttempts) {
      console.log('🎯 Достигнуто максимальное количество обработок');
      break;
    }
    
    // Задержка между итерациями
    await new Promise(resolve => setTimeout(resolve, config.delayBetweenClicks));
  }
  
  console.log('\n🏁 Обработка завершена!');
  console.log('📈 Итоговая статистика:');
  console.log(`   Всего попыток: ${attempts}`);
  console.log(`   Всего кликов: ${totalClicks}`);
  console.log(`   Обработано кнопок: ${processedButtons.size}`);
  console.log(`   Ошибок: ${errors}`);
}

// Функция для остановки скрипта
function stopScript() {
  console.log('🛑 Остановка скрипта...');
  isRunning = false;
}

// Запуск скрипта
console.log(`
╔══════════════════════════════════════╗
║   АВТОМАТИЧЕСКОЕ ДОБАВЛЕНИЕ В ДРУЗЬЯ   ║
╚══════════════════════════════════════╝

Для запуска введите: startScript()
Для остановки введите: stopScript()

Настройки (можно менять в объекте config):
• Задержка между кликами: ${config.delayBetweenClicks}мс
• Максимальное количество: ${config.maxAttempts}
• Искомые кнопки: ${config.targetButtonTexts.join(', ')}

Скрипт будет:
1. Искать кнопки "Добавить" и "Подписаться"
2. Кликать по ним с задержкой
3. Автоматически скроллить страницу
4. Выводить статистику в консоль
`);

// Экспортируем функции в глобальную область видимости
window.startScript = processPage;
window.stopScript = stopScript;

// Если нужно запустить автоматически, раскомментируйте:
// processPage();
