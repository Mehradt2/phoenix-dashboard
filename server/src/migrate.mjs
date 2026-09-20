import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';import{pool}from'./db.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),dir=path.resolve(here,'../migrations');
await pool.query('create table if not exists schema_migrations(name text primary key, applied_at timestamptz not null default now())');
for(const name of(await fs.readdir(dir)).filter(x=>x.endsWith('.sql')).sort()){
 const done=await pool.query('select 1 from schema_migrations where name=$1',[name]);if(done.rowCount)continue;
 const sql=await fs.readFile(path.join(dir,name),'utf8');const c=await pool.connect();
 try{await c.query('begin');await c.query(sql);await c.query('insert into schema_migrations(name) values($1)',[name]);await c.query('commit');console.log('migrated',name)}
 catch(e){await c.query('rollback');throw e}finally{c.release()}
}
await pool.end();
