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
  const base=typeof entry.price==='string'?entry.price.trim():'';
  const duration=typeof entry.duration==='string'?entry.duration.trim():'';
  details.textContent=[base?'Precio base: '+base:'Precio base: por confirmar',duration?'Duración: '+duration:''].filter(Boolean).join(' · ');
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
const homeFields=document.querySelector('#home-fields');
const districtInput=document.querySelector('#district');
const modalityInputs=Array.from(document.querySelectorAll('input[name="modality"]'));
const selectedModality=()=>modalityInputs.find(input=>input.checked)?.value || 'estudio';
function refreshModality(){
  const home=selectedModality()==='domicilio';
  homeFields.hidden=!home;
  districtInput.required=home;
  if(!home) districtInput.value='';
  refreshQuote();
}
function refreshQuote(){
  const selected=services.find(item=>item.id===serviceSelect.value);
  const base=typeof selected?.price==='string'?selected.price.trim():'';
  const baseLabel=document.querySelector('#quote-base');
  const travelLabel=document.querySelector('#quote-travel');
  baseLabel.textContent=selected?(base?'Precio base de '+selected.name+': '+base:'Precio base de '+selected.name+': por confirmar'):'Seleccioná un servicio para consultar su precio base.';
  const home=selectedModality()==='domicilio';
  travelLabel.textContent=home?'A domicilio: el costo de traslado se cotiza según zona o distancia'+(districtInput.value.trim()?' ('+districtInput.value.trim()+')':'')+'.':'En el estudio: sin recargo de traslado a domicilio; total sujeto a confirmación.';
}
serviceSelect.addEventListener('change',refreshQuote);
districtInput.addEventListener('input',refreshQuote);
modalityInputs.forEach(input=>input.addEventListener('change',refreshModality));
refreshModality();
if(!validPhone){
  const note=document.querySelector('#booking-setup-note');
  note.hidden=false;
  note.textContent='Las consultas por WhatsApp todavía no están habilitadas. Este formulario es una vista de demostración.';
}
// Revisión de datos antes de salir a WhatsApp; no guarda solicitudes ni confirma citas.
const bookingForm=document.querySelector('#booking-form');
const review=document.querySelector('#request-review');
const reviewText=document.querySelector('#request-text');
const sendButton=document.querySelector('#send-request');
let preparedMessage='';
bookingForm.addEventListener('input',()=>{
  review.hidden=true;
  preparedMessage='';
});
bookingForm.addEventListener('change',()=>{
  review.hidden=true;
  preparedMessage='';
});
document.querySelector('#edit-request').addEventListener('click',()=>{
  review.hidden=true;
  preparedMessage='';
  document.querySelector('#client-name').focus();
});
bookingForm.addEventListener('submit',event=>{
  event.preventDefault();
  feedback.textContent='';
  if(!bookingForm.reportValidity())return;
  const client=document.querySelector('#client-name').value.trim();
  const selectedService=services.find(item=>item.id===serviceSelect.value);
  const mode=selectedModality();
  const district=districtInput.value.trim();
  const date=dateInput.value;
  const time=document.querySelector('#time').value;
  const msg=document.querySelector('#message').value.trim();
  if(!client){feedback.textContent='Escribí tu nombre para continuar.';return;}
  if(!selectedService){feedback.textContent='Seleccioná un servicio del catálogo.';return;}
  if(date<localISODate(new Date())){feedback.textContent='Seleccioná una fecha de hoy en adelante.';return;}
  if(mode==='domicilio'&&!district){feedback.textContent='Indicá el cantón o distrito para cotizar el traslado.';return;}
  const base=typeof selectedService.price==='string'?selectedService.price.trim():'';
  preparedMessage=[
    '¡Hola, Vale! Me gustaría consultar una cita en VAL Lashes.',
    'Nombre: '+client,
    'Servicio: '+selectedService.name,
    'Precio base publicado: '+(base||'Por confirmar'),
    'Modalidad: '+(mode==='domicilio'?'A domicilio':'En el estudio'),
    ...(mode==='domicilio'?['Zona de atención: '+district,'Traslado: pendiente de cotización personalizada según zona o distancia']:[]),
    'Fecha preferida: '+date,
    'Hora preferida: '+time,
    ...(msg?['Consulta: '+msg]:[]),
    'Solicito confirmar el precio final y la disponibilidad antes de reservar.'
  ].join('\n');
  reviewText.textContent=preparedMessage;
  review.hidden=false;
  sendButton.disabled=!validPhone;
  if(!validPhone){
    feedback.textContent='Vista previa lista. Aún no se puede enviar: falta configurar el WhatsApp comercial.';
  } else {
    feedback.textContent='Revisá el mensaje y tocá «Abrir WhatsApp» cuando estés lista.';
  }
  review.scrollIntoView({behavior:'smooth',block:'nearest'});
});
sendButton.addEventListener('click',()=>{
  if(!preparedMessage || !validPhone)return;
  const url='https://wa.me/'+phone+'?text='+encodeURIComponent(preparedMessage);
  feedback.textContent='Se abrirá WhatsApp con el mensaje preparado. Recordá presionar Enviar allí.';
  const win=window.open(url,'_blank','noopener,noreferrer');
  if(!win) window.location.assign(url);
});
