// === Настройки ===
const INTERVAL = 2500; // Интервал между кликами (в мс)
const MAX_PROFILES = 1; // Максимальное количество профилей для сбора
let collectedProfiles = []; // Массив для хранения профилей
let intervalId; // Идентификатор интервала

// === Функция сбора данных профиля ===
function collectProfileData() {
  // Сбор фотографий
  const photoElements = document.querySelectorAll('.MmhGaofd img');
  const photos = [];
  
  if (photoElements.length > 0) {
    // Сначала добавляем текущее изображение
    const currentPhoto = photoElements[0].src;
    if (currentPhoto.includes('userapi.com')) {
      photos.push(currentPhoto);
    }
    
    // Пытаемся найти и кликнуть стрелку вправо для сбора всех фото
    const rightArrow = document.querySelector('.OAf1LKm6.Mq6KKuwQ');
    if (rightArrow) {
      // Сохраняем исходное состояние
      const originalSrc = currentPhoto;
      let attemptCount = 0;
      
      // Кликаем до тех пор, пока не загрузится новое фото или не превысим лимит попыток
      while (attemptCount < 5) { // Ограничиваем количество попыток
        rightArrow.click();
        attemptCount++;
        
        // Ждем загрузки нового фото (синхронный sleep)
        const start = Date.now();
        while (Date.now() - start < 800) {
          // Ждем
        }
        
        const newPhoto = document.querySelector('.MmhGaofd img')?.src;
        if (newPhoto && newPhoto.includes('userapi.com') && newPhoto !== originalSrc && !photos.includes(newPhoto)) {
          photos.push(newPhoto);
          attemptCount = 0; // Сбрасываем счетчик при успешной загрузке нового фото
        }
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    status: getAriaLabel('.otTddpCo[aria-label*="Была"]') || 'Не указано', // Статус "Была сегодня"
    name: getText('.MWrUXww6') || 'Не указано',
    age: getText('.ozp3w7rI')?.replace(',', '') || 'Не указано',
    distance: getAriaLabel('[aria-label*="км"]') || 'Не указано', // Расстояние
    zodiac: getText('[href*="zodiac_"] h5') || 'Не указано', // Зодиак
    relationship: getText('.rLkDJZ6_ .vkuiFootnote__host') || 'Не указано', // Цель отношений
    height: getText('[href="#fullscreen_outline_20"] + h5') || 'Не указано', // Рост
    alcohol: getText('[href="#wineglass_outline_20"] + h5') || 'Не указано', // Отношение к алкоголю
    smoking: getText('[href="#cigarette_outline_20"] + h5') || 'Не указано', // Курение
    education: getText('.vkuiMiniInfoCell__content:nth-of-type(1)') || 'Не указано', // Образование
    job: getText('.vkuiMiniInfoCell__content:nth-of-type(2)') || 'Не указано', // Работа
    interests: [...document.querySelectorAll('.XFSXm_iw h5')].filter(el => {
      // Исключаем элементы с "Была", "км", "см", "Редко", "Не курю"
      const text = el.textContent.trim();
      return !/Была|км|см|Редко|Не курю|Не пью|Нет детей|Держу форму|Свободна/.test(text);
    }).map(el => el.textContent.trim()), // Интересы
    music: [...document.querySelectorAll('.otTddpCo h5')].filter(el => {
      // Исключаем элементы с "Была", "км", "см", "Редко"
      const text = el.textContent.trim();
      return !/Была|км|см|Редко/.test(text);
    }).map(el => el.textContent.trim()), // Музыка
    photos: [...new Set(photos)] // Уникализируем ссылки
  };
}

// === Вспомогательные функции ===
function getText(selector) {
  const el = document.querySelector(selector);
  return el ? el.textContent.trim() : null;
}

function getAriaLabel(selector) {
  const el = document.querySelector(selector);
  return el ? el.getAttribute('aria-label') : null;
}

// === Основной цикл ===
function startAutoClick() {
  intervalId = setInterval(() => {
    const buttons = document.querySelectorAll('.vkuiTappable__stateLayer');
    
    if (buttons.length > 2 && collectedProfiles.length < MAX_PROFILES) {
      buttons[2].click(); // Клик по третьей кнопке
      
      setTimeout(() => {
        const profileData = collectProfileData();
        if (profileData) {
          collectedProfiles.push(profileData);
          console.log('Профиль сохранен:', profileData.name);
          
          // Остановка цикла при достижении лимита
          if (collectedProfiles.length >= MAX_PROFILES) {
            clearInterval(intervalId);
            console.log(`Достигнуто максимальное количество профилей (${MAX_PROFILES}). Цикл остановлен.`);
            downloadJSON(); // Автоматическое сохранение
          }
        }
      }, 1500); // Увеличено время ожидания для загрузки фото
    } else {
      clearInterval(intervalId);
      console.warn('Кнопки не найдены. Цикл остановлен.');
    }
  }, INTERVAL);
}

// === Сохранение данных в JSON ===
function downloadJSON() {
  try {
    const blob = new Blob([JSON.stringify(collectedProfiles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vk_dating_profiles_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка сохранения JSON:', error);
  }
}

// === Команда для остановки цикла ===
window.stopAutoClick = () => {
  clearInterval(intervalId);
  console.log('Цикл остановлен. Собранных профилей:', collectedProfiles.length);
  downloadJSON(); // Сохраняем данные при ручной остановке
};

// === Запуск скрипта ===
startAutoClick();
