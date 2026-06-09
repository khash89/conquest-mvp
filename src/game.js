const canvas=document.getElementById('gc');
const ctx=canvas.getContext('2d');
const W=()=>canvas.width, H=()=>canvas.height;
let player,enemies,keys,timer,spawnTimer,wave,state,animId;

function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resize();window.addEventListener('resize',resize);

document.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(state!=='playing')return;
  if(e.key==='z'||e.key==='Z')player.attack(enemies);
  if(e.key==='x'||e.key==='X')player.special(enemies);
  e.preventDefault();
});
document.addEventListener('keyup',e=>{delete keys[e.key];});

function startGame(){
  player=new Player(W()/2,H()/2);
  enemies=[];keys={};timer=CONFIG.waves.duration;spawnTimer=CONFIG.waves.spawnStart;wave=0;state='playing';
  setScreen(null);showHUD(true);
  cancelAnimationFrame(animId);loop();
}

function resetGame(){
  cancelAnimationFrame(animId);state='idle';
  setScreen('start-screen');showHUD(false);
}

window.startGame=startGame;window.resetGame=resetGame;

function loop(){
  animId=requestAnimationFrame(loop);
  if(state!=='playing')return;
  update();render();
}

function resolveCollisions(){
  // Enemy vs enemy
  for(let i=0;i<enemies.length;i++){
    const a=enemies[i]; if(!a.alive) continue;
    for(let j=i+1;j<enemies.length;j++){
      const b=enemies[j]; if(!b.alive) continue;
      const dx=b.x-a.x, dy=b.y-a.y;
      const minD=a.radiusHitBox+b.radiusHitBox;
      const d2=dx*dx+dy*dy;
      if(d2<minD*minD&&d2>0){
        const d=Math.sqrt(d2);
        const push=(minD-d)*0.5;
        const nx=dx/d, ny=dy/d;
        a.x-=nx*push; a.y-=ny*push;
        b.x+=nx*push; b.y+=ny*push;
      }
    }
    // Enemy vs player
    const dx=player.x-a.x, dy=player.y-a.y;
    const minD=a.radiusHitBox+player.radiusHitBox;
    const d2=dx*dx+dy*dy;
    if(d2<minD*minD&&d2>0){
      const d=Math.sqrt(d2);
      const push=(minD-d)*0.5;
      const nx=dx/d, ny=dy/d;
      a.x-=nx*push; a.y-=ny*push;
      player.x+=nx*push; player.y+=ny*push;
    }
  }
  // Clamp all to screen after pushing
  const w=W(), h=H();
  player.x=Math.max(player.radiusHitBox,Math.min(w-player.radiusHitBox,player.x));
  player.y=Math.max(player.radiusHitBox,Math.min(h-player.radiusHitBox,player.y));
  for(const e of enemies){
    if(!e.alive) continue;
    e.x=Math.max(e.radiusHitBox,Math.min(w-e.radiusHitBox,e.x));
    e.y=Math.max(e.radiusHitBox,Math.min(h-e.radiusHitBox,e.y));
  }
}

function update(){
  timer--;
  if(timer<=0){endGame('win');return;}
  spawnTimer--;
  if(spawnTimer<=0){
    const count=Math.min(1+Math.floor(wave/2),CONFIG.waves.maxBatch);
    for(let i=0;i<count;i++)enemies.push(spawnEnemy(W(),H(),wave));
    wave++;
    spawnTimer=Math.max(CONFIG.waves.spawnMin,CONFIG.waves.spawnDecayBase-wave*CONFIG.waves.spawnDecay);
  }
  player.update(keys,W(),H());
  for(const e of enemies){
    if(e.update(player.x,player.y,W(),H())&&player.alive)
      player.takeDamage(e.dealDamage());
  }
  resolveCollisions();
  enemies=enemies.filter(e=>e.alive);
  if(!player.alive){endGame('lose');return;}
  updateHUD(player,timer);
}

function render(){
  drawArena(ctx,W(),H());
  enemies.slice().sort((a,b)=>a.y-b.y).forEach(e=>e.draw(ctx));
  player.draw(ctx);
}

function endGame(result){
  state=result;showHUD(false);
  if(result==='win'){
    document.getElementById('win-stat').textContent=player.kills+' ENEMIES SLAIN · ROME ENDURES';
    setScreen('win-screen');
  } else {
    document.getElementById('lose-stat').textContent=
      'Survived '+Math.floor((CONFIG.waves.duration-timer)/60)+'s · '+player.kills+' enemies slain';
    setScreen('lose-screen');
  }
}
