(function() {
    // Запрет контекстного меню (правый клик)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Проверка, является ли элемент редактируемым (input, textarea)
    function isEditable(element) {
        const tagName = element.tagName;
        const isInput = tagName === 'INPUT' || tagName === 'TEXTAREA';
        const isContentEditable = element.contentEditable === 'true';
        return isInput || isContentEditable;
    }

    // Запрет выделения текста
    document.addEventListener('selectstart', function(e) {
        if (!isEditable(e.target)) {
            e.preventDefault();
            return false;
        }
    });

    // Запрет комбинаций клавиш
    document.addEventListener('keydown', function(e) {
        if (isEditable(e.target)) return;

        const key = e.keyCode || e.which;
        const isCtrlSAU = e.ctrlKey && (key === 83 || key === 65 || key === 85);
        
        if (isCtrlSAU) {
            e.preventDefault();
            return false;
        }
    });
})();
