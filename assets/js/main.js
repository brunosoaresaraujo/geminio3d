/* ---------- fallback do logo: se logo.png não existir, mostra o wordmark ---------- */
(function(){
  var img=document.getElementById('logo'),brand=document.getElementById('brand');
  img.addEventListener('error',function(){brand.classList.add('no-logo')});
  if(img.complete && img.naturalWidth===0) brand.classList.add('no-logo');
})();

/* ---------- reveal on scroll ---------- */
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(en){
    en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}});
  },{threshold:.15});
  els.forEach(function(e){io.observe(e)});
})();

/* ---------- spotlight nos cards ---------- */
document.querySelectorAll('.card').forEach(function(c){
  c.addEventListener('pointermove',function(e){
    var r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');
    c.style.setProperty('--my',(e.clientY-r.top)+'px');
  });
});

/* ---------- Hero 3D: modelos originais em wireframe sendo "impressos" camada por camada ---------- */
(function(){
  var cv=document.getElementById('stage');if(!cv)return;
  var ctx=cv.getContext('2d'),W,H,dpr;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAXL=.16;

  /* ---- primitivas: tudo vira lista de segmentos curtos [x1,y1,z1,x2,y2,z2] (y para cima) ---- */
  function seg(o,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],n=Math.max(1,Math.ceil(Math.hypot(dx,dy,dz)/MAXL));
    for(var i=0;i<n;i++){var t0=i/n,t1=(i+1)/n;o.push([a[0]+dx*t0,a[1]+dy*t0,a[2]+dz*t0,a[0]+dx*t1,a[1]+dy*t1,a[2]+dz*t1])}}
  function poly(o,p,closed){for(var i=0;i<p.length-(closed?0:1);i++)seg(o,p[i],p[(i+1)%p.length])}
  function box(o,c,s,div){div=div||1;
    var x0=c[0]-s[0]/2,x1=c[0]+s[0]/2,y0=c[1]-s[1]/2,y1=c[1]+s[1]/2,z0=c[2]-s[2]/2,z1=c[2]+s[2]/2;
    for(var k=0;k<=div;k++){var y=y0+(y1-y0)*k/div;poly(o,[[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],true)}
    [[x0,z0],[x1,z0],[x1,z1],[x0,z1]].forEach(function(p){seg(o,[p[0],y0,p[1]],[p[0],y1,p[1]])})}
  var AX={x:0,y:1,z:2};
  function ring(c,r,axis,n){var p=[];for(var i=0;i<n;i++){var a=i/n*6.2832,u=Math.cos(a)*r,v=Math.sin(a)*r;
    p.push(axis==='y'?[c[0]+u,c[1],c[2]+v]:axis==='z'?[c[0]+u,c[1]+v,c[2]]:[c[0],c[1]+u,c[2]+v])}return p}
  function cyl(o,c,r,len,axis,n,rings,spokes){rings=rings||2;var rs=[];
    for(var k=0;k<rings;k++){var cc=c.slice();cc[AX[axis]]+=-len/2+len*k/(rings-1);var rg=ring(cc,r,axis,n);poly(o,rg,true);rs.push(rg)}
    for(var i=0;i<n;i+=(n>12?2:1))seg(o,rs[0][i],rs[rings-1][i]);
    if(spokes){var st=n/spokes;[0,rings-1].forEach(function(k){var cc=c.slice();cc[AX[axis]]+=k?len/2:-len/2;
      for(var i=0;i<n;i+=st)seg(o,cc,rs[k][i])})}}
  function sphere(o,c,r,lat,lon){
    for(var i=1;i<lat;i++){var a=Math.PI*i/lat-Math.PI/2;poly(o,ring([c[0],c[1]+Math.sin(a)*r,c[2]],Math.cos(a)*r,'y',lon),true)}
    for(var j=0;j<lon;j++){var b=j/lon*6.2832,m=[];
      for(var i=0;i<=lat;i++){var a=Math.PI*i/lat-Math.PI/2;m.push([c[0]+Math.cos(a)*r*Math.cos(b),c[1]+Math.sin(a)*r,c[2]+Math.cos(a)*r*Math.sin(b)])}
      poly(o,m,false)}}

  /* ---- modelo 1: mascote robô (design próprio) ---- */
  function robot(){var o=[];
    box(o,[0,1.55,0],[1.5,1.1,1.2],3);                         // cabeça
    box(o,[-.35,1.62,.61],[.38,.2,.02]);box(o,[.35,1.62,.61],[.38,.2,.02]); // olhos/visor
    cyl(o,[0,2.25,0],.05,.3,'y',6);sphere(o,[0,2.5,0],.14,4,8);  // antena
    cyl(o,[0,.88,0],.22,.24,'y',12);                             // pescoço
    box(o,[0,0,0],[1.9,1.5,1.1],4);                              // tronco
    cyl(o,[0,.1,.56],.3,.04,'z',16,2,4);                         // luz do peito
    [-1,1].forEach(function(s){
      sphere(o,[s*1.17,.55,0],.24,5,10);                         // ombro
      cyl(o,[s*1.25,-.05,0],.17,1,'y',10,4);                     // braço
      sphere(o,[s*1.25,-.72,0],.26,5,10);                        // mão
      box(o,[s*.45,-1.3,0],[.55,1,.6],3);                        // perna
      box(o,[s*.45,-1.92,.12],[.7,.28,.9]);                      // pé
    });return o}

  /* ---- modelo 2: carro esportivo (design próprio) ---- */
  function car(){var o=[];
    var prof=[[-2.25,.35],[-2.3,.78],[-1.7,.98],[-.75,1.08],[-.25,1.6],[.75,1.62],[1.3,1.1],[2.15,.9],[2.3,.55],[2.2,.32]];
    var zs=[-.95,-.5,0,.5,.95];
    var secs=zs.map(function(z){return prof.map(function(p){return [p[0],p[1],p[1]>1.2?z*.8:z]})});
    [0,2,4].forEach(function(k){poly(o,secs[k],true)});
    for(var i=0;i<prof.length;i++)poly(o,secs.map(function(s){return s[i]}),false);
    [-1,1].forEach(function(s){
      poly(o,[[-.65,1.12,s*.93],[-.2,1.52,s*.78],[.25,1.52,s*.78],[.25,1.12,s*.93]],true);   // janela 1
      poly(o,[[.38,1.12,s*.93],[.38,1.52,s*.78],[.72,1.52,s*.78],[1.12,1.12,s*.93]],true);   // janela 2
      [-1.4,1.45].forEach(function(x){cyl(o,[x,.42,s*.88],.42,.32,'z',16,3,4);cyl(o,[x,.42,s*.88],.2,.33,'z',12)}); // rodas
      box(o,[2.22,.72,s*.62],[.08,.14,.4]);box(o,[-2.27,.68,s*.62],[.08,.12,.42]);              // faróis/lanternas
    });
    box(o,[-2.05,1.12,0],[.35,.05,1.7]);                                                         // aerofólio
    return o}

  /* ---- modelo 3: peça técnica (nó toroidal) ---- */
  function knot(){var o=[],N=110,M=8,R=.34,P=2,Q=3,h=1e-3,pts=[];
    function k(t){var r=Math.cos(Q*t)+2;return [r*Math.cos(P*t),-Math.sin(Q*t),r*Math.sin(P*t)]}
    function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
    function cr(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
    function nm(a){var l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]}
    for(var i=0;i<N;i++){var t=i/N*6.2832,p0=k(t),p1=k(t+h),pm=k(t-h);
      var T=sub(p1,pm),A=[p1[0]-2*p0[0]+pm[0],p1[1]-2*p0[1]+pm[1],p1[2]-2*p0[2]+pm[2]],B=nm(cr(T,A)),Nn=nm(cr(B,T)),rg=[];
      for(var j=0;j<M;j++){var a=j/M*6.2832,c=Math.cos(a)*R,s=Math.sin(a)*R;rg.push([p0[0]+Nn[0]*c+B[0]*s,p0[1]+Nn[1]*c+B[1]*s,p0[2]+Nn[2]*c+B[2]*s])}
      pts.push(rg)}
    for(var i=0;i<N;i++){poly(o,pts[i],true);for(var j=0;j<M;j++)seg(o,pts[i][j],pts[(i+1)%N][j])}
    return o}

  /* ---- centraliza, escala e pré-calcula altura de cada segmento ---- */
  function fit(o,size){var mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
    o.forEach(function(s){for(var i=0;i<6;i++){var a=i%3;if(s[i]<mn[a])mn[a]=s[i];if(s[i]>mx[a])mx[a]=s[i]}});
    var c=[(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2],k=size/Math.max(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]);
    var y0=(mn[1]-c[1])*k,y1=(mx[1]-c[1])*k;
    o.forEach(function(s){for(var i=0;i<6;i++)s[i]=(s[i]-c[i%3])*k;s[6]=(s[1]+s[4])/2;s[7]=(s[6]-y0)/(y1-y0)});
    return {segs:o,y0:y0,y1:y1}}

  var shapes=[
    Object.assign(fit(robot(),4.6),{name:'MASCOTE ROBÔ',tilt:.22}),
    Object.assign(fit(car(),5.6),{name:'CARRO ESPORTIVO',tilt:.42}),
    Object.assign(fit(knot(),5.4),{name:'PEÇA TÉCNICA',tilt:.75})
  ];
  var BUILD=4.2,HOLD=3.4,OUT=1,CYCLE=BUILD+HOLD+OUT;

  var mx=0,my=0,tx=0,ty=0;
  window.addEventListener('pointermove',function(e){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5});
  function resize(){dpr=Math.min(devicePixelRatio||1,2);var r=cv.getBoundingClientRect();W=r.width;H=r.height;
    cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  addEventListener('resize',resize);resize();
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}

  function frame(ms){
    var time=reduce?BUILD+1:ms/1000;
    var idx=Math.floor(time/CYCLE)%shapes.length,local=time%CYCLE,S=shapes[idx];
    var prog=Math.min(1,local/BUILD),building=prog<1;
    var fade=local>BUILD+HOLD?1-(local-BUILD-HOLD)/OUT:1;
    var sweep=S.y0+(S.y1-S.y0+.15)*ease(prog);

    mx+=(tx-mx)*.04;my+=(ty-my)*.04;
    var ry=time*.35+mx*1.2,rx=S.tilt+my*.5;
    var cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
    var scale=Math.min(W*.9,H)*.125,cxp=W*.56,cyp=H*.5,fov=9;
    function P(x,y,z){var x1=x*cy+z*sy,z1=-x*sy+z*cy,y2=y*cx+z1*sx,z2=-y*sx+z1*cx,f=fov/(fov+z2);
      return [cxp+x1*scale*f,cyp-y2*scale*f,z2]}

    ctx.clearRect(0,0,W,H);ctx.lineWidth=1;ctx.lineCap='round';
    var segs=S.segs,sparks=[];
    for(var i=0;i<segs.length;i++){
      var s=segs[i],a=P(s[0],s[1],s[2]),b=P(s[3],s[4],s[5]);
      var printed=s[6]<sweep,depth=Math.min(1,Math.max(0,(a[2]+3)/6)),al;
      if(printed){var t=s[7];al=(.75-depth*.45)*fade;
        ctx.strokeStyle='rgba('+Math.round(34+183*t)+','+Math.round(211-141*t)+','+Math.round(238+t)+','+al.toFixed(3)+')';
      }else{al=.07*fade;ctx.strokeStyle='rgba(160,170,200,'+al.toFixed(3)+')'}
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
      if(building&&Math.abs(s[6]-sweep)<.07&&i%2===0)sparks.push(a);
    }

    if(building){ // "mesa"/camada de impressão
      ctx.strokeStyle='rgba(255,255,255,.14)';ctx.beginPath();
      for(var k=0;k<=48;k++){var an=k/48*6.2832,q=P(Math.cos(an)*3,sweep,Math.sin(an)*3);k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}
      ctx.stroke();
      sparks.forEach(function(q){ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(q[0],q[1],1.5,0,6.283);ctx.fill()});
    }

    // legenda estilo console de impressora
    ctx.font='500 11px "JetBrains Mono",monospace';ctx.textAlign='center';
    ctx.fillStyle='rgba(141,148,168,'+(.9*fade).toFixed(2)+')';
    ctx.fillText(building?'IMPRIMINDO · '+S.name+' · '+Math.round(prog*100)+'%':'PRONTO ✓ · '+S.name,cxp,cyp+scale*3.3);

    if(!reduce)requestAnimationFrame(frame);
  }
  if(reduce)frame(0);else requestAnimationFrame(frame);
})();

/* ---------- horário: aberto agora (fuso de Brasília) ---------- */
(function(){
  var st=document.getElementById('status');if(!st)return;
  var Y=document.getElementById('yr');
  var H={1:[9,18],2:[9,18],3:[9,18],4:[9,18],5:[9,18],6:[9,14]};
  function now(){var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'numeric',minute:'numeric',hour12:false,year:'numeric'})
    .formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
    return {d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),m:(+p.hour%24)*60+(+p.minute),y:p.year}}
  function fmt(h){return (h<10?'0':'')+h+'h'}
  function next(d,m){for(var i=0;i<8;i++){var dd=(d+i)%7,h=H[dd];if(h&&(i>0||m<h[0]*60))
    return (i===0?'hoje':i===1?'amanhã':['dom','seg','ter','qua','qui','sex','sáb'][dd])+' às '+fmt(h[0])}}
  function upd(){var n=now(),h=H[n.d],b=st.querySelector('b');if(Y)Y.textContent=n.y;
    document.querySelectorAll('#hours li').forEach(function(li){var r=li.dataset.d.split('-').map(Number);
      li.classList.toggle('today',r.length>1?n.d>=r[0]&&n.d<=r[1]:n.d===r[0])});
    if(h&&n.m>=h[0]*60&&n.m<h[1]*60){st.className='status open';b.textContent='Aberto agora · até '+fmt(h[1])}
    else{st.className='status closed';b.textContent='Fechado · abre '+next(n.d,n.m)}}
  upd();setInterval(upd,60000);
})();

/* ---------- botão flutuante do WhatsApp aparece após o hero ---------- */
(function(){
  var f=document.querySelector('.wa-float');if(!f)return;
  function chk(){f.classList.toggle('show',scrollY>innerHeight*.6)}
  addEventListener('scroll',chk,{passive:true});chk();
})();

/* ---------- depoimentos: troca automática com barra de "impressão" ---------- */
(function(){
  var root=document.getElementById('tst');if(!root)return;
  var slides=root.querySelectorAll('.tst-slide'),tabs=root.querySelectorAll('.tst-tab'),
      bar=document.getElementById('tstBar'),pct=document.getElementById('tstPct');
  var DUR=7000,i=0,t0=performance.now(),paused=false,elapsed=0;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go(n){i=(n+slides.length)%slides.length;
    slides.forEach(function(s,k){s.classList.toggle('active',k===i)});
    tabs.forEach(function(b,k){b.classList.toggle('active',k===i);b.setAttribute('aria-selected',k===i)});
    elapsed=0;t0=performance.now()}
  tabs.forEach(function(b,k){b.addEventListener('click',function(){go(k)})});
  root.addEventListener('pointerenter',function(){paused=true;elapsed+=performance.now()-t0});
  root.addEventListener('pointerleave',function(){paused=false;t0=performance.now()});
  var sx=null;root.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  root.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)go(i+(dx<0?1:-1));sx=null});
  function tick(now){var p=Math.min(1,(paused?elapsed:elapsed+now-t0)/DUR);
    bar.style.width=(p*100)+'%';pct.textContent='CAMADA '+String(Math.round(p*240)).padStart(3,'0')+' / 240';
    if(p>=1&&!paused&&!reduce)go(i+1);requestAnimationFrame(tick)}
  go(0);requestAnimationFrame(tick);
})();
