import http from'node:http';
const PORT=Number(process.env.MOCK_OGANESON_PORT||7070);
const transcript='سلام وقت بخیر. خودتون بیمار هستید؟ سابقه دیابت و عمل قلب باز دارید و انسولین و پلاویکس و لوزارتان مصرف می کنید. برای آزمایش ناشتا باشید و فقط آب ساده مجاز است. سوالی دارید؟ ممنون.';
const server=http.createServer((req,res)=>{
 if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,service:'mock-oganeson'}))}
 if(req.method==='POST'&&req.url==='/v1/transcribe'){
  let bytes=0;req.on('data',d=>bytes+=d.length);req.on('end',()=>{
   res.writeHead(200,{'content-type':'application/json'});
   res.end(JSON.stringify({text:transcript,language:'fa',durationSeconds:94.5,confidence:.91,model:'mock-fa-v1',segments:[
    {start:0,end:8,text:'سلام وقت بخیر. خودتون بیمار هستید؟',role:'doctor'},
    {start:8,end:35,text:'سابقه دیابت و عمل قلب باز دارید و انسولین و پلاویکس و لوزارتان مصرف می کنید.',role:'doctor'},
    {start:35,end:56,text:'برای آزمایش ناشتا باشید و فقط آب ساده مجاز است.',role:'doctor'},
    {start:56,end:63,text:'سوالی دارید؟ ممنون.',role:'doctor'}
   ],receivedBytes:bytes}))
  });return
 }
 res.writeHead(404,{'content-type':'application/json'});res.end(JSON.stringify({error:'not_found'}))
});
server.listen(PORT,'0.0.0.0',()=>console.log('mock Oganeson',PORT));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
