const express=require('express');
const dotenv=require('dotenv');
const connectToDB=require('./config/db');
const authRoutes=require('./routes/authRoutes');
const cors=require('cors');
dotenv.config();
const app=express();
const tableRoutes=require('./routes/tableRoutes');
app.use('./api/tables',tableRoutes);
const rowRoutes=require('./routes/rowRoutes');
app.use('/api/rows', rowRoutes);
app.use(express.json());
app.use(cors());
app.use('/api/auth',authRoutes);
const PORT=process.env.PORT||5000;
connectToDB().then(()=>{
    app.listen(PORT, ()=>console.log('Server running on port ${PORT'));
});