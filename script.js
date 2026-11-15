"use strict";
const config = window.VAL_CONFIG || {};
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
const feedback = document.querySelector('#form-feedback');
const dateInput = document.querySelector('#date');
const serviceSelect = document.querySelector('#service');

function closeMenu() {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Abrir menú');
}
menuButton.addEventListener('click',()=>{
  const opened = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(opened));
  menuButton.setAttribute('aria-label',opened?'Cerrar menú':'Abrir menú');
});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu();});
document.querySelector('#year').textContent = new Date().getFullYear();

// Fecha local: no convertir a UTC para no correr un día en ciertas zonas horarias.
function localISODate(date) {
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
dateInput.min=localISODate(new Date());

// Tarjetas, filtros y selector de reserva generados desde config.js.
const services = Array.isArray(config.services) ? config.services : [];
const catalog = document.querySelector('#service-catalog');
const categoryLabels = {extensiones:'Extensiones y efectos',natural:'Realce natural',mantenimiento:'Mantenimiento',complementarios:'Belleza complementaria'};
const designs = ['✧','♡','✳','✦','❋','⌁','◌','✺','⌒','❀'];
services.forEach((entry,i)=>{
  if(!entry || typeof entry.name !== 'string') return;
  const card = document.createElement('article');
  card.className = 'service-card' + (i===0?' featured':'');
  card.dataset.category = entry.category || 'complementarios';
  const visual = document.createElement('div');
  visual.className = 'service-illustration';visual.setAttribute('aria-hidden','true');
  const glyph=document.createElement('span');glyph.textContent=designs[i%designs.length];visual.append(glyph);
  const tag=document.createElement('span');tag.className='service-tag';tag.textContent=categoryLabels[entry.category]||'Servicio';
  const title=document.createElement('h3');title.textContent=entry.name;
  const description=document.createElement('p');description.textContent=entry.description||'Consultá detalles de este servicio.';
  const details=document.createElement('p');details.className='service-meta';
  const parts=[entry.price,entry.duration].filter(v=>typeof v==='string'&&v.trim());
  details.textContent=parts.length?parts.join(' · '):'Precio y duración: consultar';
  const link=document.createElement('a');link.href='#reservar';link.textContent='Consultar cita ↗';
  link.addEventListener('click',()=>{serviceSelect.value=entry.id;});
  card.append(visual,tag,title,description,details,link);catalog.append(card);
  const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name;serviceSelect.append(option);
});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  const selected=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  catalog.querySelectorAll('.service-card').forEach(card=>{card.hidden=selected!=='all'&&card.dataset.category!==selected;});
}));
function setTextIfProvided(selector,value,prefix='') {
  const el=document.querySelector(selector);
  if(typeof value==='string' && value.trim()){el.textContent=prefix+value.trim();el.hidden=false;}
}
setTextIfProvided('#public-location',config.publicLocation,'Zona de atención: ');
setTextIfProvided('#opening-hours',config.openingHours,'Horario: ');
try{
  if(typeof config.instagram==='string' && config.instagram.trim()){
    const u=new URL(config.instagram.trim());
    if(u.protocol==='https:' && ['instagram.com','www.instagram.com'].includes(u.hostname)){
      const el=document.querySelector('#instagram-link');el.href=u.href;el.hidden=false;
    }
  }
}catch(_error){/* URL inválida: no se muestra el enlace. */}

const phone = String(config.whatsapp || '').replace(/\D/g,'');
const validPhone=/^\d{10,15}$/.test(phone);
if(!validPhone){
  const note=document.querySelector('#booking-setup-note');
  note.hidden=false;
  note.textContent='Reservas en preparación: pronto podrás enviar tu solicitud por WhatsApp. Por ahora, este formulario es una demostración.';
}

document.querySelector('#booking-form').addEventListener('submit',event=>{
  event.preventDefault();
  feedback.textContent='';
  if(!event.currentTarget.reportValidity())return;
  if(!validPhone){feedback.textContent='WhatsApp todavía no está configurado. Esta demostración no envía solicitudes.';return;}
  const service=services.find(item=>item.id===serviceSelect.value)?.name || serviceSelect.value;
  const date=dateInput.value;
  const time=document.querySelector('#time').value;
  const msg=document.querySelector('#message').value.trim();
  if(date < localISODate(new Date())){feedback.textContent='Seleccioná una fecha de hoy en adelante.';return;}
  const text=`¡Hola, Vale! Quisiera consultar disponibilidad para ${service}, el ${date} a las ${time}.${msg ? ` Consulta: ${msg}` : ''} Entiendo que la cita solo queda confirmada cuando me respondás.`;
  const url=`https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  feedback.textContent='Se abrirá WhatsApp con tu mensaje preparado. La cita todavía no está confirmada.';
  const win=window.open(url,'_blank','noopener,noreferrer');
  if(!win) window.location.assign(url);
});
