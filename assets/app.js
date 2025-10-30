// Felles handlekurv (localStorage) + produktkatalog + modalhjelpere
(function(){
  const NOK = n => new Intl.NumberFormat('no-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(n);
  const $ = s => document.querySelector(s);

 // 10+ produkter
window.PRODUCTS = {
  'pi3': { id:'pi3', title:'Raspberry Pi 3', cat:'Linux', price:699,
    specs:['Quad-core 1.2 GHz','1GB RAM','Wi-Fi/Bluetooth'] },

  'pi4': { id:'pi4', title:'Raspberry Pi 4', cat:'Linux', price:999,
    specs:['Quad-core 1.5 GHz','4GB RAM','USB-C, 2×Micro-HDMI'] },

  'pi5': { id:'pi5', title:'Raspberry Pi 5 (8GB)', cat:'Linux', price:1499,
    specs:['Quad-core 2.4 GHz','8GB RAM','PCIe/VideoCore6'] },

  'case-pi4': { id:'case-pi4', title:'Raspberry Pi 4 Official Case', cat:'Linux', price:199,
    specs:['Offisiell case','Pi 4 kompatibel','Sort/grå'] },

  'case-pi5': { id:'case-pi5', title:'Raspberry Pi 5 Official Case', cat:'Linux', price:249,
    specs:['Offisiell case','Pi 5 kompatibel','Sort/grå'] },

  'ugreen-nas-sync': { id:'ugreen-nas-sync', title:'UGREEN NAS Sync', cat:'NAS', price:1199,
    specs:['Synk/backup','LAN','Lavt strømforbruk'] },

  'ssd-kingston-250': { id:'ssd-kingston-250', title:'Kingston SSD 250GB', cat:'Lagring', price:399,
    specs:['SATA','Les 500MB/s','Skriv 450MB/s'] },

  'ssd-kingston-500': { id:'ssd-kingston-500', title:'Kingston SSD 500GB', cat:'Lagring', price:549,
    specs:['SATA','Les 520MB/s','Skriv 500MB/s'] },

  'ssd-kingston-1tb': { id:'ssd-kingston-1tb', title:'Kingston SSD 1TB', cat:'Lagring', price:899,
    specs:['SATA','Les 520MB/s','Skriv 500MB/s'] },

  'hdd-2tb': { id:'hdd-2tb', title:'HDD 2TB 3.5"', cat:'Lagring', price:699,
    specs:['5400 RPM','SATA','64MB cache'] },

  'm2-500': { id:'m2-500', title:'M.2 NVMe 500GB', cat:'Lagring', price:599,
    specs:['PCIe 3.0 x4','Les 3000MB/s','Skriv 2000MB/s'] },

  'm2-1tb': { id:'m2-1tb', title:'M.2 NVMe 1TB', cat:'Lagring', price:999,
    specs:['PCIe 3.0 x4','Les 3200MB/s','Skriv 3000MB/s'] }
};


  // Cart storage
  const KEY='hs_cart_v2';
  const load = () => JSON.parse(localStorage.getItem(KEY)||'[]');
  const save = x => { localStorage.setItem(KEY, JSON.stringify(x)); updateCartBadge(); };
  function updateCartBadge(){ const c = load().reduce((a,b)=>a+b.qty,0); const el = $('#cartCount'); if(el) el.textContent=c; }

  // Public API
  window.addToCart = function(id){
    const items = load();
    const found = items.find(i=>i.id===id);
    if(found) found.qty++; else items.push({id, qty:1});
    save(items);
    openAddModal(id);
  };

  // Modal helpers
  function openAddModal(id){
    const product = window.PRODUCTS[id];
    const modal = $('#addModal');
    if(!modal) return alert('Lagt i handlekurv: '+product.title);
    $('#addModalTitle').textContent = product.title + ' lagt i handlekurv';
    modal.style.display='block';
  }
  window.closeAddModal = function(){ const m=$('#addModal'); if(m) m.style.display='none'; };

  // Cart rendering (cart.html)
  window.renderCart = function(){
    const wrap = $('#cartItems'); if(!wrap) return;
    const items = load();
    wrap.innerHTML=''; let subtotal=0;

    items.forEach(({id,qty})=>{
      const p = window.PRODUCTS[id]; if(!p) return;
      const li = document.createElement('div'); li.className='card item';
      const line = p.price*qty; subtotal+=line;
      li.innerHTML = `
        <div class='row'>
          <div><strong>${p.title}</strong><div class='muted'>${p.cat}</div></div>
          <button class='btn danger' data-remove='${p.id}'>Fjern</button>
        </div>
        <div class='row'>
          <label class='muted'>Antall</label>
          <input class='input' style='width:96px;text-align:center' type='number' min='1' value='${qty}' data-qty='${p.id}' />
        </div>
        <div class='row'><span class='muted'>Linje</span><strong>${NOK(line)}</strong></div>`;
      wrap.appendChild(li);
    });

    $('#subtotal').textContent = NOK(subtotal);
    const ship = parseInt($('#shipping').value||'0',10);
    $('#total').textContent = NOK(subtotal+ship);

    wrap.querySelectorAll('[data-remove]').forEach(b=> b.onclick=()=>{
      let x=load().filter(i=>i.id!==b.dataset.remove); save(x); window.renderCart();
    });
    wrap.querySelectorAll('[data-qty]').forEach(inp=> inp.onchange=()=>{
      let x=load(); const it=x.find(i=>i.id===inp.dataset.qty);
      if(it) it.qty=Math.max(1, parseInt(inp.value||'1',10)); save(x); window.renderCart();
    });
  };

  // DOM events
  document.addEventListener('DOMContentLoaded', ()=>{
    updateCartBadge();
    const close = $('#closeAdd'); if(close) close.addEventListener('click', window.closeAddModal);
    const cont = $('#continueShopping'); if(cont) cont.addEventListener('click', ()=>{ window.closeAddModal(); history.back(); });
    const gotocart = $('#gotoCart'); if(gotocart) gotocart.addEventListener('click', ()=>{ location.href = '/cart.html'; });
    const ship = $('#shipping'); if(ship) ship.addEventListener('change', window.renderCart);
    const chk = $('#checkoutBtn'); if(chk) chk.addEventListener('click', ()=>{
      const items = load(); if(!items.length){ alert('Handlekurven er tom.'); return; }
      localStorage.setItem('hs_last_order', JSON.stringify({when:Date.now(), items}));
      save([]); window.renderCart();
      const ok = $('#orderSuccess'); if(ok) ok.style.display='block';
    });
  });
})();
