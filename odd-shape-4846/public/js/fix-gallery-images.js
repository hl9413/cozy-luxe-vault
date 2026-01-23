(function(){
  function setSrcFromData(img){
    try{
      if (img && img.dataset && img.dataset.src) {
        img.src = img.dataset.src;
      }
    } catch(e){}
  }

  function ensureImage(img){
    try{
      if(!img) return;
      if (/product\?id=/.test(img.src) || img.naturalWidth === 0) {
        setSrcFromData(img);
        if (/product\?id=/.test(img.src) || img.naturalWidth === 0) {
          img.src = 'https://placehold.co/600x600?text=Image';
        }
      }
      img.onerror = function(){
        this.onerror = null;
        this.src = '/images/default-placeholder.jpg';
      };
    } catch(e){}
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('img[data-src]').forEach(function(img){
      setSrcFromData(img);
      ensureImage(img);
    });

    document.querySelectorAll('#thumbs img, img.main-img, #mainImg').forEach(function(img){
      ensureImage(img);
    });

    var lb = document.getElementById('lbImg');
    if (lb) {
      var main = document.getElementById('mainImg') || document.querySelector('#thumbs img.active') || document.querySelector('#thumbs img');
      if (!lb.src || /product\?id=/.test(lb.src) || lb.naturalWidth === 0) {
        if (main) lb.src = (main.dataset && main.dataset.src) ? main.dataset.src : main.src;
        ensureImage(lb);
      }
      lb.onerror = function(){ lb.onerror = null; lb.src = '/images/default-placeholder.jpg'; };
    }

    document.querySelectorAll('img').forEach(function(img){
      img.addEventListener('error', function(){
        img.onerror = null;
        img.src = '/images/default-placeholder.jpg';
      });
    });
  }, false);
})();

