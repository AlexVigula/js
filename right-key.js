// Создаем событие keydown для стрелки вправо
const event = new KeyboardEvent('keydown', {
    key: 'ArrowRight',
    code: 'ArrowRight',
    keyCode: 39,
    which: 39,
    bubbles: true
});

// Отправляем событие на window (или нужный элемент)
window.dispatchEvent(event);
