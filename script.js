(() => {
  'use strict';
  const settings = window.FIONAPE_CONFIG || {};
  const notice = document.getElementById('notice');
  let noticeTimer;
  function announce(message) { notice.textContent = message; notice.classList.add('show'); clearTimeout(noticeTimer); noticeTimer = setTimeout(() => notice.classList.remove('show'), 2600); }
  const address = typeof settings.contractAddress === 'string' ? settings.contractAddress.trim() : '';
  const addressField = document.getElementById('contract-value');
  const copy = document.getElementById('copy-contract');
  if (address) { addressField.textContent = address; addressField.title = address; copy.disabled = false; }
  copy.addEventListener('click', async () => {
    if (!address) return;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(address);
      else { const field = document.createElement('textarea'); field.value = address; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.appendChild(field); field.select(); const ok = document.execCommand('copy'); field.remove(); if (!ok) throw new Error('Clipboard unavailable'); }
      announce('Contract address copied');
    } catch { announce('Could not copy automatically. Select the address instead.'); }
  });
  function safeLink(value) { if (typeof value !== 'string' || !value.trim()) return ''; try { const u = new URL(value.trim()); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } }
  [['social-x', settings.xUrl], ['social-telegram', settings.telegramUrl]].forEach(([id, value]) => {
    const el = document.getElementById(id); const url = safeLink(value);
    if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener noreferrer'; el.removeAttribute('aria-disabled'); el.classList.remove('disabled'); }
    else { el.title = 'Link coming soon'; }
  });

  // Each water canvas reuses the original section image as a texture. Its
  // feathered water-only mask leaves the characters, lettering and boundaries
  // untouched. Canvas draws use drawImage, so they also work from local files.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const art = document.getElementById('desktop-art');
  const specs = {
    hero: [[.76,.88,.25,.095],[.22,.965,.18,.035]],
    stream: [[.23,.58,.19,.29],[.55,.65,.14,.25],[.80,.69,.17,.22]],
    pond: [[.18,.80,.16,.13],[.80,.81,.16,.13],[.50,.94,.25,.05]],
    join: [[.46,.73,.29,.09],[.14,.64,.13,.10]]
  };
  const scenes = Array.from(document.querySelectorAll('.scene-section[data-water]')).map(section => {
    const canvas=section.querySelector('canvas'); const img=section.querySelector('img');
    const ctx=canvas.getContext('2d'); const mask=document.createElement('canvas');
    mask.width=canvas.width; mask.height=canvas.height;
    const m=mask.getContext('2d'); const W=canvas.width,H=canvas.height;
    for(const [x,y,rx,ry] of specs[section.dataset.water]){
      m.save();m.translate(x*W,y*H);m.scale(rx*W,ry*H);
      const gradient=m.createRadialGradient(0,0,0,0,0,1);
      gradient.addColorStop(0,'rgba(255,255,255,.94)');gradient.addColorStop(.58,'rgba(255,255,255,.8)');gradient.addColorStop(1,'rgba(255,255,255,0)');
      m.fillStyle=gradient;m.beginPath();m.arc(0,0,1,0,Math.PI*2);m.fill();m.restore();
    }
    return {section,canvas,img,ctx,mask,W,H,visible:true,ripples:[],lastAuto:0};
  });
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
    const scene=scenes.find(s=>s.section===entry.target); if(scene)scene.visible=entry.isIntersecting;
  }),{rootMargin:'100px'}) : null;
  if(observer)scenes.forEach(scene=>observer.observe(scene.section));
  let frame=0,previous=0;
  function addRipple(scene,x,y,now,strength=1){scene.ripples.push({x,y,start:now,strength});if(scene.ripples.length>8)scene.ripples.shift();}
  function drawScene(scene,now){
    const {ctx,img,W,H,mask}=scene;if(!img.complete || !img.naturalWidth || !ctx)return;
    const seconds=now/1000;scene.ripples=scene.ripples.filter(r=>now-r.start<3000);
    if(now-scene.lastAuto>4300){const [x,y]=specs[scene.section.dataset.water][Math.floor(Math.random()*specs[scene.section.dataset.water].length)];addRipple(scene,x,y,now,.55);scene.lastAuto=now;}
    ctx.clearRect(0,0,W,H);ctx.save();
    // Thin horizontal bands gently refract the image, with extra displacement
    // around each expanding wave. No pixel reads are necessary.
    for(let y=0;y<H;y+=3){
      const height=Math.min(3,H-y);let shift=1.9*Math.sin(y*.09-seconds*1.9)+.9*Math.sin(y*.045+seconds*1.3);
      for(const r of scene.ripples){const age=(now-r.start)/1000,dy=(y/H-r.y)*H,front=age*31;const distance=Math.abs(dy)-front;if(Math.abs(distance)<20)shift+=Math.sin(distance*.48)*Math.exp(-distance*distance/180)*3.5*r.strength*(1-age/3);}
      ctx.drawImage(img,0,y,W,height,shift,y,W,height+.4);
    }
    ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);ctx.restore();
    // A few broken glints make the expanding wave legible without opaque rings.
    for(const r of scene.ripples){const age=(now-r.start)/3000;if(age<0||age>=1)continue;const alpha=Math.sin(Math.PI*age)*.32*r.strength;
      for(let i=0;i<3;i++){let p=age-i*.08;if(p<=0)continue;ctx.beginPath();ctx.ellipse(r.x*W,r.y*H,5+p*90,2+p*12,0,.18,2.8);ctx.strokeStyle=`rgba(243,255,224,${alpha*(1-i*.23)})`;ctx.lineWidth=1.2-i*.2;ctx.stroke();
      ctx.beginPath();ctx.ellipse(r.x*W,r.y*H,5+p*90,2+p*12,0,3.45,5.85);ctx.strokeStyle=`rgba(8,50,35,${alpha*.72})`;ctx.lineWidth=1;ctx.stroke();}
    }
  }
  function loop(now){if(motion.matches){frame=0;return;}if(now-previous>50){for(const s of scenes)if(s.visible)drawScene(s,now);previous=now;}frame=requestAnimationFrame(loop);}
  function start(){if(!motion.matches&&!frame)frame=requestAnimationFrame(loop);}
  function clearWater(){if(frame)cancelAnimationFrame(frame);frame=0;for(const s of scenes)s.ctx?.clearRect(0,0,s.W,s.H);}
  if(motion.addEventListener)motion.addEventListener('change',()=>{if(motion.matches)clearWater();else start();});
  start();
  // Clicking the visible water, or activating the keyboard-accessible button,
  // creates an additional ripple at the selected point.
  art.addEventListener('click',event=>{
    if(motion.matches)return;if(event.target.closest('a'))return;
    let selected=null,x=0,y=0;
    if(event.target.id==='water-button'){selected=scenes.find(s=>s.section.dataset.water==='pond');const r=selected.section.getBoundingClientRect();const xx=(event.clientX-r.left)/r.width,yy=(event.clientY-r.top)/r.height;const inside=event.detail!==0 && specs.pond.some(([cx,cy,rx,ry])=>((xx-cx)/rx)**2+((yy-cy)/ry)**2<=1.5);x=inside?xx:.78;y=inside?yy:.81;}
    else for(const scene of scenes){const r=scene.section.getBoundingClientRect();if(event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom){const xx=(event.clientX-r.left)/r.width,yy=(event.clientY-r.top)/r.height;if(specs[scene.section.dataset.water].some(([cx,cy,rx,ry])=>((xx-cx)/rx)**2+((yy-cy)/ry)**2<=1.5)){selected=scene;x=xx;y=yy;}break;}}
    if(selected)addRipple(selected,x,y,performance.now(),1.2);
  });
  let parallaxScheduled=false;
  function parallax(){if(!motion.matches&&getComputedStyle(art).display!=='none'){const rect=art.getBoundingClientRect(),p=Math.max(-1,Math.min(1,(innerHeight*.45-rect.top)/(rect.height||1)));document.querySelectorAll('.ambient .floating-lily,.ambient .sway-branch,.ambient .hero-lily').forEach((el,i)=>{el.style.translate=`0 ${Math.round(p*(i===2?-16:12))}px`;});}parallaxScheduled=false;}
  addEventListener('scroll',()=>{if(!parallaxScheduled){requestAnimationFrame(parallax);parallaxScheduled=true;}},{passive:true});
  const mobileButton=document.getElementById('mobile-water'),mobileLayer=document.querySelector('.mobile-ripples');
  mobileButton.addEventListener('click',()=>{if(motion.matches){announce('Motion effects are reduced on this device.');return;}for(let i=0;i<3;i++){const ring=document.createElement('span');ring.className='mobile-ring';ring.style.left='50%';ring.style.top='70%';ring.style.animationDelay=`${i*.15}s`;mobileLayer.appendChild(ring);setTimeout(()=>ring.remove(),2200);}});
})();
