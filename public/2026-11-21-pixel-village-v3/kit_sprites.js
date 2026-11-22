// 狐兔像素精灵 32x32（v3：+挥手 paw / 伸懒腰 stretch / 害羞 blush+eye6 / 打喷嚏 eye5 / 撑伞 paw3），纯代码逐像素生成：形状填充 + 自动深色描边，固定调色板，无抗锯齿
(function(g){
const PAL={O:'#6b3f2e',C:'#fff1da',S:'#f1cfa6',P:'#f8a874',K:'#f59aa0',E:'#35201a',B:'#b8672a',W:'#ffffff',G:'#85b83f',g:'#55872a',T:'#f27f87',N:'#b05a45',A:'#9a5d34'};
function mk(w,h){return {w,h,a:new Array(w*h).fill(null)}}
function put(b,x,y,c){x|=0;y|=0;if(x>=0&&y>=0&&x<b.w&&y<b.h)b.a[y*b.w+x]=c}
function ell(b,cx,cy,rx,ry,c,cond){for(let y=Math.floor(cy-ry-1);y<=cy+ry+1;y++)for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1&&(!cond||cond(x,y)))put(b,x,y,typeof c==='function'?c(x,y):c)}}
function tri(b,p,c){const[[x1,y1],[x2,y2],[x3,y3]]=p;const mnx=Math.min(x1,x2,x3),mxx=Math.max(x1,x2,x3),mny=Math.min(y1,y2,y3),mxy=Math.max(y1,y2,y3);
 for(let y=mny;y<=mxy;y++)for(let x=mnx;x<=mxx;x++){const px=x+.5,py=y+.5;const d=(a,b,c2,d2,e,f)=>(a-e)*(d2-f)-(c2-e)*(b-f);
 const s1=d(px,py,x1,y1,x2,y2),s2=d(px,py,x2,y2,x3,y3),s3=d(px,py,x3,y3,x1,y1);const neg=s1<0||s2<0||s3<0,pos=s1>0||s2>0||s3>0;if(!(neg&&pos))put(b,x,y,c)}}
function thick(b,x0,y0,x1,y1,r,c){for(let i=0;i<=16;i++){const t=i/16;ell(b,x0+(x1-x0)*t,y0+(y1-y0)*t,r,r,c)}}
function outline(b,col){const o=b.a.slice();for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){if(b.a[y*b.w+x])continue;let n=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<b.w&&yy<b.h&&b.a[yy*b.w+xx]&&b.a[yy*b.w+xx]!=='O')n=true}if(n)o[y*b.w+x]=col}b.a=o}
// opts: eye 0 睁 1 眨 2 笑眯 3 委屈 4 惊 ; mouth 0 小 1 开心 2 张嘴 3 抿 ; ear 0..2 ; tail 0..3 ; leg 0 站 1 左抬 2 右抬 3 起跳收腿 ; dy 整体上下
function frame(o){o=o||{};if(o.side)return frameSide(o);const b=mk(32,32);const dy=(o.dy|0)+(o.sit?2:0),leg=o.leg|0,tl=o.tail|0,ear=o.ear|0;
 // 尾巴（后层）
 const tx=[0,1,2,1][tl%4],ty=[0,-1,0,1][tl%4];
 ell(b,27+tx*.5,19+dy+ty,4.5,8.5,(x,y)=>y>22+dy?'C':(y>17+dy?'S':'P'));
 ell(b,27+tx*.5,23+dy+ty,3,4,'C');
 tri(b,[[27+tx,9+dy+ty],[30+tx,11+dy+ty],[28+tx,13+dy+ty]],'P');
 // 垂耳（后层）
 const ly=[0,1,0][ear%3]+dy, lx=[0,0,-1][ear%3];
 ell(b,6+lx,16+ly,2.7,8,(x,y)=>y>20+ly?'P':'C');ell(b,6.5+lx,16+ly,1.2,6,(x,y)=>y>19+ly?'P':'K');
 ell(b,26-lx,16+ly,2.7,8,(x,y)=>y>20+ly?'P':'C');ell(b,25.5-lx,16+ly,1.2,6,(x,y)=>y>19+ly?'P':'K');
 // 腿
 const l1=leg===1?-2:(leg===3?-3:0),l2=leg===2?-2:(leg===3?-3:0);
 if(o.sit){ell(b,11.5,27.6,3.2,2,(x,y)=>x<10?'P':'C');ell(b,20.5,27.6,3.2,2,(x,y)=>x>22?'P':'C')}
 else{ell(b,12.5,27.5+dy+l1,2.2,2.4,(x,y)=>y>=28+dy+l1?'P':'C');ell(b,19.5,27.5+dy+l2,2.2,2.4,(x,y)=>y>=28+dy+l2?'P':'C');}
 // 身体
 ell(b,16,23+dy,6,5,(x,y)=>y>26+dy?'S':'C');
 // 围巾
 tri(b,[[11,17+dy],[21,17+dy],[16,23+dy]],'G');
 put(b,15,20+dy,'g');put(b,16,20+dy,'g');put(b,16,21+dy,'g');
 tri(b,[[20,17+dy],[24,16+dy],[23,20+dy]],'G');put(b,22,18+dy,'g');
 // v3 伸懒腰：双臂举过头（在头后面）
 if(o.stretch){for(const sg of[-1,1]){const sx=16+sg*5,ex=16+sg*11;thick(b,sx,19+dy,ex,3+dy,2.3,'O');thick(b,sx,19+dy,ex,3+dy,1.3,'C');ell(b,ex,2.5+dy,2.6,2.4,'O');ell(b,ex,2.5+dy,1.7,1.5,'C');put(b,ex,2+dy,'P')}}
 // 头
 tri(b,[[7,7+dy],[10,1+dy],[14,5+dy]],'C');tri(b,[[9,6+dy],[10,3+dy],[12,5+dy]],'P');
 tri(b,[[25,7+dy],[22,1+dy],[18,5+dy]],'C');tri(b,[[23,6+dy],[22,3+dy],[20,5+dy]],'P');
 ell(b,16,11+dy,9.5,7.5,(x,y)=>y>16+dy?'S':'C');
 // 叶子
 tri(b,[[18,3+dy],[21,0+dy],[22,3+dy]],'G');put(b,20,2+dy,'g');tri(b,[[17,2+dy],[17,5+dy],[19,4+dy]],'g');
 // 额前毛
 put(b,15,5+dy,'S');put(b,16,5+dy,'S');put(b,13,6+dy,'S');
 // 脸
 const ey=11+dy;
 function eye(x,st){
  if(st===1){put(b,x,ey+1,'E');put(b,x+1,ey+1,'E');put(b,x+2,ey+1,'E');return}
  if(st===2){put(b,x,ey+1,'E');put(b,x+1,ey,'E');put(b,x+2,ey+1,'E');return}
  if(st===5){const L=x<16;if(L){put(b,x,ey-1,'E');put(b,x+1,ey-1,'E');put(b,x+2,ey,'E');put(b,x,ey+1,'E');put(b,x+1,ey+1,'E')}else{put(b,x+1,ey-1,'E');put(b,x+2,ey-1,'E');put(b,x,ey,'E');put(b,x+1,ey+1,'E');put(b,x+2,ey+1,'E')}return}
  if(st===6){for(let i=0;i<3;i++){put(b,x+i,ey+1,'E');put(b,x+i,ey+2,'E')}put(b,x+1,ey+2,'B');put(b,x,ey,'N');put(b,x+2,ey,'N');return}
  if(st===3){put(b,x,ey+1,'E');put(b,x+1,ey+1,'E');put(b,x+2,ey,'E');put(b,x+1,ey+2,'B');put(b,x,ey-1,'N');return}
  for(let j=0;j<4;j++){put(b,x,ey-1+j,'E');put(b,x+1,ey-1+j,j===3?'B':'E');put(b,x+2,ey-1+j,'E')}
  put(b,x+1,ey,'W');put(b,x+1,ey+1,'B');put(b,x+1,ey+2,'B');
  if(st===4){put(b,x+1,ey-2,'E')}
 }
 eye(9,o.eye|0);eye(20,o.eye|0);
 put(b,8,14+dy,'T');put(b,9,14+dy,'T');put(b,10,14+dy,'K');put(b,21,14+dy,'T');put(b,22,14+dy,'T');put(b,23,14+dy,'K');
 put(b,15,13+dy,'N');put(b,16,13+dy,'N');
 const m=o.mouth|0;
 if(m===0){put(b,15,15+dy,'E');put(b,16,15+dy,'E')}
 else if(m===1){put(b,14,14+dy,'E');put(b,15,15+dy,'E');put(b,16,15+dy,'E');put(b,17,14+dy,'E')}
 else if(m===2){put(b,14,14+dy,'E');put(b,15,14+dy,'E');put(b,16,14+dy,'E');put(b,17,14+dy,'E');put(b,15,15+dy,'K');put(b,16,15+dy,'K');put(b,15,16+dy,'E');put(b,16,16+dy,'E');put(b,14,15+dy,'E');put(b,17,15+dy,'E')}
 else {put(b,15,15+dy,'E');put(b,16,15+dy,'E');put(b,14,16+dy,'E');put(b,17,16+dy,'E')}
 if(o.blush){for(const bx of[7,20])for(let i=0;i<4;i++){put(b,bx+i,14+dy,'T');put(b,bx+i,15+dy,i%3?'K':'T')}}
 // v3 爪子：1/2 挥手两帧（右侧），3 胸前握伞柄
 if(o.paw===1||o.paw===2){const px2=o.paw===1?27:28,py=o.paw===1?17:13;thick(b,21,21+dy,px2,py+dy+2,2.2,'O');thick(b,21,21+dy,px2,py+dy+2,1.2,'C');ell(b,px2,py+dy,2.8,2.8,'O');ell(b,px2,py+dy,1.9,1.9,'C');put(b,px2,py+dy,'P');put(b,px2-1,py+dy-1,'P')}
 if(o.paw===3){ell(b,20,21+dy,2.6,2.4,'O');ell(b,20,21+dy,1.7,1.5,'C');put(b,20,21+dy,'S')}
 outline(b,'O');return b}

// ---- v2 侧身（朝右），opts: side:1, step 0..5 走路相位, run:1 跑, air:1 上升 2 下落, crouch:1 蓄力/落地, eye, mouth, ear 0..2, tail 0..2, dy
function frameSide(o){const b=mk(32,32);const st=(o.step|0)%6;const run=!!o.run,air=o.air|0,cr=!!o.crouch;
 let dy=(o.dy|0)+(cr?2:0);const ph=st/6*Math.PI*2;
 const amp=run?3.6:2.4,lift=run?2.2:1.4;
 let fdx=Math.round(amp*Math.sin(ph)),fl=Math.max(0,Math.round(lift*Math.cos(ph)));
 let bdx=Math.round(-amp*Math.sin(ph)),bl=Math.max(0,Math.round(-lift*Math.cos(ph)));
 if(air===1){fdx=3;fl=3;bdx=-3;bl=1}else if(air===2){fdx=2;fl=0;bdx=-2;bl=1}
 if(cr){fdx=1;fl=0;bdx=-1;bl=0}
 const tl=(o.tail|0)%3,ear=(o.ear|0)%3,lean=run?1:0;
 // 远侧腿（暗）
 ell(b,19+fdx*-1+1,27.5+dy-bl,2,2.3,'S');ell(b,11+bdx*-1+1,27.5+dy-fl,2,2.3,'S');
 // 尾巴：后上方大毛尾
 const tx=[0,-1,-2][tl],ty=[0,-1,0][tl];
 for(let y=10;y<=27;y++){const t=(y-10)/17;const cx=6.5+tx*(1-t)+t*2+lean*-1,rx=1.8+4*Math.sin(Math.PI*Math.min(1,t*1.15));
  for(let x=Math.floor(cx-rx);x<=cx+rx;x++)put(b,x,y+dy+ty,y<15?'P':(y<20?'S':'C'))}
 tri(b,[[4+tx,12+dy+ty],[6+tx,7+dy+ty],[9+tx,12+dy+ty]],'P');
 // 身体
 ell(b,15.5+lean,23+dy,7,5,(x,y)=>y>25+dy?'S':'C');
 // 远耳（尖）
 tri(b,[[11,7+dy],[12,1+dy],[15,5+dy]],'S');
 // 头
 const hx=17+lean;
 ell(b,hx,11.5+dy,8.6,7.3,(x,y)=>y>16+dy?'S':'C');
 ell(b,hx+7,14+dy,3.4,2.6,(x,y)=>y>15+dy?'S':'C');
 // 近耳
 tri(b,[[13+lean,6+dy],[16+lean,0+dy],[19+lean,5+dy]],'C');tri(b,[[15+lean,5+dy],[16+lean,2+dy],[17+lean,5+dy]],'P');
 // 叶子
 tri(b,[[19+lean,4+dy],[22+lean,1+dy],[23+lean,4+dy]],'G');put(b,21+lean,3+dy,'g');tri(b,[[18+lean,2+dy],[18+lean,5+dy],[20+lean,4+dy]],'g');
 // 额前毛
 put(b,18+lean,5+dy,'S');put(b,19+lean,5+dy,'S');
 // 鼻嘴
 put(b,hx+10,13+dy,'N');put(b,hx+10,14+dy,'N');put(b,hx+9,13+dy,'N');
 const m=o.mouth|0,mx=hx+8,my=16+dy;
 if(m===0){put(b,mx,my,'E')}
 else if(m===1){put(b,mx-1,my,'E');put(b,mx,my+1,'E');put(b,mx+1,my,'E')}
 else if(m===2){put(b,mx-1,my,'E');put(b,mx,my,'E');put(b,mx+1,my,'E');put(b,mx,my+1,'K');put(b,mx-1,my+1,'E');put(b,mx+1,my+1,'E');put(b,mx,my+2,'E')}
 else {put(b,mx,my,'E');put(b,mx+1,my,'E')}
 // 眼
 const ex=hx+3,ey=11+dy,es=o.eye|0;
 if(es===1){put(b,ex,ey+1,'E');put(b,ex+1,ey+1,'E');put(b,ex+2,ey+1,'E')}
 else if(es===2){put(b,ex,ey+1,'E');put(b,ex+1,ey,'E');put(b,ex+2,ey+1,'E')}
 else if(es===3){put(b,ex,ey+1,'E');put(b,ex+1,ey+1,'E');put(b,ex+2,ey,'E');put(b,ex+1,ey+2,'B');put(b,ex+2,ey-1,'N')}
 else{for(let j=0;j<4;j++){put(b,ex,ey-1+j,'E');put(b,ex+1,ey-1+j,j===3?'B':'E');put(b,ex+2,ey-1+j,'E')}put(b,ex+1,ey,'W');put(b,ex+1,ey+1,'B');put(b,ex+1,ey+2,'B');if(es===4)put(b,ex+1,ey-2,'E')}
 put(b,ex+1,ey+4,'T');put(b,ex+2,ey+4,'T');put(b,ex+3,ey+4,'K');
 // 围巾 + 飘带
 tri(b,[[11+lean,17+dy],[22+lean,17+dy],[17+lean,22+dy]],'G');put(b,17+lean,19+dy,'g');put(b,16+lean,19+dy,'g');
 const sw=[0,1,2][(st+(run?1:0))%3]+(run||air?2:0);
 tri(b,[[12+lean,17+dy],[7-sw+lean,16+dy-(sw>>1)],[8-sw+lean,20+dy]],'G');put(b,9-sw+lean,18+dy,'g');
 // 近侧垂耳：从头侧垂下，随动作向后摆
 const swing=(air===2?4.5:(air===1?2.5:[0,1.3,2.6][ear]))+(run?2:0);
 { const rows=[];for(let y=8;y<=20;y++){const t=(y-8)/12;rows.push([y,12.5+lean-swing*t*t*1.2,1.1+1.4*Math.sin(Math.PI*Math.min(1,t*.95+.12))])}
  for(const[y,cx,rx]of rows){const x0=Math.round(cx-rx),x1=Math.round(cx+rx);for(let x=x0;x<=x1;x++)put(b,x,y+dy,(y>10&&y<18&&x===Math.round(cx))?'K':(y>17?'P':'C'));
   if(y>9){put(b,x0-1,y+dy,'O');put(b,x1+1,y+dy,'O')}}
  const l=rows[rows.length-1];for(let x=Math.round(l[1]-l[2]);x<=Math.round(l[1]+l[2]);x++)put(b,x,21+dy,'O');}
 // 近侧腿
 ell(b,19+fdx+lean,27.5+dy-fl,2.2,2.4,(x,y)=>y>=28+dy-fl?'P':'C');ell(b,11.5+bdx,27.5+dy-bl,2.2,2.4,(x,y)=>y>=28+dy-bl?'P':'C');
 outline(b,'O');return b}
// 动画姿态表：Fox.pose(name,t) -> opts（t 为帧计数，按 12fps 设计）
const POSE={
 idle:t=>({eye:(t%40)<2?1:0,tail:(t>>3)%4,ear:(t>>4)%3}),
 walk:t=>({side:1,step:t%6,ear:[0,1,2,1,0,1][t%6],tail:[0,1,2,2,1,0][t%6],dy:[0,-1,-1,0,-1,-1][t%6],eye:(t%36)<2?1:0}),
 run:t=>({side:1,run:1,step:t%6,ear:2,tail:(t>>1)%3,dy:[0,-1,-2,0,-1,-2][t%6],mouth:1}),
 jumpUp:t=>({side:1,air:1,tail:2,mouth:1,eye:0}),
 jumpDown:t=>({side:1,air:2,tail:1,mouth:2,eye:4}),
 crouch:t=>({side:1,crouch:1,tail:0,ear:1}),
 sit:t=>({sit:1,eye:(t%44)<2?1:0,tail:(t>>4)%4,ear:(t>>5)%3}),
 happy:t=>({eye:2,mouth:1,ear:(t>>1)%3,tail:(t>>1)%4,dy:[0,-2,-3,-2][(t>>1)%4],leg:[0,3,3,0][(t>>1)%4]}),
 surprised:t=>({eye:4,mouth:2,ear:1,tail:1,dy:t<3?-2:0,leg:t<3?3:0}),
 sleep:t=>({sit:1,eye:1,mouth:0,ear:1,tail:0,dy:(t>>4)%2}),
 wave:t=>({eye:2,mouth:1,paw:1+((t>>2)%2),ear:(t>>2)%3,tail:(t>>2)%4}),
 shy:t=>({eye:6,mouth:3,blush:1,ear:1,tail:(t>>3)%4,dy:(t>>3)%2}),
 sneeze:t=>t<8?{eye:1,mouth:2,ear:0,dy:-1,tail:1}:(t<14?{eye:5,mouth:2,ear:2,dy:1,tail:3,leg:0}:{eye:1,mouth:3,ear:1,blush:1}),
 stretch:t=>t<18?{stretch:1,eye:1,mouth:2,dy:-1,tail:(t>>2)%4}:{eye:2,mouth:1,tail:(t>>2)%4},
 umbrella:t=>({paw:3,eye:(t%40)<2?1:0,tail:(t>>3)%4,ear:(t>>4)%3})
};
function pose(n,t){return (POSE[n]||POSE.idle)(t|0)}
const cache={};
function sprite(o){const k=JSON.stringify(o||{});if(cache[k])return cache[k];const b=frame(o);const c=document.createElement('canvas');c.width=b.w;c.height=b.h;const x=c.getContext('2d');
 for(let y=0;y<b.h;y++)for(let i=0;i<b.w;i++){const v=b.a[y*b.w+i];if(v){x.fillStyle=PAL[v];x.fillRect(i,y,1,1)}}
 return cache[k]=c}
// 绘制：x,y 为脚底中心的逻辑像素位置，face=1 朝右 -1 朝左
function draw(ctx,x,y,o,face){const s=sprite(o);x=Math.round(x);y=Math.round(y);ctx.save();if(face<0){ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(s,-16,y-30)}else ctx.drawImage(s,x-16,y-30);ctx.restore()}
g.Fox={PAL,sprite,draw,frame,frameSide,pose,POSE,mk,put,ell,tri,thick,outline,v:3};
})(window);
