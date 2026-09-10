const {createClient}=require('@libsql/client');
(async()=>{
  const c=createClient({url:'libsql://unaysale-herdianc.aws-ap-northeast-1.turso.io',authToken:'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkwMDkwODYsImlkIjoiMDFhMDg5M2UtMjAwMS03OTMzLTk5YjMtMTc5ZjllZjk2YTM4Iiwia2lkIjoiUGg0blV4WEJGd3pyVU1YdXdFakhmR2dETFpDNFhkU081cExpa3FYbTRFOCIsInJpZCI6IjhlZDE0MWNhLWI2YWItNDM2ZS04NzNhLWVlMmQ1OTdiMGIwMSJ9.q1YIbw2YGzk0OC7bJTIdfIbjl0XGa18QPi32j_O8V-18zSEqtkXaAyCC5BBz1KzWAF9f4nIVLQTC0Er1UjRNDw'});
  const b=await c.execute("SELECT email, role FROM User");
  console.log('Before',b.rows.length, b.rows.map(r=>r.email+`(${r.role})`).join(', '));
  const d=await c.execute({sql:"DELETE FROM User WHERE email != ?",args:["admin@unaysale.id"]});
  console.log('deleted',d.rowsAffected);
  const a=await c.execute("SELECT email, role FROM User");
  console.log('After',a.rows.length, a.rows.map(r=>r.email).join(', '));
  const p=await c.execute("SELECT count(*) as c FROM Property");
  console.log('Props',p.rows[0].c);
  const ag=await c.execute("SELECT count(*) as c FROM Agent");
  console.log('Agents',ag.rows[0].c);
})()
