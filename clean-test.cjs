const {createClient}=require('@libsql/client');
(async()=>{
  const c=createClient({url:'libsql://unaysale-herdianc.aws-ap-northeast-1.turso.io',authToken:'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkwMDkwODYsImlkIjoiMDFhMDg5M2UtMjAwMS03OTMzLTk5YjMtMTc5ZjllZjk2YTM4Iiwia2lkIjoiUGg0blV4WEJGd3pyVU1YdXdFakhmR2dETFpDNFhkU081cExpa3FYbTRFOCIsInJpZCI6IjhlZDE0MWNhLWI2YWItNDM2ZS04NzNhLWVlMmQ1OTdiMGIwMSJ9.q1YIbw2YGzk0OC7bJTIdfIbjl0XGa18QPi32j_O8V-18zSEqtkXaAyCC5BBz1KzWAF9f4nIVLQTC0Er1UjRNDw'});
  await c.execute("DELETE FROM User WHERE email LIKE 'test%@test.com'");
  const r=await c.execute("SELECT email FROM User");
  console.log(r.rows.map(x=>x.email));
})()
