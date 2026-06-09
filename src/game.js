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
  enemies=[];keys={};timer=120*60;spawnTimer=90;wave=0;state='playing';
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

function update(){
  timer--;
  if(timer<=0){endGame('win');return;}
  spawnTimer--;
  if(spawnTimer<=0){
    const count=Math.min(1+Math.floor(wave/2),5);
    for(let i=0;i<count;i++)enemies.push(spawnEnemy(W(),H(),wave));
    wave++;
    spawnTimer=Math.max(80,240-wave*12);
  }
  player.update(keys,W(),H());
  for(const e of enemies){
    if(e.update(player.x,player.y,W(),H())&&player.alive)
      player.takeDamage(e.dealDamage());
  }
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
      'Survived '+Math.floor((120*60-timer)/60)+'s · '+player.kills+' enemies slain';
    setScreen('lose-screen');
  }
}
