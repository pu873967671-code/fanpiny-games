// 狐兔像素精灵 32x32，纯代码逐像素生成：形状填充 + 自动深色描边，固定调色板，无抗锯齿
(function(g){
const PAL={O:'#6b3f2e',C:'#fff1da',S:'#f1cfa6',P:'#f8a874',K:'#f59aa0',E:'#35201a',B:'#b8672a',W:'#ffffff',G:'#85b83f',g:'#55872a',T:'#f27f87',N:'#b05a45',A:'#9a5d34'};
function mk(w,h){return {w,h,a:new Array(w*h).fill(null)}}
function put(b,x,y,c){x|=0;y|=0;if(x>=0&&y>=0&&x<b.w&&y<b.h)b.a[y*b.w+x]=c}
function ell(b,cx,cy,rx,ry,c,cond){for(let y=Math.floor(cy-ry-1);y<=cy+ry+1;y++)for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1&&(!cond||cond(x,y)))put(b,x,y,typeof c==='function'?c(x,y):c)}}
function tri(b,p,c){const[[x1,y1],[x2,y2],[x3,y3]]=p;const mnx=Math.min(x1,x2,x3),mxx=Math.max(x1,x2,x3),mny=Math.min(y1,y2,y3),mxy=Math.max(y1,y2,y3);
 for(let y=mny;y<=mxy;y++)for(let x=mnx;x<=mxx;x++){const px=x+.5,py=y+.5;const d=(a,b,c2,d2,e,f)=>(a-e)*(d2-f)-(c2-e)*(b-f);
 const s1=d(px,py,x1,y1,x2,y2),s2=d(px,py,x2,y2,x3,y3),s3=d(px,py,x3,y3,x1,y1);const neg=s1<0||s2<0||s3<0,pos=s1>0||s2>0||s3>0;if(!(neg&&pos))put(b,x,y,c)}}
function outline(b,col){const o=b.a.slice();for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){if(b.a[y*b.w+x])continue;let n=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<b.w&&yy<b.h&&b.a[yy*b.w+xx]&&b.a[yy*b.w+xx]!=='O')n=true}if(n)o[y*b.w+x]=col}b.a=o}
// opts: eye 0 睁 1 眨 2 笑眯 3 委屈 4 惊 ; mouth 0 小 1 开心 2 张嘴 3 抿 ; ear 0..2 ; tail 0..3 ; leg 0 站 1 左抬 2 右抬 3 起跳收腿 ; dy 整体上下
function frame(o){o=o||{};const b=mk(32,32);const dy=o.dy|0,leg=o.leg|0,tl=o.tail|0,ear=o.ear|0;
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
 ell(b,12.5,27.5+dy+l1,2.2,2.4,(x,y)=>y>=28+dy+l1?'P':'C');ell(b,19.5,27.5+dy+l2,2.2,2.4,(x,y)=>y>=28+dy+l2?'P':'C');
 // 身体
 ell(b,16,23+dy,6,5,(x,y)=>y>26+dy?'S':'C');
 // 围巾
 tri(b,[[11,17+dy],[21,17+dy],[16,23+dy]],'G');
 put(b,15,20+dy,'g');put(b,16,20+dy,'g');put(b,16,21+dy,'g');
 tri(b,[[20,17+dy],[24,16+dy],[23,20+dy]],'G');put(b,22,18+dy,'g');
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
 outline(b,'O');return b}
const cache={};
function sprite(o){const k=JSON.stringify(o||{});if(cache[k])return cache[k];const b=frame(o);const c=document.createElement('canvas');c.width=b.w;c.height=b.h;const x=c.getContext('2d');
 for(let y=0;y<b.h;y++)for(let i=0;i<b.w;i++){const v=b.a[y*b.w+i];if(v){x.fillStyle=PAL[v];x.fillRect(i,y,1,1)}}
 return cache[k]=c}
// 绘制：x,y 为脚底中心的逻辑像素位置，face=1 朝右 -1 朝左
function draw(ctx,x,y,o,face){const s=sprite(o);x=Math.round(x);y=Math.round(y);ctx.save();if(face<0){ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(s,-16,y-30)}else ctx.drawImage(s,x-16,y-30);ctx.restore()}
g.Fox={PAL,sprite,draw,frame,mk,put,ell,tri,outline};
})(window);
