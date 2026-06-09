const ENEMY_TYPES = [
  {name:'Goblin', hp:25,  atk:4,  spd:3.2, r:10, color:'#3a8a3a', atkRate:50},
  {name:'Orc',    hp:65,  atk:8,  spd:2.1, r:15, color:'#b06818', atkRate:70},
  {name:'Troll',  hp:130, atk:14, spd:1.1, r:22, color:'#706048', atkRate:90},
];

class Enemy {
  constructor(x,y,typeIdx){
    const t=ENEMY_TYPES[typeIdx];
    this.x=x; this.y=y;
    this.hp=t.hp; this.maxHp=t.hp;
    this.atk=t.atk; this.spd=t.spd; this.r=t.r;
    this.color=t.color; this.name=t.name;
    this.atkRate=t.atkRate;
    this.typeIdx=typeIdx; this.alive=true;
    this.hitTimer=0; this.atkCd=0;
  }

  update(px,py,W,H){
    if(!this.alive) return false;
    const dx=px-this.x, dy=py-this.y;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d>1){ this.x+=dx/d*this.spd; this.y+=dy/d*this.spd; }
    this.x=Math.max(this.r,Math.min(W-this.r,this.x));
    this.y=Math.max(this.r,Math.min(H-this.r,this.y));
    if(this.hitTimer>0) this.hitTimer--;
    if(this.atkCd>0)    this.atkCd--;
    return d<this.r+16 && this.atkCd===0;
  }

  dealDamage(){
    this.atkCd=this.atkRate;
    return this.atk;
  }

  takeDamage(dmg){
    this.hp-=dmg; this.hitTimer=6;
    if(this.hp<=0){ this.hp=0; this.alive=false; return true; }
    return false;
  }

  draw(ctx){
    ctx.fillStyle=this.hitTimer>0?'#ffffff':this.color;
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff2020';
    const eo=this.r*.35;
    ctx.beginPath();ctx.arc(this.x-eo,this.y-this.r*.2,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(this.x+eo,this.y-this.r*.2,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#330000';ctx.fillRect(this.x-this.r,this.y-this.r-8,this.r*2,3);
    ctx.fillStyle='#c84040';ctx.fillRect(this.x-this.r,this.y-this.r-8,this.r*2*this.hp/this.maxHp,3);
    ctx.fillStyle='#6a5030';ctx.font='8px Cinzel';ctx.textAlign='center';
    ctx.fillText(this.name,this.x,this.y+this.r+11);
  }
}

function spawnEnemy(W,H,wave){
  // Scale type distribution with wave
  let typeIdx=0;
  if(wave>=4) typeIdx=Math.random()<.55?0:1;
  if(wave>=8) typeIdx=Math.floor(Math.random()*3);

  // Spawn off-screen on a random edge
  const side=Math.floor(Math.random()*4);
  let x,y;
  if(side===0){ x=Math.random()*W; y=-30; }
  else if(side===1){ x=W+30; y=Math.random()*H; }
  else if(side===2){ x=Math.random()*W; y=H+30; }
  else { x=-30; y=Math.random()*H; }
  return new Enemy(x,y,typeIdx);
}
