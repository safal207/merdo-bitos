// Same official product photo only, never substitute another product.
const base="https://atelier-23.ru/wp-content/";
export function photoCandidates(path){
 if(!/^\d{4}\/\d{2}\/[A-Za-z0-9_-]+-300x400\.jpg$/.test(path))return [];
 const large=path.replace(/-300x400\.jpg$/,"-600x800.jpg");
 const full=path.replace(/-300x400\.jpg$/,"-960x1280.jpg");
 return [base+"uploads/"+path,base+"webp-express/webp-images/uploads/"+large+".webp",base+"uploads/"+large,base+"uploads/"+full];
}
export function attachPhoto(img,path,{onFailure=()=>{},onSuccess=()=>{},timeout=5000}={}){
 const candidates=photoCandidates(path);
 let index=0,timer=null,done=false;
 const clean=()=>{clearTimeout(timer);img.removeEventListener("load",loaded);img.removeEventListener("error",failed)};
 function finish(ok){if(done)return;done=true;clean();if(img.isConnected)(ok?onSuccess:onFailure)()}
 function loaded(){if(img.naturalWidth>0)finish(true);else failed()}
 function failed(){
  clearTimeout(timer);
  if(done)return;
  if(!img.isConnected){done=true;clean();return}
  if(++index>=candidates.length){finish(false);return}
  start();
 }
 function start(){
  img.src=candidates[index];
  timer=setTimeout(failed,timeout);
 }
 img.referrerPolicy="no-referrer";
 if(!candidates.length){finish(false);return}
 img.addEventListener("load",loaded);img.addEventListener("error",failed);start();
 if(img.complete&&img.naturalWidth>0)loaded();
}
