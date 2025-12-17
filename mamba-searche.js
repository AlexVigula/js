(function() {
    'use strict';
    
    // Конфигурация: CSS-селекторы для поиска данных (на основе вашего HTML)
    const SELECTORS = {
        PROFILE_CARD: 'a[data-name^="link-search-profile-action-"]',
        NAME: '[data-name="item-title-name"]',
        AGE: '[data-name="item-title-age"]',
        VERIFIED: '[data-name="status-verified"]',
        PHOTO: 'img[data-name="user-photo"]'
    };
    
    // Хранилище для собранных профилей (ID профиля -> данные)
    const profiles = new Map();
    
    // Функция для извлечения данных из одного карточки профиля
    function extractProfileData(cardElement) {
        try {
            // Извлекаем ссылку на профиль и ID
            const profileLink = cardElement.getAttribute('href');
            const profileId = profileLink.match(/\/profile\/(\d+)/)?.[1];
            if (!profileId) return null;
            
            // Формируем полный URL профиля
            const profileUrl = `https://www.mamba.ru${profileLink}`;
            
            // Ищем данные внутри карточки
            const nameElement = cardElement.querySelector(SELECTORS.NAME);
            const ageElement = cardElement.querySelector(SELECTORS.AGE);
            const verifiedElement = cardElement.querySelector(SELECTORS.VERIFIED);
            const photoElement = cardElement.querySelector(SELECTORS.PHOTO);
            
            // Собираем объект профиля
            const profile = {
                id: profileId,
                profile_url: `https://www.mamba.ru/profile/${profileId}`,
                name: nameElement?.textContent?.trim() || 'Неизвестно',
                age: ageElement?.textContent?.trim() || 'Неизвестно',
                verified: !!verifiedElement, // true, если элемент существует
                photo_url: photoElement?.getAttribute('src') || '',
                // Если нужны другие версии фото:
                // photo_small: photoElement?.getAttribute('srcset')?.split(',')[0] || '',
                // photo_large: photoElement?.getAttribute('srcset')?.split(',')[1]?.trim().split(' ')[0] || ''
            };
            
            return profile;
        } catch (error) {
            console.error('Ошибка при извлечении данных профиля:', error);
            return null;
        }
    }
    
    // Функция для сбора всех профилей на странице
    function collectAllProfiles() {
        const profileCards = document.querySelectorAll(SELECTORS.PROFILE_CARD);
        console.log(`Найдено карточек профилей: ${profileCards.length}`);
        
        let newCount = 0;
        
        profileCards.forEach(card => {
            const profile = extractProfileData(card);
            if (profile && !profiles.has(profile.id)) {
                profiles.set(profile.id, profile);
                newCount++;
            }
        });
        
        console.log(`Добавлено новых профилей: ${newCount}`);
        console.log(`Всего уникальных профилей: ${profiles.size}`);
        
        return Array.from(profiles.values());
    }
    
    // Функция для сохранения данных в JSON файл
    function saveToJsonFile() {
        const allProfiles = Array.from(profiles.values());
        
        const dataStr = JSON.stringify(allProfiles, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = `mamba_profiles_${Date.now()}.json`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log(`Сохранено ${allProfiles.length} профилей в файл: ${downloadLink.download}`);
        return allProfiles.length;
    }
    
    // Автоматический сбор при скролле (Intersection Observer)
    function setupAutoCollector() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Небольшая задержка для загрузки контента
                    setTimeout(() => {
                        const newProfiles = collectAllProfiles();
                        console.log(`Авто-сбор после скролла: найдено ${newProfiles.length} профилей`);
                    }, 500);
                }
            });
        }, {
            rootMargin: '100px' // Начинать загрузку заранее
        });
        
        // Наблюдаем за нижней частью страницы
        const sentinel = document.createElement('div');
        sentinel.id = 'scroll-sentinel';
        sentinel.style.height = '1px';
        document.body.appendChild(sentinel);
        observer.observe(sentinel);
        
        console.log('Автоматический сбор данных при скролле активирован');
        return observer;
    }
    
    // Создаем интерфейс в консоли
    console.clear();
    console.log('=== Mamba.ru Data Collector ===');
    console.log('Доступные команды:');
    console.log('1. window.collectProfiles() - собрать все профили на странице');
    console.log('2. window.saveData() - сохранить данные в JSON файл');
    console.log('3. window.startAutoCollect() - начать автосбор при скролле');
    console.log('4. window.stopAutoCollect() - остановить автосбор');
    console.log('5. window.viewData() - просмотреть собранные данные');
    console.log('================================');
    
    // Делаем функции глобально доступными
    window.collectProfiles = collectAllProfiles;
    window.saveData = saveToJsonFile;
    
    let autoCollector = null;
    window.startAutoCollect = function() {
        if (!autoCollector) {
            autoCollector = setupAutoCollector();
        }
    };
    
    window.stopAutoCollect = function() {
        if (autoCollector) {
            autoCollector.disconnect();
            const sentinel = document.getElementById('scroll-sentinel');
            if (sentinel) sentinel.remove();
            autoCollector = null;
            console.log('Автосбор остановлен');
        }
    };
    
    window.viewData = function() {
        console.log('Собранные профили:', Array.from(profiles.values()));
        console.log(`Всего профилей: ${profiles.size}`);
    };
    
    // Автоматически собираем профили при загрузке
    setTimeout(collectAllProfiles, 1000);
    
})();
