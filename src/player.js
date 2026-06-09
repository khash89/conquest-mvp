// Shared helpers
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
    this.x=x; this.y=y;
    this.hp=130; this.maxHp=130;
    this.atk=13; this.spd=3.6; this.r=16;
    this.facing=0;
    this.atkCd=0; this.specCd=0;
    this.atkAnim=0; this.hitTimer=0;
    this.hitsAbsorbed=0; this.buff=0;
    this.alive=true; this.kills=0;
  }

  update(keys,W,H){
    let dx=0,dy=0;
    if(keys['ArrowUp'])    dy-=1;
    if(keys['ArrowDown'])  dy+=1;
    if(keys['ArrowLeft'])  dx-=1;
    if(keys['ArrowRight']) dx+=1;
    if(dx||dy){
      const m=Math.sqrt(dx*dx+dy*dy);
      this.x+=dx/m*this.spd; this.y+=dy/m*this.spd;
      this.facing=Math.atan2(dy,dx);
    }
    this.x=Math.max(this.r,Math.min(W-this.r,this.x));
    this.y=Math.max(this.r,Math.min(H-this.r,this.y));
    if(this.atkCd>0)  this.atkCd--;
    if(this.specCd>0) this.specCd--;
    if(this.atkAnim>0)this.atkAnim--;
    if(this.hitTimer>0)this.hitTimer--;
    if(this.buff>0)   this.buff--;
  }

  attack(enemies){
    if(this.atkCd>0) return;
    this.atkCd=30; this.atkAnim=12;
    const dmgBonus=this.buff>0?Math.floor(this.atk*.15):0;
    for(const e of enemies){
      if(!e.alive) continue;
      if(dist(this.x,this.y,e.x,e.y)>80+e.r) continue;
      const angle=Math.atan2(e.y-this.y,e.x-this.x);
      if(Math.abs(angleDiff(angle,this.facing))<Math.PI/3){
        const dmg=this.atk+dmgBonus+Math.floor(Math.random()*5);
        if(e.takeDamage(dmg)) this.kills++;
        spawnDmgNum(e.x,e.y-e.r-10,dmg);
      }
    }
  }

  special(enemies){
    if(this.specCd>0) return;
    this.specCd=300; // 5 seconds
    for(const e of enemies){
      if(!e.alive) continue;
      const d=dist(this.x,this.y,e.x,e.y);
      if(d<110){
        const a=Math.atan2(e.y-this.y,e.x-this.x);
        e.x+=Math.cos(a)*90; e.y+=Math.sin(a)*90;
        const dmg=Math.floor(this.atk*.5);
        if(e.takeDamage(dmg)) this.kills++;
        spawnDmgNum(e.x,e.y-e.r-10,dmg);
      }
    }
    const h=Math.floor(this.maxHp*.08);
    this.hp=Math.min(this.maxHp,this.hp+h);
    this.buff=240;
    spawnDmgNum(this.x,this.y-40,'+'+h+' HP',true);
  }

  takeDamage(dmg){
    this.hitsAbsorbed++;
    if(this.hitsAbsorbed%5===0){
      const h=Math.floor(this.maxHp*.08);
      this.hp=Math.min(this.maxHp,this.hp+h);
      this.buff=240;
      spawnDmgNum(this.x,this.y-40,'SHIELD +'+h,true);
      return;
    }
    this.hp-=dmg; this.hitTimer=8;
    spawnDmgNum(this.x,this.y-20,dmg,false,true);
    if(this.hp<=0){this.hp=0;this.alive=false;}
  }

  draw(ctx){
    const arc=(f,a,s)=>{ctx.save();ctx.globalAlpha=a;ctx.fillStyle=s;ctx.beginPath();f();ctx.fill();ctx.restore();};
    if(this.buff>0) arc(()=>ctx.arc(this.x,this.y,this.r+12,0,Math.PI*2),.25,'#7090e0');
    if(this.atkAnim>0) arc(()=>{ctx.moveTo(this.x,this.y);ctx.arc(this.x,this.y,80,this.facing-Math.PI/3,this.facing+Math.PI/3);ctx.closePath();},.4,'#a0c8ff');
    ctx.fillStyle=this.hitTimer>0?'#ff8080':'#7090e0';
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c0d8ff';
    ctx.beginPath();ctx.arc(this.x+Math.cos(this.facing)*20,this.y+Math.sin(this.facing)*20,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#330000';ctx.fillRect(this.x-18,this.y-this.r-9,36,4);
    ctx.fillStyle='#c84040';ctx.fillRect(this.x-18,this.y-this.r-9,36*this.hp/this.maxHp,4);
  }
}
