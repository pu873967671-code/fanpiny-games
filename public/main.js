const body=document.body, desk=document.querySelector('.desk'), pieces=[...document.querySelectorAll('.piece')], reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let tidy=reduced, topLayer=5;
const buttons=[...document.querySelectorAll('[data-view]')];
function setView(next){
 if(next===tidy && body.classList.contains('ready'))return;
 const before=pieces.map(el=>el.getBoundingClientRect()); tidy=next; body.classList.toggle('tidy',tidy); body.classList.add('ready');
 buttons.forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='tidy')===tidy)));
 pieces.forEach((el,i)=>{el.style.removeProperty('--dx');el.style.removeProperty('--dy');el.dataset.x=0;el.dataset.y=0;if(reduced)return;const after=el.getBoundingClientRect();el.animate([{transform:`translate(${before[i].left-after.left}px,${before[i].top-after.top}px) scale(${before[i].width/after.width})`},{transform:getComputedStyle(el).transform}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'})});
}
buttons.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view==='tidy')));setView(tidy);
document.querySelectorAll('[data-index]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();setView(true);const target=pieces.find(p=>p.dataset.group===link.dataset.index);setTimeout(()=>target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}),50)}));
pieces.forEach(el=>{
 const img=el.querySelector('img'),still=img.getAttribute('src');
 if(!reduced){el.addEventListener('mouseenter',()=>{img.src=img.dataset.motion});el.addEventListener('mouseleave',()=>{img.src=still});el.addEventListener('focus',()=>{img.src=img.dataset.motion});el.addEventListener('blur',()=>{img.src=still})}
 let start,dragged=false,raf=0;
 el.addEventListener('pointerdown',e=>{if(tidy||e.button!==0)return;start={x:e.clientX,y:e.clientY,ox:+el.dataset.x||0,oy:+el.dataset.y||0,lastX:e.clientX,lastY:e.clientY,time:performance.now(),vx:0,vy:0};dragged=false;el.setPointerCapture(e.pointerId);el.style.zIndex=++topLayer});
 el.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>5){dragged=true;el.classList.add('dragging')}if(!dragged)return;const now=performance.now(),dt=Math.max(1,now-start.time);start.vx=(e.clientX-start.lastX)/dt;start.vy=(e.clientY-start.lastY)/dt;start.lastX=e.clientX;start.lastY=e.clientY;start.time=now;el.dataset.x=start.ox+dx;el.dataset.y=start.oy+dy;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{el.style.setProperty('--dx',el.dataset.x+'px');el.style.setProperty('--dy',el.dataset.y+'px')})});
 el.addEventListener('pointerup',()=>{if(!start)return;el.classList.remove('dragging');if(dragged&&!reduced){let vx=start.vx*12,vy=start.vy*12;const coast=()=>{vx*=.9;vy*=.9;el.dataset.x=+el.dataset.x+vx;el.dataset.y=+el.dataset.y+vy;el.style.setProperty('--dx',el.dataset.x+'px');el.style.setProperty('--dy',el.dataset.y+'px');if(Math.abs(vx)+Math.abs(vy)>.2)raf=requestAnimationFrame(coast)};raf=requestAnimationFrame(coast)}start=null});
 el.addEventListener('click',e=>{if(dragged){e.preventDefault();dragged=false}});
});
const mascot=document.querySelector('.mascot');mascot.addEventListener('click',()=>{mascot.classList.remove('hop');void mascot.offsetWidth;mascot.classList.add('hop')});
if(!reduced){let last=0;desk.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||tidy||Date.now()-last<2500)return;last=Date.now();mascot.style.left=Math.max(5,Math.min(88,e.clientX/innerWidth*100))+'%'});if(matchMedia('(hover:hover)').matches){let frame;desk.addEventListener('pointermove',e=>{if(tidy||e.target.closest('.piece'))return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const x=(e.clientX/innerWidth-.5)*8,y=(e.clientY/innerHeight-.5)*8;document.querySelector('.desk-heading').style.translate=`${x}px ${y}px`})})}}
