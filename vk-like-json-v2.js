// === Настройки ===
const INTERVAL = 800; // Интервал между профилями (мс)
const MAX_PROFILES = 1000; // Максимальное количество профилей

let collectedProfiles = []; // Собранные профили
let collectedKeys = new Set(); // Для проверки уникальности
let intervalId; // ID интервала
let isProcessing = false; // Флаг обработки профиля

// === Основные функции ===

// Сбор данных профиля (упрощенная версия без переключения фото)
function collectProfileData() {
    // Сбор текущего фото
    const photos = [];
    const photoContainer = document.querySelector('.MmhGaofd');
    if (photoContainer) {
        const img = photoContainer.querySelector('img');
        if (img?.src.includes('userapi.com')) {
            photos.push(img.src);
        }
    }
    
    // Сбор описания профиля
    let description = 'Не указано';
    const descElement = document.querySelector('.QLecl7_H.vkuiFootnote__host');
    if (descElement) {
        description = descElement.textContent.trim();
    }
    
    return {
        photos: photos,
        description: description
    };
}

// Получение текста элемента
function getText(selector) {
    const el = document.querySelector(selector);
    return el ? el.textContent.trim() : null;
}

// Получение атрибута aria-label
function getAriaLabel(selector) {
    const el = document.querySelector(selector);
    return el ? el.getAttribute('aria-label') : null;
}

// Обработка одного профиля
async function processProfile() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        // Проверка лимита
        if (collectedProfiles.length >= MAX_PROFILES) {
            clearInterval(intervalId);
            console.log(`Достигнуто ${MAX_PROFILES} профилей. Цикл остановлен.`);
            downloadJSON();
            isProcessing = false;
            return;
        }

        // Поиск кнопок
        const buttons = document.querySelectorAll('.vkuiTappable__stateLayer');
        if (buttons.length < 3) {
            console.warn('Кнопки не найдены. Ожидание...');
            isProcessing = false;
            return;
        }

        // Клик на следующую кнопку
        buttons[2].click();
        
        // Ожидание загрузки профиля
        await new Promise(r => setTimeout(r, 300));

        // Сбор данных
        const {photos, description} = collectProfileData();
        
        // Формирование данных профиля
        const profileData = {
            timestamp: new Date().toISOString(),
            name: getText('.MWrUXww6') || 'Не указано',
            age: getText('.ozp3w7rI')?.replace(',', '') || 'Не указано',
            distance: getAriaLabel('[aria-label*="км"]') || 'Не указано',
            status: getAriaLabel('.otTddpCo[aria-label*="Была"]') || 'Не указано',
            zodiac: getText('[href*="zodiac_"] h5') || 'Не указано',
            relationship: getText('.rLkDJZ6_ .vkuiFootnote__host') || 'Не указано',
            height: getText('[href="#fullscreen_outline_20"] + h5') || 'Не указано',
            alcohol: getText('[href="#wineglass_outline_20"] + h5') || 'Не указано',
            smoking: getText('[href="#cigarette_outline_20"] + h5') || 'Не указано',
            education: getText('.vkuiMiniInfoCell__content:nth-of-type(1)') || 'Не указано',
            job: getText('.vkuiMiniInfoCell__content:nth-of-type(2)') || 'Не указано',
            description: description, // Добавлено описание
            interests: [...document.querySelectorAll('.XFSXm_iw h5')]
                .filter(el => !/Была|км|см|Редко|Не курю|Не пью|Нет детей|Держу форму|Свободна/.test(el.textContent.trim()))
                .map(el => el.textContent.trim()),
            music: [...document.querySelectorAll('.otTddpCo h5')]
                .filter(el => !/Была|км|см|Редко/.test(el.textContent.trim()))
                .map(el => el.textContent.trim()),
            photos: photos
        };

        // Проверка на дубликаты
        const profileKey = `${profileData.name}_${profileData.age}_${profileData.distance}`;
        
        if (!collectedKeys.has(profileKey)) {
            collectedKeys.add(profileKey);
            collectedProfiles.push(profileData);
            console.log(`Профиль сохранен (${collectedProfiles.length}/${MAX_PROFILES}):`, profileData.name);
        } else {
            console.log('Дубликат пропущен:', profileData.name);
        }
    } catch (error) {
        console.error('Ошибка при обработке профиля:', error);
    } finally {
        isProcessing = false;
    }
}

// Сохранение данных в JSON
function downloadJSON() {
    try {
        const blob = new Blob([JSON.stringify(collectedProfiles, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vk_dating_profiles_klg_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Ошибка сохранения JSON:', error);
    }
}

// Запуск сбора
function startAutoClick() {
    if (intervalId) clearInterval(intervalId);
    collectedProfiles = [];
    collectedKeys = new Set();
    
    console.log('Запуск сбора профилей...');
    intervalId = setInterval(processProfile, INTERVAL);
}

// Остановка сбора
function stopAutoClick() {
    clearInterval(intervalId);
    console.log('Цикл остановлен. Собранных профилей:', collectedProfiles.length);
    downloadJSON();
}

// Экспорт функций в глобальную область видимости
window.startAutoClick = startAutoClick;
window.stopAutoClick = stopAutoClick;

// Автозапуск (можно закомментировать, если нужно запускать вручную)
startAutoClick();
