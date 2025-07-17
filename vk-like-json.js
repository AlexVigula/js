// === Настройки ===
const INTERVAL = 2500; // Интервал между кликами (в мс)
const MAX_PROFILES = 3; // Максимальное количество профилей для сбора
let collectedProfiles = []; // Массив для хранения профилей
let intervalId; // Идентификатор интервала

// === Функция сбора данных профиля ===
function collectProfileData() {
  return {
    timestamp: new Date().toISOString(),
    name: getText('.MWrUXww6') || 'Не указано',
    age: getText('.ozp3w7rI')?.replace(',', '') || 'Не указано',
    status: getAriaLabel('.otTddpCo > h5') || 'Не указано',
    distance: getAriaLabel('[aria-label*="км"]') || 'Не указано',
    zodiac: getText('[href="#zodiac_cancer_outline_20"]') || 'Не указано',
    relationship: getText('.rLkDJZ6_ .vkuiFootnote__host') || 'Не указано',
    height: getText('[href="#fullscreen_outline_20"]') || 'Не указано',
    alcohol: getText('[href="#wineglass_outline_20"]') || 'Не указано',
    smoking: getText('[href="#cigarette_outline_20"]') || 'Не указано',
    education: getText('.vkuiMiniInfoCell__content') || 'Не указано',
    job: [...document.querySelectorAll('.vkuiMiniInfoCell__content')].slice(1)[0]?.textContent.trim() || 'Не указано',
    interests: [...document.querySelectorAll('.XFSXm_iw h5')].map(el => el.textContent.trim()),
    music: [...document.querySelectorAll('.otTddpCo h5')].map(el => el.textContent.trim())
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
      }, 1000); // Ждем загрузки данных
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
