// Функция для имитации нажатия стрелки вправо
function simulateArrowRight() {
    const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        code: 'ArrowRight',
        keyCode: 39,
        which: 39,
        bubbles: true
    });
    window.dispatchEvent(event);
}

// Запускаем цикл с интервалом (например, каждые 100 мс)
const intervalId = setInterval(simulateArrowRight, 100);

// Чтобы остановить цикл позже, сохрани ссылку на intervalId и вызови:
// clearInterval(intervalId);
