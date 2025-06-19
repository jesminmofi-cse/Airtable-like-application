const express=require('express');
const dotenv=require('dotenv');
const connectToDB=require('./config/db');
const authRoutes=require('./routes/authRoutes');
const cors=require('cors');

dotenv.config();
const app=express();
const tableRoutes=require('./routes/tableRoutes');
const rowRoutes=require('./routes/rowRoutes');

app.use(express.json());

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use('/api/auth',authRoutes);
app.use('/api/table',tableRoutes);
app.use('/api/rows', rowRoutes);

const PORT=process.env.PORT||5000;
connectToDB().then(()=>{
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});