// Создаем событие keydown
const event = new KeyboardEvent('keydown', {
    key: 'ArrowLeft',
    code: 'ArrowLeft',
    keyCode: 37,
    which: 37,
    bubbles: true
});

// Отправляем событие на window (можно заменить на любой нужный элемент)
window.dispatchEvent(event);
