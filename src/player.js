function dist(ax,ay,bx,by){return Math.sqrt((bx-ax)**2+(by-ay)**2)}
function angleDiff(a,b){return((a-b+Math.PI*3)%(Math.PI*2))-Math.PI}
function spawnDmgNum(x,y,txt,heal=false,isPlayer=false){
  const el=document.createElement('div');
  el.className='dn';
  el.textContent=txt;
  el.style.cssText=`left:${x-16}px;top:${y-10}px;font-size:${heal?13:15}px;`+
    `color:${heal?'#70c840':isPlayer?'#ff6060':'#e8c050'};`+
    `font-family:'Cinzel',serif;text-shadow:0 0 6px currentColor`;
  document.getElementById('dmg-layer').appendChild(el);
  setTimeout(()=>el.remove(),1100);
}

class Player {
  constructor(x,y){
    const {body:b, skill:c} = CONFIG.characters.player;
    this.x=x; this.y=y;
    // Body
    this.hp=b.hp; this.maxHp=b.hp;
    this.hpRegen=b.hpRegen;
    this.stamina=b.stamina; this.maxStamina=b.maxStamina;
    this.staminaRegen=b.staminaRegen;
    this.radiusHitBox=CONFIG.px(b.radiusHitBox);
    this.spd=CONFIG.spd(b.speed);
    // Combat
    this.atk=c.atk;
    this.atkRangePx=CONFIG.px(c.atkRange);
    this.atkArc=c.atkArc;
    this.atkCdMax=c.atkCd;
    this.facing=0;
    this.atkCd=0; this.specCd=0;
    this.atkAnim=0; this.hitTimer=0;
    this.hitsAbsorbed=0; this.buff=0;
    this.defending=false;
    this.alive=true; this.kills=0;
  }

  update(keys,W,H){
    const sc=CONFIG.staminaCosts;
    const b=CONFIG.characters.player.body;
    const c=CONFIG.characters.player.skill;
    let dx=0,dy=0;
    if(keys['ArrowUp'])    dy-=1;
    if(keys['ArrowDown'])  dy+=1;
    if(keys['ArrowLeft'])  dx-=1;
    if(keys['ArrowRight']) dx+=1;
    if(this.hpRegen>0) this.hp=Math.min(this.maxHp,this.hp+this.hpRegen);
    this.stamina=Math.min(this.maxStamina,this.stamina+this.staminaRegen);
    const wantsDefend=keys['c']||keys['C'];
    this.defending=wantsDefend&&this.stamina>=sc.defend;
    if(this.defending) this.stamina-=sc.defend;
    const empty=this.stamina<=0;
    const baseSpd=this.defending?this.spd*c.defendSpdMult:this.spd;
    const moveSpd=empty?baseSpd*b.emptySpdMult:baseSpd;
    if(dx||dy){
      const m=Math.sqrt(dx*dx+dy*dy);
      this.x+=dx/m*moveSpd; this.y+=dy/m*moveSpd;
      this.facing=Math.atan2(dy,dx);
      if(!empty) this.stamina=Math.max(0,this.stamina-sc.move);
    }
    this.x=Math.max(this.radiusHitBox,Math.min(W-this.radiusHitBox,this.x));
    this.y=Math.max(this.radiusHitBox,Math.min(H-this.radiusHitBox,this.y));
    if(this.atkCd>0)   this.atkCd--;
    if(this.specCd>0)  this.specCd--;
    if(this.atkAnim>0) this.atkAnim--;
    if(this.hitTimer>0)this.hitTimer--;
    if(this.buff>0)    this.buff--;
  }

  attack(enemies){
    const sc=CONFIG.staminaCosts;
    const c=CONFIG.characters.player.skill;
    if(this.atkCd>0||this.stamina<sc.attack) return;
    this.stamina-=sc.attack;
    this.atkCd=this.atkCdMax; this.atkAnim=c.atkAnimDur;
    const dmgBonus=this.buff>0?Math.floor(this.atk*.15):0;
    for(const e of enemies){
      if(!e.alive) continue;
      if(dist(this.x,this.y,e.x,e.y)>this.atkRangePx+e.radiusHitBox) continue;
      const angle=Math.atan2(e.y-this.y,e.x-this.x);
      if(Math.abs(angleDiff(angle,this.facing))<this.atkArc){
        const dmg=this.atk+dmgBonus+Math.floor(Math.random()*5);
        if(e.takeDamage(dmg)) this.kills++;
        spawnDmgNum(e.x,e.y-e.radiusHitBox-10,dmg);
      }
    }
  }

  special(enemies){
    const sc=CONFIG.staminaCosts;
    const c=CONFIG.characters.player.skill;
    if(this.specCd>0||this.stamina<sc.special) return;
    this.stamina-=sc.special;
    this.specCd=c.specCd;
    const range=CONFIG.px(c.specRange);
    const knockback=CONFIG.px(c.specKnockback);
    for(const e of enemies){
      if(!e.alive) continue;
      const d=dist(this.x,this.y,e.x,e.y);
      if(d<range){
        const a=Math.atan2(e.y-this.y,e.x-this.x);
        e.x+=Math.cos(a)*knockback; e.y+=Math.sin(a)*knockback;
        const dmg=Math.floor(this.atk*.5);
        if(e.takeDamage(dmg)) this.kills++;
        spawnDmgNum(e.x,e.y-e.radiusHitBox-10,dmg);
      }
    }
    const h=Math.floor(this.maxHp*c.specHealPct);
    this.hp=Math.min(this.maxHp,this.hp+h);
    this.buff=c.buffDur;
    spawnDmgNum(this.x,this.y-40,'+'+h+' HP',true);
  }

  takeDamage(dmg){
    const c=CONFIG.characters.player.skill;
    this.hitsAbsorbed++;
    if(this.hitsAbsorbed%c.shieldEvery===0){
      const h=Math.floor(this.maxHp*c.shieldHealPct);
      this.hp=Math.min(this.maxHp,this.hp+h);
      this.buff=c.buffDur;
      spawnDmgNum(this.x,this.y-40,'SHIELD +'+h,true);
      return;
    }
    if(this.defending){
      dmg=Math.max(1,Math.floor(dmg*c.defendDmgMult));
      spawnDmgNum(this.x,this.y-30,'BLOCKED',true);
    }
    this.hp-=dmg; this.hitTimer=8;
    spawnDmgNum(this.x,this.y-20,dmg,false,true);
    if(this.hp<=0){this.hp=0;this.alive=false;}
  }

  draw(ctx){
    const arc=(f,a,s)=>{ctx.save();ctx.globalAlpha=a;ctx.fillStyle=s;ctx.beginPath();f();ctx.fill();ctx.restore();};
    if(this.buff>0) arc(()=>ctx.arc(this.x,this.y,this.radiusHitBox+12,0,Math.PI*2),.25,'#7090e0');
    if(this.atkAnim>0){
      arc(()=>{ctx.moveTo(this.x,this.y);ctx.arc(this.x,this.y,this.atkRangePx,this.facing-this.atkArc,this.facing+this.atkArc);ctx.closePath();},.4,'#a0c8ff');
    }
    if(this.defending){
      ctx.save();ctx.strokeStyle='#a0e0ff';ctx.lineWidth=4;ctx.globalAlpha=0.75;
      ctx.beginPath();ctx.arc(this.x,this.y,this.radiusHitBox+10,this.facing-Math.PI/2.2,this.facing+Math.PI/2.2);
      ctx.stroke();ctx.restore();
    }
    ctx.fillStyle=this.hitTimer>0?'#ff8080':'#7090e0';
    ctx.beginPath();ctx.arc(this.x,this.y,this.radiusHitBox,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c0d8ff';
    ctx.beginPath();ctx.arc(this.x+Math.cos(this.facing)*20,this.y+Math.sin(this.facing)*20,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#330000';ctx.fillRect(this.x-18,this.y-this.radiusHitBox-9,36,4);
    ctx.fillStyle='#c84040';ctx.fillRect(this.x-18,this.y-this.radiusHitBox-9,36*this.hp/this.maxHp,4);
  }
}
