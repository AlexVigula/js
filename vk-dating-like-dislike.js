// === Настройки ===
const INTERVAL = 600; // Интервал между профилями (мс)
const MAX_PROFILES = 1000; // Максимальное количество профилей

let collectedProfiles = []; // Собранные профили
let collectedKeys = new Set(); // Для проверки уникальности
let intervalId; // ID интервала

// === СБОР ДАННЫХ ===

// Сбор данных с текущего профиля
function collectCurrentProfile() {
    console.log('📊 Сбор данных текущего профиля...');
    
    // Сбор фото
    const photos = [];
    const photoContainer = document.querySelector('.MmhGaofd');
    if (photoContainer) {
        const img = photoContainer.querySelector('img');
        if (img?.src.includes('userapi.com')) {
            photos.push(img.src);
        }
    }
    
    // Сбор описания
    let description = 'Не указано';
    const descElement = document.querySelector('.QLecl7_H.vkuiFootnote__host');
    if (descElement) {
        description = descElement.textContent.trim();
    }
    
    // Вспомогательная функция для получения текста
    function getText(selector) {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : null;
    }
    
    // Вспомогательная функция для получения aria-label
    function getAriaLabel(selector) {
        const el = document.querySelector(selector);
        return el ? el.getAttribute('aria-label') : null;
    }
    
    // Сбор всех данных
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
        description: description,
        interests: [...document.querySelectorAll('.XFSXm_iw h5')]
            .filter(el => !/Была|км|см|Редко|Не курю|Не пью|Нет детей|Держу форму|Свободна/.test(el.textContent.trim()))
            .map(el => el.textContent.trim()),
        music: [...document.querySelectorAll('.otTddpCo h5')]
            .filter(el => !/Была|км|см|Редко/.test(el.textContent.trim()))
            .map(el => el.textContent.trim()),
        photos: photos
    };
    
    console.log(`✅ Собраны данные: ${profileData.name}, ${profileData.age} лет`);
    return profileData;
}

// Сохранение профиля в коллекцию
function saveProfile(profileData, action) {
    // Добавляем действие в данные профиля
    profileData.action = action;
    
    // Проверка на дубликаты
    const profileKey = `${profileData.name}_${profileData.age}_${profileData.distance}`;
    
    if (!collectedKeys.has(profileKey)) {
        collectedKeys.add(profileKey);
        collectedProfiles.push(profileData);
        console.log(`💾 Профиль сохранен (${collectedProfiles.length}/${MAX_PROFILES}): ${profileData.name} (${action})`);
        return true;
    } else {
        console.log(`⏭️ Дубликат пропущен: ${profileData.name}`);
        return false;
    }
}

// === КЛИКИ С СОХРАНЕНИЕМ ДАННЫХ ===

// Дизлайк с сохранением данных
function dislikeAndSave() {
    console.log('👎 Дизлайк с сохранением данных');
    
    // 1. Собираем данные
    const profileData = collectCurrentProfile();
    
    // 2. Кликаем дизлайк
    const buttons = document.querySelectorAll('.vkuiTappable__stateLayer');
    if (buttons.length > 0) {
        buttons[0].click();
        console.log('✅ Дизлайк поставлен');
        
        // 3. Сохраняем данные
        saveProfile(profileData, 'dislike');
        
        // 4. Ожидаем загрузки следующего профиля
        setTimeout(() => {
            console.log('➡️ Готов к следующему профилю');
        }, 300);
    } else {
        console.log('❌ Кнопка дизлайка не найдена');
    }
}

// Лайк с сохранением данных
function likeAndSave() {
    console.log('❤️ Лайк с сохранением данных');
    
    // 1. Собираем данные
    const profileData = collectCurrentProfile();
    
    // 2. Кликаем лайк
    const buttons = document.querySelectorAll('.vkuiTappable__stateLayer');
    if (buttons.length > 2) {
        buttons[2].click();
        console.log('✅ Лайк поставлен');
        
        // 3. Сохраняем данные
        saveProfile(profileData, 'like');
        
        // 4. Ожидаем загрузки следующего профиля
        setTimeout(() => {
            console.log('➡️ Готов к следующему профилю');
        }, 300);
    } else {
        console.log('❌ Кнопка лайка не найдена');
    }
}

// === АВТОМАТИЧЕСКИЕ РЕЖИМЫ С СОХРАНЕНИЕМ ===

// Автоматические дизлайки с сохранением
function startAutoDislikesWithSave() {
    console.log('🚀 Запуск автоматических дизлайков с сохранением данных');
    console.log(`⚙️ Настройки: интервал ${INTERVAL}мс, максимум ${MAX_PROFILES} профилей`);
    
    if (intervalId) {
        clearInterval(intervalId);
        console.log('⚠️ Остановлен предыдущий интервал');
    }
    
    intervalId = setInterval(() => {
        // Проверка лимита
        if (collectedProfiles.length >= MAX_PROFILES) {
            clearInterval(intervalId);
            console.log(`🎯 Достигнут лимит ${MAX_PROFILES} профилей. Останавливаюсь.`);
            downloadJSON();
            return;
        }
        
        dislikeAndSave();
    }, INTERVAL);
    
    console.log('✅ Автоматические дизлайки с сохранением запущены!');
}

// Автоматические лайки с сохранением
function startAutoLikesWithSave() {
    console.log('🚀 Запуск автоматических лайков с сохранением данных');
    console.log(`⚙️ Настройки: интервал ${INTERVAL}мс, максимум ${MAX_PROFILES} профилей`);
    
    if (intervalId) {
        clearInterval(intervalId);
        console.log('⚠️ Остановлен предыдущий интервал');
    }
    
    intervalId = setInterval(() => {
        // Проверка лимита
        if (collectedProfiles.length >= MAX_PROFILES) {
            clearInterval(intervalId);
            console.log(`🎯 Достигнут лимит ${MAX_PROFILES} профилей. Останавливаюсь.`);
            downloadJSON();
            return;
        }
        
        likeAndSave();
    }, INTERVAL);
    
    console.log('✅ Автоматические лайки с сохранением запущены!');
}

// Остановка автоматического режима
function stopAutoMode() {
    if (intervalId) {
        clearInterval(intervalId);
        console.log('🛑 Автоматический режим остановлен');
        console.log(`📊 Собрано профилей: ${collectedProfiles.length}`);
        downloadJSON();
    } else {
        console.log('⚠️ Автоматический режим не запущен');
    }
}

// === СОХРАНЕНИЕ ДАННЫХ ===

// Скачивание JSON файла
function downloadJSON() {
    console.log('💾 Сохранение данных в JSON...');
    
    try {
        // Статистика
        const likes = collectedProfiles.filter(p => p.action === 'like').length;
        const dislikes = collectedProfiles.filter(p => p.action === 'dislike').length;
        console.log(`📈 Статистика: ${likes} лайков, ${dislikes} дизлайков`);
        
        const data = JSON.stringify(collectedProfiles, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vk_dating_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Файл успешно сохранен!');
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
    }
}

// Показать собранные данные
function showCollectedData() {
    console.log('📊 СОБРАННЫЕ ДАННЫЕ:');
    console.log(`Количество профилей: ${collectedProfiles.length}`);
    
    if (collectedProfiles.length > 0) {
        console.log('Последние 5 профилей:');
        collectedProfiles.slice(-5).forEach((profile, i) => {
            console.log(`${i + 1}. ${profile.name}, ${profile.age} лет - ${profile.action}`);
        });
    }
}

// === ИНФОРМАЦИЯ В КОНСОЛЬ ===
console.log('\n📋 ===== VK DATING PARSER =====');
console.log('\n📚 ДОСТУПНЫЕ ФУНКЦИИ:');
console.log('\n=== РУЧНОЙ РЕЖИМ ===');
console.log('1. dislikeAndSave() - дизлайкнуть и сохранить данные');
console.log('2. likeAndSave() - лайкнуть и сохранить данные');
console.log('\n=== АВТОМАТИЧЕСКИЙ РЕЖИМ ===');
console.log('3. startAutoDislikesWithSave() - авто-дизлайки с сохранением');
console.log('4. startAutoLikesWithSave() - авто-лайки с сохранением');
console.log('5. stopAutoMode() - остановить авторежим');
console.log('\n=== РАБОТА С ДАННЫМИ ===');
console.log('6. showCollectedData() - показать собранные данные');
console.log('7. downloadJSON() - скачать JSON файл');
console.log('\n=== ПРЯМЫЕ КЛИКИ ===');
console.log('8. document.querySelectorAll(".vkuiTappable__stateLayer")[0].click() - дизлайк');
console.log('9. document.querySelectorAll(".vkuiTappable__stateLayer")[2].click() - лайк');
console.log('\n⚙️ Настройки:');
console.log(`   • Интервал: ${INTERVAL}мс`);
console.log(`   • Максимум профилей: ${MAX_PROFILES}`);
console.log(`   • Собрано: ${collectedProfiles.length} профилей`);
console.log('\n🚀 Для быстрого старта:');
console.log('   startAutoDislikesWithSave() - авто-дизлайки');
console.log('   startAutoLikesWithSave() - авто-лайки');
console.log('===========================================\n');

// Экспорт функций в глобальную область видимости
window.dislikeAndSave = dislikeAndSave;
window.likeAndSave = likeAndSave;
window.startAutoDislikesWithSave = startAutoDislikesWithSave;
window.startAutoLikesWithSave = startAutoLikesWithSave;
window.stopAutoMode = stopAutoMode;
window.showCollectedData = showCollectedData;
window.downloadJSON = downloadJSON;
window.collectedProfiles = collectedProfiles;
window.collectedKeys = collectedKeys;

// Проверка кнопок на странице
console.log('🔍 Проверка кнопок на странице...');
const buttons = document.querySelectorAll('.vkuiTappable__stateLayer');
console.log(`Найдено кнопок: ${buttons.length}`);
console.log('✅ Система готова к работе!');
