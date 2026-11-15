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

// Precio y duración aparecen únicamente cuando Vale los confirma.
const services = Array.isArray(config.services) ? config.services : [];
const servicesByName = new Map(services.filter(s=>s && typeof s.id==='string').map(s=>[s.id,s]));
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{
  serviceSelect.value=link.dataset.service;
}));
document.querySelectorAll('[data-service-meta]').forEach(target=>{
  const entry=servicesByName.get(target.dataset.serviceMeta);
  const parts=[entry?.price,entry?.duration].filter(v=>typeof v==='string' && v.trim());
  if(parts.length){target.textContent=parts.join(' · ');target.hidden=false;}else{target.textContent='';target.hidden=true;}
});

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
  const service=serviceSelect.value;
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
