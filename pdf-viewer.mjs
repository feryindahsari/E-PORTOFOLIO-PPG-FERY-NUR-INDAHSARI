import * as pdfjs from './assets/pdfjs/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = './assets/pdfjs/pdf.worker.min.mjs';
const params=new URLSearchParams(location.search);
const file=params.get('file')||'';
const pageInput=document.getElementById('page');
const zoom=document.getElementById('zoom');
const canvas=document.getElementById('canvas');
const viewport=document.getElementById('viewport');
const message=document.getElementById('message');
const prev=document.getElementById('prev');
const next=document.getElementById('next');
let pdf=null,pageNumber=1,renderTask=null,serial=0;
async function render(){
 if(!pdf)return;
 const current=++serial;
 if(renderTask){renderTask.cancel();try{await renderTask.promise;}catch{}renderTask=null;}
 const page=await pdf.getPage(pageNumber);
 if(current!==serial)return;
 const base=page.getViewport({scale:1});
 const available=viewport.clientWidth-(innerWidth<=420?16:28);
 const scale=zoom.value==='fit'?Math.max(.15,available/base.width):Number(zoom.value);
 const view=page.getViewport({scale});
 const ratio=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.floor(view.width*ratio);canvas.height=Math.floor(view.height*ratio);
 canvas.style.width=view.width+'px';canvas.style.height=view.height+'px';
 canvas.hidden=false;message.hidden=true;
 canvas.setAttribute('aria-label','Halaman '+pageNumber+' dari '+pdf.numPages);
 pageInput.value=pageNumber;pageInput.disabled=false;pageInput.max=pdf.numPages;
 document.getElementById('pages').textContent='/ '+pdf.numPages;
 prev.disabled=pageNumber===1;next.disabled=pageNumber===pdf.numPages;
 renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport:view,transform:ratio!==1?[ratio,0,0,ratio,0,0]:null});
 try{await renderTask.promise;}catch(error){if(error.name!=='RenderingCancelledException')throw error;}
}
async function go(number){
 if(!pdf)return;
 pageNumber=Math.min(pdf.numPages,Math.max(1,Number(number)||1));
 viewport.scrollTop=0;
 await render();
}
prev.addEventListener('click',()=>go(pageNumber-1));
next.addEventListener('click',()=>go(pageNumber+1));
pageInput.addEventListener('change',()=>go(pageInput.value));
pageInput.addEventListener('keydown',event=>{if(event.key==='Enter')go(pageInput.value);});
zoom.addEventListener('change',render);
let resizeTimer;
new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(zoom.value==='fit')render();},120);}).observe(viewport);
document.addEventListener('keydown',event=>{if(event.target.matches('input,select'))return;if(event.key==='ArrowRight')go(pageNumber+1);if(event.key==='ArrowLeft')go(pageNumber-1);});
try{
 const url=new URL(file,location.href);
 const allowedPrefix=new URL('./files/',location.href).pathname;
 if(url.origin!==location.origin||!url.pathname.startsWith(allowedPrefix)||!url.pathname.toLowerCase().endsWith('.pdf'))throw Error('Berkas PDF tidak dikenali.');
 document.getElementById('download').href=url.href;
 pdf=await pdfjs.getDocument({url:url.href,cMapUrl:'./assets/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'./assets/pdfjs/standard_fonts/',wasmUrl:'./assets/pdfjs/wasm/'}).promise;
 document.title=decodeURIComponent(url.pathname.split('/').at(-1));
 pageNumber=Math.min(pdf.numPages,Math.max(1,Number(params.get('page'))||1));
 await render();
}catch(error){message.hidden=false;message.textContent='Pratinjau belum dapat dimuat. Gunakan “Unduh PDF” untuk membuka dokumennya. '+error.message;canvas.hidden=true;}
