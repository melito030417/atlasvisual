(function () {
  if (window.__atlasMetaPixelStarted) return;
  window.__atlasMetaPixelStarted = true;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
  n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
  s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', '1499422985335955');
  window.fbq('track', 'PageView');

  // Only the actual checkout link starts checkout; section shortcuts do not.
  document.addEventListener('click', function (event) {
    var link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.href !== 'https://pay.hotmart.com/R108310393S') return;
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Atlas Visual Doces e Sobremesas',
      content_type: 'product',
      content_ids: ['atlas-visual-natal'],
      num_items: 1,
      value: 37.00,
      currency: 'BRL'
    });
  });
})();
