const {createClient}=require('@libsql/client');
(async()=>{
  const c=createClient({url:'libsql://unaysale-herdianc.aws-ap-northeast-1.turso.io',authToken:'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkwMDkwODYsImlkIjoiMDFhMDg5M2UtMjAwMS03OTMzLTk5YjMtMTc5ZjllZjk2YTM4Iiwia2lkIjoiUGg0blV4WEJGd3pyVU1YdXdFakhmR2dETFpDNFhkU081cExpa3FYbTRFOCIsInJpZCI6IjhlZDE0MWNhLWI2YWItNDM2ZS04NzNhLWVlMmQ1OTdiMGIwMSJ9.q1YIbw2YGzk0OC7bJTIdfIbjl0XGa18QPi32j_O8V-18zSEqtkXaAyCC5BBz1KzWAF9f4nIVLQTC0Er1UjRNDw'});
  const b=await c.execute("SELECT email FROM User");
  console.log('Before User',b.rows.length, b.rows.map(r=>r.email).join(', '));
  await c.execute("PRAGMA foreign_keys=OFF");
  const d=await c.execute({sql:"DELETE FROM User WHERE email != ?",args:["admin@unaysale.id"]});
  console.log('deleted users',d.rowsAffected);
  // bersihkan orphan data
  await c.execute("DELETE FROM Agent WHERE userId NOT IN (SELECT id FROM User)");
  await c.execute("DELETE FROM Property WHERE userId NOT IN (SELECT id FROM User)");
  await c.execute("DELETE FROM Favorite WHERE userId NOT IN (SELECT id FROM User)");
  await c.execute("DELETE FROM Lead WHERE userId NOT IN (SELECT id FROM User) AND userId IS NOT NULL");
  await c.execute("DELETE FROM Notification WHERE userId NOT IN (SELECT id FROM User)");
  await c.execute("DELETE FROM Session WHERE userId NOT IN (SELECT id FROM User)");
  await c.execute("DELETE FROM Account WHERE userId NOT IN (SELECT id FROM User)");
  await c.execute("PRAGMA foreign_keys=ON");
  const a=await c.execute("SELECT email FROM User");
  console.log('After User',a.rows.length, a.rows.map(r=>r.email).join(', '));
  const p=await c.execute("SELECT count(*) as c FROM Property");
  console.log('Props',p.rows[0].c);
  const ag=await c.execute("SELECT count(*) as c FROM Agent");
  console.log('Agents',ag.rows[0].c);
  const fav=await c.execute("SELECT count(*) as c FROM Favorite");
  console.log('Favorites',fav.rows[0].c);
})()
