<!-- Yandex.Metrika counter -->
<script type="text/javascript">
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date(); k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  fetch('https://api.ipify.org?format=json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      // 3. Инициализируем Метрику С IP
      ym(17983693, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true, 
        ecommerce: "dataLayer",
        params: {                
          ip: data.ip
        },
        defer: true
      });
    })
    .catch(error => {
      ym(17983693, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        ecommerce: "dataLayer",
        defer: true
      });
    });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/17983693" style="position:absolute; left:-9999px;" alt="Европром" /></div></noscript>
<!-- /Yandex.Metrika counter -->
