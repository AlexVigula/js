// === Настройки ===
const INTERVAL = 800; // Интервал между профилями (мс)
const MAX_PROFILES = 100; // Максимальное количество профилей
const WAIT_AFTER_CLICK = 300; // Ожидание после клика (мс)

let collectedProfiles = []; // Собранные профили
let collectedKeys = new Set(); // Для проверки уникальности
let isRunning = false; // Флаг работы сбора данных

// === Основные функции ===

// Сбор данных профиля для Teamo
function collectProfileData() {
    // Сбор фото
    const photos = [];
    const photoElements = document.querySelectorAll('.faces__photo__photos__photo-v2');
    photoElements.forEach(el => {
        const style = el.getAttribute('style');
        const match = style.match(/url\(['"]?(.*?)['"]?\)/);
        if (match && match[1]) {
            photos.push(match[1]);
        }
    });

    // Сбор имени и возраста
    let name = 'Не указано';
    let age = 'Не указано';
    const nameAgeElement = document.querySelectorAll('.user-name__text')[1];
    if (nameAgeElement) {
        const text = nameAgeElement.textContent.trim();
        const match = text.match(/(.+),\s*(\d+)/);
        if (match) {
            name = match[1].trim();
            age = match[2].trim();
        }
    }

    // Сбор знака зодиака
    const zodiacSigns = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 
                        'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'];
    let zodiac = 'Не указано';
    const tagElements = document.querySelectorAll('.user-info-tags__tag');
    for (const tag of tagElements) {
        const text = tag.textContent.trim();
        if (zodiacSigns.includes(text)) {
            zodiac = text;
            break;
        }
    }

    // Сбор совместимости
    let compatibility = 'Не указано';
    const compatElement = document.querySelector('.faces__photo-compatibility-value');
    if (compatElement) {
        compatibility = compatElement.textContent.trim();
    }

    return {
        name: name,
        age: age,
        zodiac: zodiac,
        compatibility: compatibility,
        photos: photos
    };
}

// Обработка одного профиля
async function processProfile() {
    // Проверка лимита
    if (collectedProfiles.length >= MAX_PROFILES) {
        stopAutoClick();
        return;
    }

    // Сбор данных
    const profileData = collectProfileData();
    
    // Проверка на дубликаты
    const profileKey = `${profileData.name}_${profileData.age}_${profileData.zodiac}`;
    
    if (!collectedKeys.has(profileKey)) {
        collectedKeys.add(profileKey);
        collectedProfiles.push(profileData);
        console.log(`Профиль сохранен (${collectedProfiles.length}/${MAX_PROFILES}):`, profileData.name);
    } else {
        console.log('Дубликат пропущен:', profileData.name);
    }

    // Клик по лайку для перехода к следующему профилю
    const likeButton = document.querySelector('.faces-voter__button_yes');
    if (likeButton) {
        likeButton.click();
        // Ожидание загрузки нового профиля
        await new Promise(resolve => setTimeout(resolve, WAIT_AFTER_CLICK));
    } else {
        console.error('Кнопка лайка не найдена!');
        stopAutoClick();
    }
}

// Сохранение данных в JSON
function downloadJSON() {
    try {
        const blob = new Blob([JSON.stringify(collectedProfiles, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `teamo_profiles_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Ошибка сохранения JSON:', error);
    }
}

// Асинхронный цикл обработки
async function run() {
    while (isRunning) {
        const startTime = Date.now();
        await processProfile();
        if (!isRunning) break;
        
        // Поддержка заданного интервала
        const elapsed = Date.now() - startTime;
        const waitTime = Math.max(0, INTERVAL - elapsed);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
}

// Запуск сбора
function startAutoClick() {
    if (isRunning) return;
    isRunning = true;
    collectedProfiles = [];
    collectedKeys = new Set();
    
    console.log('Запуск сбора профилей...');
    run();
}

// Остановка сбора
function stopAutoClick() {
    isRunning = false;
    console.log('Цикл остановлен. Собранных профилей:', collectedProfiles.length);
    downloadJSON();
}

// Экспорт функций в глобальную область видимости
window.startAutoClick = startAutoClick;
window.stopAutoClick = stopAutoClick;

// Автозапуск (можно закомментировать, если нужно запускать вручную)
startAutoClick();
