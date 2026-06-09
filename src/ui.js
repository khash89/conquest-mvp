function setScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  if(id) document.getElementById(id).classList.add('active');
}

function showHUD(show){
  const disp=show?'flex':'none';
  document.getElementById('hud').style.display=disp;
  document.getElementById('ability-bar').style.display=disp;
  document.getElementById('timer-hud').style.display=show?'block':'none';
  document.getElementById('kills-hud').style.display=show?'block':'none';
}

function updateHUD(player,timerFrames){
  // HP bar
  document.getElementById('hp-bar').style.width=(player.hp/player.maxHp*100)+'%';
  document.getElementById('hp-val').textContent=player.hp;
  // Stamina bar
  const stPct=player.stamina/player.maxStamina*100;
  document.getElementById('st-bar').style.width=stPct+'%';
  document.getElementById('st-val').textContent=Math.floor(player.stamina);
  // Timer display
  const total=Math.ceil(timerFrames/60);
  const m=Math.floor(total/60), s=total%60;
  const td=document.getElementById('timer-hud');
  td.textContent=m+':'+(s<10?'0':'')+s;
  td.style.color=total<=30?'#c84040':'#c8952a';
  // Kill count
  document.getElementById('kills-hud').textContent=player.kills+' SLAIN';
  // Ability slots
  updateSlot('slot-z','oz',player.atkCd,0);
  updateSlot('slot-x','ox',player.specCd,5);
  // Defend slot — no cooldown, show stamina warning when insufficient
  const cSlot=document.getElementById('slot-c');
  if(player.stamina<8){
    cSlot.classList.remove('ready');
  } else {
    cSlot.classList.add('ready');
  }
}

function updateSlot(slotId,cdId,cd,maxSec){
  const slot=document.getElementById(slotId);
  let cdEl=document.getElementById(cdId);
  if(!cdEl){
    cdEl=document.createElement('div'); cdEl.id=cdId; cdEl.className='cd'; slot.appendChild(cdEl);
  }
  if(cd>0){
    cdEl.style.display='flex'; cdEl.textContent=(cd/60).toFixed(1);
    slot.classList.remove('ready');
  } else {
    cdEl.style.display='none'; slot.classList.add('ready');
  }
}

function drawArena(ctx,W,H){
  ctx.fillStyle='#0c0a07'; ctx.fillRect(0,0,W,H);
  // Subtle grid
  ctx.strokeStyle='rgba(255,200,80,.04)'; ctx.lineWidth=1;
  for(let x=0;x<W;x+=64){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0;y<H;y+=64){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // Arena border
  ctx.strokeStyle='#2a1e0a'; ctx.lineWidth=2;
  ctx.strokeRect(12,12,W-24,H-24);
  // Corner ornaments
  const corners=[[14,14],[W-14,14],[14,H-14],[W-14,H-14]];
  ctx.fillStyle='#c8952a';
  for(const [cx,cy] of corners){
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(Math.PI/4);
    ctx.fillRect(-4,-4,8,8); ctx.restore();
  }
}
