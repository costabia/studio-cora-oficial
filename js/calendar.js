import {esc} from './utils.js';

export const CALENDAR_START = '2026-11-23';
export const CALENDAR_END = '2027-11-23';
export const CALENDAR_VERSION = 2;
export const WEEKDAYS = ['D','S','T','Q','Q','S','S'];

export function isoDate(date){
  const d = date instanceof Date ? date : new Date(`${date}T12:00:00`);
  return d.toISOString().slice(0,10);
}

export function parseDate(value){return new Date(`${value}T12:00:00`)}

export function addBusinessDays(value, amount){
  const date = parseDate(isoDate(value));
  let remaining = Number(amount)||0;
  const direction = remaining < 0 ? -1 : 1;
  remaining = Math.abs(remaining);
  while(remaining){
    date.setDate(date.getDate()+direction);
    const day = date.getDay();
    if(day !== 0 && day !== 6) remaining--;
  }
  return isoDate(date);
}

export function formatCalendarDate(value, options={day:'2-digit',month:'2-digit',year:'numeric'}){
  if(!value)return 'Sem data';
  return parseDate(value).toLocaleDateString('pt-BR',options);
}

export function makeInitialCalendarEvents(){
  const item = (id, clientName, title, date, extra={})=>({id,clientName,title,date,source:'manual',...extra});
  const next = (id, clientName, title, anchor, days, nextTask='')=>item(id,clientName,title,addBusinessDays(anchor,days),{daysToNext:days,nextTask});
  return [
    item('cal_sannessa_id_visual','Sannessa','ID visual entregue','2026-11-19',{status:'Concluído'}),
    item('cal_tauany_save_date','Tauany','Save the Date entregue','2026-11-20',{status:'Concluído'}),
    next('cal_tauany_estampa','Tauany','Estampa da caixa de padrinhos','2026-11-20',15),
    item('cal_gabriela_monograma','Gabriela & Antonio','Monograma entregue','2026-11-25',{status:'Concluído'}),
    next('cal_gabriela_identidade','Gabriela & Antonio','Identidade visual completa','2026-11-25',15),
    item('cal_gabrieli_esboco','Gabrieli & Bryan','Esboço da aquarela entregue','2026-11-25',{status:'Concluído'}),
    next('cal_gabrieli_pintura','Gabrieli & Bryan','Pintura da aquarela','2026-11-25',15,'Identidade visual completa'),
    next('cal_gabrieli_identidade','Gabrieli & Bryan','Identidade visual completa',addBusinessDays('2026-11-25',15),15),
    item('cal_paula_monograma','Paula','Monograma entregue','2026-12-01',{status:'Concluído'}),
    item('cal_beatriz_monograma','Beatriz','Monograma entregue','2026-12-07',{status:'Concluído'}),
    next('cal_beatriz_esboco','Beatriz','Esboço da aquarela','2026-12-07',15,'Pintura da aquarela'),
    next('cal_beatriz_pintura','Beatriz','Pintura da aquarela',addBusinessDays('2026-12-07',15),15,'Identidade visual completa'),
    next('cal_beatriz_identidade','Beatriz','Identidade visual completa',addBusinessDays(addBusinessDays('2026-12-07',15),15),15),
    item('cal_ana_save_date','Ana Lu / Analuiza','Save the Date entregue','2026-11-24',{status:'Concluído'}),
    next('cal_ana_identidade','Ana Lu / Analuiza','Identidade visual completa','2026-11-24',21)
  ];
}

export function ensureCalendarSeed(data){
  if(data.calendarVersion===CALENDAR_VERSION)return data;
  data.calendarEvents=makeInitialCalendarEvents();
  data.calendarVersion=CALENDAR_VERSION;
  return data;
}

export function getCalendarEvents(data){
  const taskEvents = (data.clients||[]).flatMap(client => (client.tasks||[])
    .filter(task => task.due || task.dueDate)
    .map(task => ({
      id:`task_${client.id}_${task.id}`,
      taskId:task.id,
      clientId:client.id,
      clientName:client.couple||client.name,
      title:task.title,
      date:task.due||task.dueDate,
      daysToNext:task.daysToNext||15,
      nextTask:task.nextTask||'',
      status:task.status,
      source:'task'
    })));
  return [...taskEvents,...(data.calendarEvents||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}

export function calendarView({data,month,onPrev,onNext,onToday,onAdd,onEdit}){
  const current = new Date(month.getFullYear(),month.getMonth(),1);
  const year=current.getFullYear(), monthIndex=current.getMonth();
  const monthLabel=current.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const events=getCalendarEvents(data);
  const byDate=events.reduce((acc,event)=>{(acc[event.date] ||= []).push(event);return acc},{});
  const firstDay=current.getDay();
  const daysInMonth=new Date(year,monthIndex+1,0).getDate();
  const cells=[];
  for(let i=0;i<42;i++){
    const day=i-firstDay+1;
    const dateObj=new Date(year,monthIndex,day);
    const date=isoDate(dateObj);
    const inMonth=dateObj.getMonth()===monthIndex;
    const dayEvents=byDate[date]||[];
    cells.push(`<div class="calendar-day ${inMonth?'':'is-outside'} ${date===isoDate(new Date())?'is-today':''}"><div class="calendar-day-number">${dateObj.getDate()}</div><div class="calendar-events">${dayEvents.map(event=>`<button type="button" class="calendar-event ${event.source==='task'?'is-task':''}" data-calendar-edit="${esc(event.id)}"><strong>${esc(event.title)}</strong><span>${esc(event.clientName||'')}</span></button>`).join('')}</div></div>`);
  }
  const monthEvents=events.filter(event=>String(event.date).startsWith(`${year}-${String(monthIndex+1).padStart(2,'0')}`));
  return `<section class="calendar-shell">
    <div class="calendar-toolbar"><div><p class="eyebrow">Controle interno · somente admin</p><h2 class="calendar-month-title">${monthLabel}</h2><p class="muted">Prazos do Kanban e entregas planejadas. As noivas não visualizam esta agenda.</p></div><div class="calendar-actions"><button class="btn btn-ghost" id="calendar-prev" type="button">Anterior</button><button class="btn btn-soft" id="calendar-today" type="button">Hoje</button><button class="btn btn-ghost" id="calendar-next" type="button">Próximo</button><button class="btn btn-primary" id="calendar-add" type="button">+ Nova entrega</button></div></div>
    <div class="calendar-card card"><div class="calendar-weekdays">${WEEKDAYS.map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div></div>
    <section class="calendar-agenda card"><div class="panel-head"><div><h3>Entregas do mês</h3><p class="muted">Clique em qualquer item para alterar o dia.</p></div><span class="badge badge-green">${monthEvents.length} ${monthEvents.length===1?'entrega':'entregas'}</span></div>${monthEvents.map(event=>`<button type="button" class="calendar-agenda-row" data-calendar-edit="${esc(event.id)}"><span class="agenda-date"><strong>${parseDate(event.date).getDate()}</strong><small>${parseDate(event.date).toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','')}</small></span><span class="agenda-info"><strong>${esc(event.title)}</strong><small>${esc(event.clientName||'')} · ${event.source==='task'?'Kanban':'planejado'}</small></span><span class="agenda-status">${esc(event.status||'Entrega')}</span></button>`).join('')||'<div class="empty">Nenhuma entrega neste mês.</div>'}</section>
  </section>`;
}

export function bindCalendar(root,{onPrev,onNext,onToday,onAdd,onEdit}){
  root.querySelector('#calendar-prev')?.addEventListener('click',onPrev);
  root.querySelector('#calendar-next')?.addEventListener('click',onNext);
  root.querySelector('#calendar-today')?.addEventListener('click',onToday);
  root.querySelector('#calendar-add')?.addEventListener('click',onAdd);
  root.querySelectorAll('[data-calendar-edit]').forEach(button=>button.addEventListener('click',()=>onEdit(button.dataset.calendarEdit)));
}
