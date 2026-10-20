const {createCanvas}=require('@napi-rs/canvas');
const fs=require('node:fs');
for(const [size,file] of [[192,'icon-192.png'],[512,'icon-512.png'],[180,'apple-touch-icon.png']]) {
  const canvas=createCanvas(size,size),c=canvas.getContext('2d');c.scale(size/512,size/512);
  c.fillStyle='#f8f4eb';c.fillRect(0,0,512,512);
  c.fillStyle='#476d54';c.beginPath();c.roundRect(100,210,265,170,50);c.fill();c.lineWidth=22;c.strokeStyle='#476d54';c.beginPath();c.arc(365,276,47,-Math.PI/2,Math.PI/2);c.stroke();
  c.fillStyle='#b58d64';c.beginPath();c.ellipse(230,400,150,14,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#789c70';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(255,195);c.quadraticCurveTo(270,146,253,100);c.stroke();
  c.fillStyle='#8cab7c';c.beginPath();c.ellipse(225,142,38,16,.6,0,Math.PI*2);c.fill();c.fillStyle='#476d54';c.beginPath();c.ellipse(280,115,36,15,-.6,0,Math.PI*2);c.fill();
  c.fillStyle='#e4d4ae';c.beginPath();c.ellipse(230,218,99,13,0,0,Math.PI*2);c.fill();
  fs.writeFileSync(file,canvas.toBuffer('image/png'));
}
