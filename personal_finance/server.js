import express from 'express'
import router from './src/routes/router.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
// Serve frontend static files from src/public
app.use(express.static(join(__dirname, 'src/public')));

app.use('/api', router);
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
});

app.use((err,req,res,next)=>{
  console.error(err)
  res.status(err.status||500).json({
    message:err.message||'sunucu hatası'
  })
})

app.listen(process.env.PORT,()=>{
  console.log(`API çalısıyor: http://localhost:${process.env.PORT}`)
})