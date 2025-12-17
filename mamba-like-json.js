(function() {
    'use strict';
    
    // ========== КОНФИГУРАЦИЯ ==========
    const CONFIG = {
        LIKE_BUTTON_INDEX: 2,        // ТОЛЬКО третья кнопка (индекс 2)
        DELAY_BEFORE_LIKE: 500,      // Короткая задержка перед лайком
        DELAY_AFTER_LIKE: 500,       // Короткая задержка после лайка
        MAX_PROFILES: 50,            // Максимальное количество профилей
        CHECK_INTERVAL: 100,         // Проверять каждые 100мс (быстрее!)
        MAX_WAIT_TIME: 2000          // Максимальное время ожидания 2 секунды
    };
    
    // ========== СТАТУС ==========
    let isRunning = false;
    let stopRequested = false;
    let processedCount = 0;
    let allProfiles = [];
    
    // ========== СЕЛЕКТОРЫ ==========
    const SELECTORS = {
        LIKE_BUTTONS: '[data-name="like-action"]',
        PROFILE_CONTAINER: '.mlmor9m, [data-name^="profile-"]',
        
        // Основные данные
        NAME: '[data-name="item-title-name"]',
        AGE: '[data-name="item-title-age"]',
        VERIFIED: '[data-name="status-verified"]',
        
        // Фотографии
        PHOTOS: 'img[src*="mamba.ru"], picture source, picture img',
        
        // О себе
        DESCRIPTION: '[data-name="profile-greeting"]',
        
        // Цели знакомства
        GOALS: '[data-name="user-goal"] li',
        
        // Местоположение
        LOCATION: '[data-name="user-location"]',
        DISTANCE: '[data-name="user-distances"]',
        
        // Образование
        EDUCATION_TITLE: '[data-name="education-title-section"]',
        EDUCATION_ITEMS: '[data-name="education-title-section"] + ul li, [data-name="education-title-section"] ~ ul li',
        
        // Интересы
        INTERESTS_TITLE: '[data-name="tags-title-section"]',
        INTERESTS: '[data-name^="test-"] span, .p18gzp32 span',
        
        // Языки
        LANGUAGES: '[data-name="known-languages"]',
        
        // Образ жизни
        LIFESTYLE_TITLE: '[data-name="life-style-title-section"]',
        LIFESTYLE: '[data-name="life-style-list"] li',
        
        // Внешность
        APPEARANCE: '[data-name="appearance"]',
        HEIGHT: '[data-name="height"]',
        WEIGHT: '[data-name="weight"]',
        CONSTITUTION: '[data-name="constitution"]',
        
        // Знак зодиака
        ZODIAC_TITLE: '[data-name="horoscope-sign-title-section"]',
        ZODIAC: '[data-name="text-zodiac-sign"]',
        
        // Путешествия
        TRAVEL_TITLE: '[data-name="travel-title-section"]',
        TRAVEL: '[data-name="travel-list"] li'
    };
    
    // ========== ФУНКЦИЯ СБОРА ДАННЫХ ==========
    function collectProfileData() {
        const data = {
            id: null,
            profile_url: null,
            collected_at: new Date().toISOString(),
            index: processedCount + 1,
            basic_info: {},
            photos: [],
            goals: [],
            interests: [],
            lifestyle: {},
            appearance: {},
            education: [],
            languages: '',
            zodiac: '',
            travel: [],
            additional: {}
        };
        
        try {
            // 1. Основные данные
            const nameEl = document.querySelector(SELECTORS.NAME);
            const ageEl = document.querySelector(SELECTORS.AGE);
            
            data.basic_info = {
                name: nameEl?.textContent?.trim() || 'Неизвестно',
                age: ageEl?.textContent?.trim() || '?',
                verified: !!document.querySelector(SELECTORS.VERIFIED),
                location: document.querySelector(SELECTORS.LOCATION)?.textContent?.trim() || '',
                distance: document.querySelector(SELECTORS.DISTANCE)?.textContent?.trim() || '',
                description: document.querySelector(SELECTORS.DESCRIPTION)?.textContent?.trim() || ''
            };
            
            // 2. Цели знакомства
            const goalElements = document.querySelectorAll(SELECTORS.GOALS);
            data.goals = Array.from(goalElements).map(el => 
                el.textContent?.trim() || el.querySelector('p')?.textContent?.trim()
            ).filter(Boolean);
            
            // 3. Интересы
            const interestElements = document.querySelectorAll(SELECTORS.INTERESTS);
            data.interests = Array.from(interestElements).map(el => 
                el.textContent?.trim()
            ).filter(Boolean);
            
            // 4. Образование
            const educationElements = document.querySelectorAll(SELECTORS.EDUCATION_ITEMS);
            data.education = Array.from(educationElements).map(el => 
                el.textContent?.trim()
            ).filter(Boolean);
            
            // 5. Языки
            data.languages = document.querySelector(SELECTORS.LANGUAGES)?.textContent?.trim() || '';
            
            // 6. Образ жизни
            const lifestyleElements = document.querySelectorAll(SELECTORS.LIFESTYLE);
            lifestyleElements.forEach(el => {
                const key = el.querySelector('[data-name]')?.getAttribute('data-name');
                const value = el.textContent?.trim() || el.querySelector('p')?.textContent?.trim();
                if (key && value) {
                    data.lifestyle[key] = value;
                }
            });
            
            // 7. Внешность
            data.appearance = {
                type: document.querySelector(SELECTORS.APPEARANCE)?.textContent?.trim() || '',
                height: document.querySelector(SELECTORS.HEIGHT)?.textContent?.trim() || '',
                weight: document.querySelector(SELECTORS.WEIGHT)?.textContent?.trim() || '',
                constitution: document.querySelector(SELECTORS.CONSTITUTION)?.textContent?.trim() || ''
            };
            
            // 8. Знак зодиака
            data.zodiac = document.querySelector(SELECTORS.ZODIAC)?.textContent?.trim() || '';
            
            // 9. Путешествия
            const travelElements = document.querySelectorAll(SELECTORS.TRAVEL);
            data.travel = Array.from(travelElements).map(el => {
                const country = el.getAttribute('data-name')?.replace('country-', '') || '';
                const img = el.querySelector('img');
                return {
                    country_code: country,
                    flag_url: img?.src || ''
                };
            }).filter(item => item.country_code);
            
            // 10. Кнопки лайка
            const likeButtons = document.querySelectorAll(SELECTORS.LIKE_BUTTONS);
            data.like_buttons_count = likeButtons.length;
            
            console.log(`✅ Данные собраны: ${data.basic_info.name}, ${data.basic_info.age} лет`);
            console.log(`   🎯 ${data.goals.length} целей | 🎨 ${data.interests.length} интересов`);
            if (data.zodiac) console.log(`   ♈ ${data.zodiac}`);
            
            return data;
            
        } catch (error) {
            console.error('❌ Ошибка при сборе данных:', error);
            return null;
        }
    }
    
    // ========== ФУНКЦИЯ ЛАЙКИНГА ==========
    async function likeWithThirdButton() {
        console.log('❤️  Ставлю лайк через 3-ю кнопку...');
        
        const likeButtons = document.querySelectorAll(SELECTORS.LIKE_BUTTONS);
        
        if (likeButtons.length <= CONFIG.LIKE_BUTTON_INDEX) {
            console.log(`❌ Нет кнопки с индексом ${CONFIG.LIKE_BUTTON_INDEX}`);
            return false;
        }
        
        const thirdButton = likeButtons[CONFIG.LIKE_BUTTON_INDEX];
        
        // Короткая задержка
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BEFORE_LIKE));
        
        // Кликаем
        thirdButton.click();
        
        // Дополнительное событие для надежности
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        thirdButton.dispatchEvent(event);
        
        console.log('✅ Лайк поставлен');
        return true;
    }
    
    // ========== ФУНКЦИЯ ОЖИДАНИЯ НОВОГО ПРОФИЛЯ ==========
    async function waitForNewProfile() {
        console.log('🔄 Ожидаю новый профиль...');
        
        const startTime = Date.now();
        const maxWaitTime = CONFIG.MAX_WAIT_TIME;
        
        // Запоминаем текущее состояние
        const initialName = document.querySelector(SELECTORS.NAME)?.textContent?.trim() || '';
        const initialAge = document.querySelector(SELECTORS.AGE)?.textContent?.trim() || '';
        
        console.log(`   Текущий: ${initialName}, ${initialAge}`);
        
        while (Date.now() - startTime < maxWaitTime) {
            // Проверяем часто (каждые 100мс)
            await new Promise(resolve => setTimeout(resolve, CONFIG.CHECK_INTERVAL));
            
            const currentName = document.querySelector(SELECTORS.NAME)?.textContent?.trim() || '';
            const currentAge = document.querySelector(SELECTORS.AGE)?.textContent?.trim() || '';
            
            // Если профиль изменился
            if (currentName && currentName !== initialName) {
                console.log(`✅ Новый профиль: ${currentName}, ${currentAge}`);
                return true;
            }
        }
        
        console.log('⏰ Время ожидания истекло');
        return false;
    }
    
    // ========== ОСНОВНАЯ ФУНКЦИЯ ==========
    async function processSingleProfile() {
        try {
            console.log(`\n🎯 === ПРОФИЛЬ ${processedCount + 1} ===`);
            
            // 1. Собираем данные
            const profileData = collectProfileData();
            if (!profileData) {
                console.log('❌ Не удалось собрать данные');
                return false;
            }
            
            // 2. Ставим лайк
            const liked = await likeWithThirdButton();
            if (!liked) {
                console.log('❌ Не удалось поставить лайк');
                return false;
            }
            
            // 3. Обновляем данные
            profileData.liked = true;
            profileData.liked_at = new Date().toISOString();
            profileData.like_button_index = CONFIG.LIKE_BUTTON_INDEX;
            
            // 4. Сохраняем
            allProfiles.push(profileData);
            processedCount++;
            
            console.log(`📈 Прогресс: ${processedCount}/${CONFIG.MAX_PROFILES}`);
            
            // 5. Короткая пауза после лайка
            await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_AFTER_LIKE));
            
            // 6. Ждем новый профиль
            const newProfile = await waitForNewProfile();
            
            if (!newProfile) {
                // Проверяем, может профиль уже сменился
                const currentName = document.querySelector(SELECTORS.NAME)?.textContent?.trim() || '';
                if (currentName && currentName !== profileData.basic_info.name) {
                    console.log(`📝 Профиль сменился на: ${currentName}`);
                    return true;
                }
                
                console.log('⚠️  Новый профиль не появился, но продолжаем...');
                // Продолжаем в любом случае
                return true;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Ошибка:', error);
            return false;
        }
    }
    
    // ========== АВТОМАТИЧЕСКИЙ ЦИКЛ ==========
    async function startAutoLike() {
        if (isRunning) {
            console.log('⚠️  Уже запущено');
            return;
        }
        
        isRunning = true;
        stopRequested = false;
        
        console.log('🚀 ЗАПУСК АВТОЛАЙКИНГА');
        console.log(`🎯 Цель: ${CONFIG.MAX_PROFILES} профилей`);
        console.log(`⚡ Быстрая проверка (каждые ${CONFIG.CHECK_INTERVAL}мс)`);
        
        let failedAttempts = 0;
        const maxFailedAttempts = 3;
        
        while (isRunning && 
               !stopRequested && 
               processedCount < CONFIG.MAX_PROFILES &&
               failedAttempts < maxFailedAttempts) {
            
            const success = await processSingleProfile();
            
            if (!success) {
                failedAttempts++;
                console.log(`⚠️  Неудачная попытка (${failedAttempts}/${maxFailedAttempts})`);
                
                // Короткая пауза перед повторной попыткой
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                failedAttempts = 0; // Сбрасываем счетчик при успехе
            }
            
            // Короткая пауза между профилями
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        isRunning = false;
        
        console.log(`\n✅ ЗАВЕРШЕНО`);
        console.log(`📊 Обработано: ${processedCount} профилей`);
        
        if (allProfiles.length > 0) {
            saveToJsonFile();
        }
    }
    
    // ========== ФУНКЦИИ СОХРАНЕНИЯ ==========
    function saveToJsonFile() {
        const fullData = {
            metadata: {
                collection_date: new Date().toISOString(),
                total_profiles: allProfiles.length,
                liked_profiles: allProfiles.filter(p => p.liked).length,
                like_button_used: CONFIG.LIKE_BUTTON_INDEX
            },
            profiles: allProfiles
        };
        
        const dataStr = JSON.stringify(fullData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = `mamba_autolike_${Date.now()}.json`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log(`💾 Сохранено: ${downloadLink.download}`);
    }
    
    // ========== ИНТЕРФЕЙС КОНСОЛИ ==========
    function setupConsole() {
        console.clear();
        console.log('=========================================');
        console.log('⚡ МГНОВЕННЫЙ АВТОЛАЙКЕР MAMBA.RU');
        console.log('=========================================');
        console.log('');
        console.log('🔥 ОСОБЕННОСТИ:');
        console.log('• Лайк через 3-ю кнопку (индекс 2)');
        console.log('• Быстрая проверка новых профилей');
        console.log('• Сбор ВСЕХ данных профиля');
        console.log('• Нет прокрутки - только лайки');
        console.log('');
        console.log('🚀 КОМАНДЫ:');
        console.log('');
        console.log('start()       - запустить автолайкинг');
        console.log('stop()        - остановить');
        console.log('test()        - тестовый лайк');
        console.log('collect()     - собрать данные');
        console.log('show()        - показать данные');
        console.log('save()        - сохранить в JSON');
        console.log('');
        console.log('=========================================');
        
        // Проверяем текущий профиль
        const name = document.querySelector(SELECTORS.NAME)?.textContent?.trim();
        const age = document.querySelector(SELECTORS.AGE)?.textContent?.trim();
        const buttons = document.querySelectorAll(SELECTORS.LIKE_BUTTONS);
        
        console.log(`\n🔍 Текущий профиль: ${name || '?'}, ${age || '?'} лет`);
        console.log(`🎯 Кнопок лайка: ${buttons.length}`);
        
        if (buttons.length > CONFIG.LIKE_BUTTON_INDEX) {
            console.log(`✅ Будет использована кнопка [${CONFIG.LIKE_BUTTON_INDEX}]`);
        }
    }
    
    // ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========
    window.start = function() {
        startAutoLike().catch(console.error);
    };
    
    window.stop = function() {
        stopRequested = true;
        console.log('🛑 Остановка...');
    };
    
    window.test = async function() {
        console.log('🧪 Тестовый лайк...');
        
        const buttons = document.querySelectorAll(SELECTORS.LIKE_BUTTONS);
        if (buttons.length <= CONFIG.LIKE_BUTTON_INDEX) {
            console.log('❌ Нет нужной кнопки');
            return;
        }
        
        const nameBefore = document.querySelector(SELECTORS.NAME)?.textContent?.trim();
        
        // Кликаем
        buttons[CONFIG.LIKE_BUTTON_INDEX].click();
        
        // Ждем 500мс и проверяем
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const nameAfter = document.querySelector(SELECTORS.NAME)?.textContent?.trim();
        
        if (nameAfter && nameAfter !== nameBefore) {
            console.log(`✅ Успех! Новый профиль: ${nameAfter}`);
        } else {
            console.log('⚠️  Профиль не изменился');
        }
    };
    
    window.collect = function() {
        const data = collectProfileData();
        if (data) {
            console.log('📊 Данные:');
            console.log(`   Имя: ${data.basic_info.name}`);
            console.log(`   Возраст: ${data.basic_info.age}`);
            console.log(`   Цели: ${data.goals.length} шт.`);
            console.log(`   Интересы: ${data.interests.length} шт.`);
            if (data.zodiac) console.log(`   Знак зодиака: ${data.zodiac}`);
        }
        return data;
    };
    
    window.show = function() {
        const data = collectProfileData();
        if (!data) return;
        
        console.log('📋 ПОЛНЫЕ ДАННЫЕ:');
        console.log(`👤 ${data.basic_info.name}, ${data.basic_info.age} лет`);
        if (data.basic_info.verified) console.log(`✅ Верифицирован`);
        if (data.basic_info.location) console.log(`📍 ${data.basic_info.location}`);
        if (data.basic_info.distance) console.log(`📏 ${data.basic_info.distance}`);
        
        if (data.goals.length > 0) {
            console.log(`🎯 Цели (${data.goals.length}):`);
            data.goals.forEach((goal, i) => console.log(`   ${i+1}. ${goal}`));
        }
        
        if (data.interests.length > 0) {
            console.log(`🎨 Интересы (${data.interests.length}):`);
            data.interests.slice(0, 10).forEach((interest, i) => 
                console.log(`   ${i+1}. ${interest}`));
            if (data.interests.length > 10) {
                console.log(`   ... и еще ${data.interests.length - 10}`);
            }
        }
        
        if (data.zodiac) console.log(`♈ Знак зодиака: ${data.zodiac}`);
        if (data.languages) console.log(`🗣️ Языки: ${data.languages}`);
        if (data.education.length > 0) console.log(`🎓 Образование: ${data.education.join(', ')}`);
        
        if (Object.keys(data.lifestyle).length > 0) {
            console.log('🏠 Образ жизни:');
            Object.entries(data.lifestyle).forEach(([key, value]) => {
                console.log(`   • ${key}: ${value}`);
            });
        }
    };
    
    window.save = function() {
        if (allProfiles.length === 0) {
            console.log('❌ Нет данных');
            return;
        }
        saveToJsonFile();
    };
    
    // ========== ЗАПУСК ==========
    setTimeout(setupConsole, 500);
    
})();
