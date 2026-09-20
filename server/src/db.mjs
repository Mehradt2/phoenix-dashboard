import pg from'pg';const{Pool}=pg;
export const pool=new Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DB_POOL_MAX||10),idleTimeoutMillis:30000,connectionTimeoutMillis:5000});
export async function q(text,params=[]){return pool.query(text,params)}
export async function tx(fn){const c=await pool.connect();try{await c.query('BEGIN');const out=await fn(c);await c.query('COMMIT');return out}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
export async function ready(){const r=await q('select now() as now');return Boolean(r.rows[0])}
