// Build ENEMY_TYPES from config (goblin → orc → troll, typeIdx 0/1/2)
const ENEMY_TYPES = ['goblin','orc','troll'].map(key => {
  const char = CONFIG.characters[key];
  const b = char.body; const s = char.skill; const m = char.mind;
  return {
    name: char.name, color: char.color,
    // Body
    hp: b.hp, hpRegen: b.hpRegen,
    stamina: b.stamina, maxStamina: b.maxStamina, staminaRegen: b.staminaRegen,
    radiusHitBox: CONFIG.px(b.radiusHitBox),
    spd: CONFIG.spd(b.speed),
    // Skill
    atk: s.atk,
    atkRangePx: CONFIG.px(s.atkRange),
    atkArc: s.atkArc,
    atkCdMax: s.atkCd,
    detectionRangePx: CONFIG.px(s.detectionRange),
    // Mind
    aggressionLevel: m.aggressionLevel,
    fleeThreshold: m.fleeThreshold,
  };
});

class Enemy {
  constructor(x,y,typeIdx){
    const t=ENEMY_TYPES[typeIdx];
    this.x=x; this.y=y;
    // Body
    this.hp=t.hp; this.maxHp=t.hp;
    this.hpRegen=t.hpRegen;
    this.stamina=t.stamina; this.maxStamina=t.maxStamina;
    this.staminaRegen=t.staminaRegen;
    this.radiusHitBox=t.radiusHitBox;
    this.spd=t.spd;
    // Combat
    this.atk=t.atk;
    this.atkRangePx=t.atkRangePx;
    this.atkArc=t.atkArc;
    this.atkCdMax=t.atkCdMax;
    // Intelligence
    this.detectionRangePx=t.detectionRangePx;
    this.aggressionLevel=t.aggressionLevel;
    this.fleeThreshold=t.fleeThreshold;
    this.color=t.color; this.name=t.name;
    this.typeIdx=typeIdx; this.alive=true;
    this.hitTimer=0; this.atkCd=0;
  }

  update(px,py,W,H){
    if(!this.alive) return false;
    if(this.hpRegen>0) this.hp=Math.min(this.maxHp,this.hp+this.hpRegen);
    const dx=px-this.x, dy=py-this.y;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d>1){ this.x+=dx/d*this.spd; this.y+=dy/d*this.spd; }
    this.x=Math.max(this.radiusHitBox,Math.min(W-this.radiusHitBox,this.x));
    this.y=Math.max(this.radiusHitBox,Math.min(H-this.radiusHitBox,this.y));
    if(this.hitTimer>0) this.hitTimer--;
    if(this.atkCd>0)    this.atkCd--;
    const playerR=CONFIG.px(CONFIG.characters.player.body.radiusHitBox);
    return d<this.radiusHitBox+playerR+this.atkRangePx && this.atkCd===0;
  }

  dealDamage(){
    this.atkCd=this.atkCdMax;
    return this.atk;
  }

  takeDamage(dmg){
    this.hp-=dmg; this.hitTimer=6;
    if(this.hp<=0){ this.hp=0; this.alive=false; return true; }
    return false;
  }

  draw(ctx){
    ctx.fillStyle=this.hitTimer>0?'#ffffff':this.color;
    ctx.beginPath();ctx.arc(this.x,this.y,this.radiusHitBox,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff2020';
    const eo=this.radiusHitBox*.35;
    ctx.beginPath();ctx.arc(this.x-eo,this.y-this.radiusHitBox*.2,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(this.x+eo,this.y-this.radiusHitBox*.2,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#330000';ctx.fillRect(this.x-this.radiusHitBox,this.y-this.radiusHitBox-8,this.radiusHitBox*2,3);
    ctx.fillStyle='#c84040';ctx.fillRect(this.x-this.radiusHitBox,this.y-this.radiusHitBox-8,this.radiusHitBox*2*this.hp/this.maxHp,3);
    ctx.fillStyle='#6a5030';ctx.font='8px Cinzel';ctx.textAlign='center';
    ctx.fillText(this.name,this.x,this.y+this.radiusHitBox+11);
  }
}

function spawnEnemy(W,H,wave){
  let typeIdx=0;
  if(wave>=4) typeIdx=Math.random()<.55?0:1;
  if(wave>=8) typeIdx=Math.floor(Math.random()*3);
  const side=Math.floor(Math.random()*4);
  let x,y;
  if(side===0){ x=Math.random()*W; y=-30; }
  else if(side===1){ x=W+30; y=Math.random()*H; }
  else if(side===2){ x=Math.random()*W; y=H+30; }
  else { x=-30; y=Math.random()*H; }
  return new Enemy(x,y,typeIdx);
}
