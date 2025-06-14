const Table= require('../models/Table');
const createTable=async(req,res)=>{
    const {name, fields}=req.body;
    const userId=req.userId;
    try{
        if(!name || !Array.isArray(fields)){
            return res.status(400).json({msg:'Name and fields are required'});
        }
        const table=await Table.create({
          name,
          fields,
          createdBy:userId  
        });
        res.status(201).json(table);
    }catch(err){
        res.status(500).json({msg:'Error creating table'});
    }
};
module.exports={createTable};