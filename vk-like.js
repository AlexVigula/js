function realClick(element) {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(event);
}

async function delayedAutoLike() {
  const elements = document.querySelectorAll('.vkuiTappable__stateLayer')[2];
  
  console.log('Найдено элементов:', elements.length);

  for (const el of elements) {
    realClick(el);
    console.log('Клик по элементу');
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

delayedAutoLike();
