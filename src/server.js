require('dotenv').config();
const express=require('express'), cors=require('cors'), bcrypt=require('bcryptjs'), jwt=require('jsonwebtoken'), path=require('path');
const db=require('./db'), auth=require('./auth');
const app=express(); app.use(cors()); app.use(express.json()); app.use(express.static(path.join(__dirname,'../public')));
const emailOK=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e||'');
app.get('/api/health',(q,s)=>s.json({status:'ok'}));
app.post('/api/auth/register',async(req,res)=>{
 try {
  const {name,email,password}=req.body;
  if(!name||!email||!password) return res.status(400).json({message:'Name, email and password are required.'});
  if(!emailOK(email)) return res.status(400).json({message:'Enter a valid email.'});
  if(String(password).length<8) return res.status(400).json({message:'Password must be at least 8 characters.'});
  const hash=await bcrypt.hash(password,12);
  const [r]=await db.execute('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)',[String(name).trim(),String(email).trim().toLowerCase(),hash]);
  const user={id:r.insertId,name:String(name).trim(),email:String(email).trim().toLowerCase()};
  res.status(201).json({message:'Account created.',user,token:jwt.sign({id:user.id,name:user.name},process.env.JWT_SECRET,{expiresIn:'2d'})});
 } catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({message:'Email already registered.'});console.error(e);res.status(500).json({message:'Registration failed. Check database configuration.'});}
});
app.post('/api/auth/login',async(req,res)=>{
 try{
  const {email,password}=req.body;if(!email||!password)return res.status(400).json({message:'Email and password are required.'});
  const [rows]=await db.execute('SELECT id,name,email,password_hash FROM users WHERE email=?',[String(email).trim().toLowerCase()]);
  if(!rows.length||!(await bcrypt.compare(password,rows[0].password_hash)))return res.status(401).json({message:'Incorrect email or password.'});
  const u=rows[0],user={id:u.id,name:u.name,email:u.email};
  res.json({message:'Logged in.',user,token:jwt.sign({id:u.id,name:u.name},process.env.JWT_SECRET,{expiresIn:'2d'})});
 }catch(e){console.error(e);res.status(500).json({message:'Login failed.'});}
});
app.get('/api/tasks',auth,async(req,res)=>{try{const [r]=await db.execute('SELECT id,title,description,status,due_date,created_at FROM tasks WHERE user_id=? ORDER BY created_at DESC',[req.user.id]);res.json(r);}catch(e){console.error(e);res.status(500).json({message:'Could not load tasks.'});}});
app.post('/api/tasks',auth,async(req,res)=>{
 try{const {title,description='',status='pending',due_date=null}=req.body;if(!title||!String(title).trim())return res.status(400).json({message:'Task title is required.'});if(!['pending','in_progress','completed'].includes(status))return res.status(400).json({message:'Invalid status.'});
 const [r]=await db.execute('INSERT INTO tasks(user_id,title,description,status,due_date) VALUES(?,?,?,?,?)',[req.user.id,String(title).trim(),String(description),status,due_date||null]);
 const [rows]=await db.execute('SELECT id,title,description,status,due_date,created_at FROM tasks WHERE id=? AND user_id=?',[r.insertId,req.user.id]);res.status(201).json(rows[0]);
 }catch(e){console.error(e);res.status(500).json({message:'Could not create task.'});}
});
app.put('/api/tasks/:id',auth,async(req,res)=>{
 try{const {title,description='',status,due_date=null}=req.body;if(!title||!String(title).trim())return res.status(400).json({message:'Task title is required.'});if(!['pending','in_progress','completed'].includes(status))return res.status(400).json({message:'Invalid status.'});
 const [r]=await db.execute('UPDATE tasks SET title=?,description=?,status=?,due_date=? WHERE id=? AND user_id=?',[String(title).trim(),String(description),status,due_date||null,req.params.id,req.user.id]);if(!r.affectedRows)return res.status(404).json({message:'Task not found.'});
 const [rows]=await db.execute('SELECT id,title,description,status,due_date,created_at FROM tasks WHERE id=? AND user_id=?',[req.params.id,req.user.id]);res.json(rows[0]);
 }catch(e){console.error(e);res.status(500).json({message:'Could not update task.'});}
});
app.delete('/api/tasks/:id',auth,async(req,res)=>{
 try{const [r]=await db.execute('DELETE FROM tasks WHERE id=? AND user_id=?',[req.params.id,req.user.id]);if(!r.affectedRows)return res.status(404).json({message:'Task not found.'});res.json({message:'Task deleted.'});}
 catch(e){console.error(e);res.status(500).json({message:'Could not delete task.'});}
});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../public/index.html')));
const PORT=process.env.PORT||3000;app.listen(PORT,'0.0.0.0',()=>console.log(`Task Manager running on port ${PORT}`));
