(function(){
const ICON_STROKE = 'fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"';

  const EVENT_TYPES = [
    {id:'infantil',    label:'Cumpleaños infantiles',
      svg:`<svg viewBox="0 0 24 24" ${ICON_STROKE}><path d="M4 21v-6.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V21"/><path d="M4 21h16"/><path d="M4 17.2c1.2-1 2.8-1 4 0s2.8 1 4 0 2.8-1 4 0 2.8 1 4 0"/><line x1="12" y1="12.5" x2="12" y2="8.8"/><path d="M12 8.8c-1.1-1-1.1-2.1 0-3.1 1.1 1 1.1 2.1 0 3.1z"/></svg>`},
    {id:'adulto',      label:'Cumpleaños de adultos',
      svg:`<svg viewBox="0 0 24 24" ${ICON_STROKE}><path d="M7.2 3h3.6l-.5 5.3a1.3 1.3 0 0 1-1.3 1.2h0a1.3 1.3 0 0 1-1.3-1.2z"/><line x1="9" y1="9.5" x2="9" y2="20"/><line x1="6.2" y1="20" x2="11.8" y2="20"/><path d="M14.6 5.2h3.6l-.5 4.6a1.2 1.2 0 0 1-1.2 1.1h0a1.2 1.2 0 0 1-1.2-1.1z"/><line x1="16.4" y1="10.9" x2="16.4" y2="17"/><line x1="14.2" y1="17" x2="18.6" y2="17"/></svg>`},
    {id:'xv',          label:'Quinceaños',
      svg:`<svg viewBox="0 0 24 24" ${ICON_STROKE}><path d="M4 17.5 2.7 9.3 7.8 12.6 12 6.3l4.2 6.3 5.1-3.3-1.3 8.2z"/><line x1="4" y1="17.5" x2="20" y2="17.5"/><circle cx="12" cy="4.6" r="0.9" fill="currentColor" stroke="none"/></svg>`},
    {id:'boda',        label:'Bodas',
      svg:`<svg viewBox="0 0 24 24" ${ICON_STROKE}><circle cx="8.8" cy="14.2" r="4.3"/><circle cx="15.2" cy="14.2" r="4.3"/></svg>`},
    {id:'social',      label:'Eventos sociales',
      svg:`<svg viewBox="0 0 24 24" ${ICON_STROKE}><path d="M12 3.2v4.4M12 16.4v4.4M3.2 12h4.4M16.4 12h4.4M5.9 5.9l3.1 3.1M15 15l3.1 3.1M18.1 5.9 15 9M9 15l-3.1 3.1"/></svg>`},
    {id:'empresarial', label:'Eventos empresariales',
      svg:`<svg viewBox="0 0 24 24" ${ICON_STROKE}><rect x="5" y="3.5" width="14" height="17" rx="1"/><line x1="8.6" y1="7.5" x2="8.6" y2="7.51"/><line x1="12" y1="7.5" x2="12" y2="7.51"/><line x1="15.4" y1="7.5" x2="15.4" y2="7.51"/><line x1="8.6" y1="11" x2="8.6" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="15.4" y1="11" x2="15.4" y2="11.01"/><line x1="8.6" y1="14.5" x2="8.6" y2="14.51"/><line x1="15.4" y1="14.5" x2="15.4" y2="14.51"/><line x1="10.2" y1="20.5" x2="10.2" y2="17.3"/><line x1="13.8" y1="20.5" x2="13.8" y2="17.3"/></svg>`},
  ];

  const SERVICES = [
    {id:'decoracion', name:'Decoración y ambientación'},
    {id:'catering',   name:'Catering / gastronomía', sub:'precio sugerido por persona'},
    {id:'dj',         name:'DJ / música en vivo'},
    {id:'bebidas',    name:'Bebidas', sub:'precio sugerido por persona'},
    {id:'animacion',  name:'Animación'},
    {id:'fotografia', name:'Fotografía y video'},
    {id:'salon',      name:'Salón / locación'},
    {id:'torta',      name:'Torta / mesa dulce'},
  ];

  let selectedType = null;
  let currency = 'PYG';
  let extraCount = 0;

  const $ = (id) => document.getElementById(id);

  /* ---------- Build event type chips ---------- */
  const typeGrid = $('typeGrid');
  EVENT_TYPES.forEach(t=>{
    const el = document.createElement('div');
    el.className = 'type-chip';
    el.setAttribute('tabindex','0');
    el.setAttribute('role','button');
    el.dataset.id = t.id;
    el.innerHTML = `<span class="icon">${t.svg}</span><span>${t.label}</span>`;
    el.addEventListener('click', ()=> selectType(t.id));
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selectType(t.id); }});
    typeGrid.appendChild(el);
  });

  function selectType(id){
    selectedType = id;
    document.querySelectorAll('.type-chip').forEach(c=>{
      c.classList.toggle('selected', c.dataset.id === id);
    });
    recalc();
  }

  /* ---------- Build services rows ---------- */
  const servicesList = $('servicesList');
  SERVICES.forEach(s=>{
    const row = document.createElement('div');
    row.className = 'service-row';
    row.innerHTML = `
      <input type="checkbox" id="chk_${s.id}" data-role="service-check">
      <span class="name">${s.name}${s.sub? `<span class="sub">${s.sub}</span>`:''}</span>
      <input type="number" min="0" step="0.01" placeholder="0" id="price_${s.id}" data-role="service-price">
      <input type="number" min="0" step="1" value="1" id="qty_${s.id}" data-role="service-qty">
    `;
    servicesList.appendChild(row);
  });

  /* ---------- Extra concepts ---------- */
  const extrasList = $('extrasList');
  function addExtraRow(){
    extraCount++;
    const rowId = 'extra_' + extraCount;
    const row = document.createElement('div');
    row.className = 'extra-row';
    row.id = rowId;
    row.innerHTML = `
      <input type="text" placeholder="Ej: Transporte, seguridad, alquiler de sillas..." data-role="extra-name">
      <input type="number" min="0" step="0.01" placeholder="0" data-role="extra-price">
      <button type="button" class="remove-btn" aria-label="Quitar concepto">×</button>
    `;
    row.querySelector('.remove-btn').addEventListener('click', ()=>{
      row.remove();
      recalc();
    });
    extrasList.appendChild(row);
  }
  $('addExtraBtn').addEventListener('click', addExtraRow);
  addExtraRow(); // start with one empty row

  /* ---------- Cover image upload ---------- */
  $('coverInput').addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const dataUrl = ev.target.result;
      $('coverDrop').style.backgroundImage = `url('${dataUrl}')`;
      $('coverDrop').classList.add('has-image');
      $('pvBannerImg').src = dataUrl;
      $('pvBanner').style.display = 'block';
      $('removeCoverBtn').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
  });
  $('removeCoverBtn').addEventListener('click', ()=>{
    $('coverInput').value = '';
    $('coverDrop').style.backgroundImage = '';
    $('coverDrop').classList.remove('has-image');
    $('pvBannerImg').src = '';
    $('pvBanner').style.display = 'none';
    $('removeCoverBtn').style.display = 'none';
  });

  /* ---------- Currency toggle ---------- */
  $('currencyToggle').addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    currency = btn.dataset.cur;
    document.querySelectorAll('#currencyToggle button').forEach(b=> b.classList.toggle('active', b===btn));
    recalc();
  });

  function fmt(n){
    if(!isFinite(n)) n = 0;
    if(currency === 'USD'){
      return 'US$ ' + n.toLocaleString('es-PY', {minimumFractionDigits:2, maximumFractionDigits:2});
    }
    return 'Gs. ' + Math.round(n).toLocaleString('es-PY');
  }

  /* ---------- Brand name sync ---------- */
  $('bizName').addEventListener('input', ()=>{
    const name = $('bizName').value || 'Tu empresa';
    $('pvBiz').textContent = name;
    $('pvSigBiz').textContent = 'Firma y aclaración — ' + name;
  });
  $('bizTagline').addEventListener('input', ()=>{
    $('pvTagline').textContent = $('bizTagline').value.trim();
  });

  /* ---------- Quote number (estable durante la sesión) ---------- */
  const quoteNo = (()=>{
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    const rand = Math.floor(100 + Math.random()*900);
    return `N.° ${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${rand}`;
  })();
  $('pvQuoteNo').textContent = quoteNo;

  /* ---------- Recalculation ---------- */
  function recalc(){
    // event type
    const typeObj = EVENT_TYPES.find(t=>t.id===selectedType);
    $('pvType').textContent = typeObj ? typeObj.label : 'Presupuesto de evento';

    // issued date
    const today = new Date();
    $('pvIssued').textContent = 'Emitido el ' + today.toLocaleDateString('es-PY', {day:'2-digit', month:'long', year:'numeric'});

    // meta block
    const client = $('clientName').value.trim();
    const phone = $('clientPhone').value.trim();
    const guests = $('guestCount').value.trim();
    const date = $('eventDate').value;
    const place = $('eventPlace').value.trim();
    const validUntil = $('validUntil').value;

    const metaRows = [];
    if(client) metaRows.push(['Cliente', client]);
    if(phone) metaRows.push(['Teléfono', phone]);
    if(date) metaRows.push(['Fecha del evento', formatDate(date)]);
    if(place) metaRows.push(['Lugar', place]);
    if(guests) metaRows.push(['Invitados', guests]);
    if(validUntil) metaRows.push(['Válido hasta', formatDate(validUntil)]);
    $('pvMeta').innerHTML = metaRows.length
      ? metaRows.map(([k,v])=>`<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')
      : `<div class="empty-note">Completá los datos del cliente para verlos aquí.</div>`;

    // items table (servicios + conceptos adicionales)
    let servicesSubtotal = 0;
    const rows = [];
    SERVICES.forEach(s=>{
      const checked = $('chk_'+s.id).checked;
      if(!checked) return;
      const price = parseFloat($('price_'+s.id).value) || 0;
      const qty = parseFloat($('qty_'+s.id).value) || 0;
      const line = price*qty;
      servicesSubtotal += line;
      rows.push(`<div class="item-row"><span class="name">${s.name}</span><span class="qty">${qty}</span><span class="unit">${fmt(price)}</span><span class="sub">${fmt(line)}</span></div>`);
    });
    if(!rows.length){
      rows.push(`<div class="empty-note">Sin servicios seleccionados.</div>`);
    }

    let extrasSubtotal = 0;
    const extraRows = [];
    document.querySelectorAll('.extra-row').forEach(row=>{
      const name = row.querySelector('[data-role="extra-name"]').value.trim();
      const price = parseFloat(row.querySelector('[data-role="extra-price"]').value) || 0;
      if(!name && !price) return;
      extrasSubtotal += price;
      extraRows.push(`<div class="item-row"><span class="name">${name || 'Concepto adicional'}</span><span class="qty">1</span><span class="unit">${fmt(price)}</span><span class="sub">${fmt(price)}</span></div>`);
    });
    if(extraRows.length){
      rows.push(`<div class="group-label">Conceptos adicionales</div>`);
      rows.push(...extraRows);
    }
    $('pvItems').innerHTML = rows.join('');

    // totals
    const subtotal = servicesSubtotal + extrasSubtotal;
    const discountPct = Math.min(100, Math.max(0, parseFloat($('discountPct').value) || 0));
    const discountAmt = subtotal * (discountPct/100);
    const total = subtotal - discountAmt;
    const depositPct = Math.min(100, Math.max(0, parseFloat($('depositPct').value) || 0));
    const depositAmt = total * (depositPct/100);

    $('pvSubtotal').textContent = fmt(subtotal);
    if(discountPct > 0){
      $('pvDiscountRow').style.display = 'flex';
      $('pvDiscount').textContent = '− ' + fmt(discountAmt) + ` (${discountPct}%)`;
    } else {
      $('pvDiscountRow').style.display = 'none';
    }
    $('pvTotal').textContent = fmt(total);
    $('mobTotal').textContent = fmt(total);

    if(depositPct > 0 && total > 0){
      $('pvDepositRow').style.display = 'flex';
      $('pvDeposit').textContent = fmt(depositAmt) + ` (${depositPct}%)`;
    } else {
      $('pvDepositRow').style.display = 'none';
    }

    // observations
    const obs = $('observations').value.trim();
    if(obs){
      $('pvObsBlock').style.display = 'block';
      $('pvObs').textContent = obs;
    } else {
      $('pvObsBlock').style.display = 'none';
    }
  }

  function formatDate(isoStr){
    const d = new Date(isoStr + 'T00:00:00');
    if(isNaN(d)) return isoStr;
    return d.toLocaleDateString('es-PY', {day:'2-digit', month:'long', year:'numeric'});
  }

  /* ---------- Listeners ---------- */
  document.getElementById('layout').addEventListener('input', recalc);
  document.getElementById('layout').addEventListener('change', recalc);

  $('printBtn').addEventListener('click', ()=> window.print());
  $('mobPrintBtn').addEventListener('click', ()=> window.print());

  // initial render
  recalc();
})();
