const Table= require('../models/Table');
/* const { options } = require('../routes/tableRoutes');
 */
function validateRow(fields, row){
    for (let field of fields){
        const{label, type, required, options=[]}=field;
        const value=row[label];
        if (required && (value ===undefined || value === '')){
            throw new Error(`Field "${label}" is required.` );
        }
        switch(type){
            case 'number':
                if (value !== undefined && isNaN(Number(value))){
                    throw new Error(`Field "${label}" must be a number.`);
                }
                break;
            case 'date':
                if (value && isNaN(Date.parse(value))){
                    throw new Error(`Field"${label}" must be a valid date.`);
                }break;
            case 'checkbox':
                if (value !==undefined && typeof value !== 'boolean'){
                    throw new Error (`Field "${label}"must be true or false.`);
                }break;
            case 'dropdown':
                if (value && !options.includes(value)){
                    throw new Error(`Field "${label}" has invalid option "${value}".`)
                }
                break;
            case 'currency':
                 if (value !== undefined && isNaN(Number(value))) {
                    throw new Error(`Field "${label}" must be a valid currency value.`);
                 }
                 break;
            case 'email':
                 if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                     throw new Error(`Field "${label}" must be a valid email.`);
                 }
                 break;
            case 'text':
            case 'textarea':
                if (value !== undefined && typeof value !== 'string') {
                    throw new Error(`Field "${label}" must be text.`);
                }
                break;
            case 'url':
                 if (value && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(value)) {
                    throw new Error(`Field "${label}" must be a valid URL.`);
                }
                break;
            case 'phone':
                if (value && !/^[0-9+\-().\s]{7,15}$/.test(value)) {
                    throw new Error(`Field "${label}" must be a valid phone number.`);
                }
                break;
              
            default:
                throw new Error(`Unsupported field type "${type}" in field "${label}".`);

        }
    }
}

const createTable=async(req,res)=>{
    const {name, fields, data=[]}=req.body;
    const userId=req.userId;
    console.log('Request received:',{name, fields});
    console.log('UserId:',userId);
    try{
        if(!name || !Array.isArray(fields)){
            return res.status(400).json({msg:'Name and fields are required'});
        }
        for (let row of data){
            validateRow(fields, row);
        }
        const table=await Table.create({
          name,
          fields,
          data,
          createdBy:userId, 
        });
        res.status(201).json(table);
    }catch(err){
        console.error('Error creating table:', err);
        res.status(500).json({msg:'Error creating table'});
    }
};
const getUserTables=async(req,res)=>{
    const userId= req.userId;
    try{
        const tables= await Table.find({createdBy:userId}).sort({createdAt:-1});
        res.status(200).json(tables);
    }catch(err){
        console.error('Error fetching table:',err);
        res.status(500).json({msg:'Error fetching'});

    };
}
const getTableById=async(req,res)=>{
    const userId=req.userId;
    const tableId=req.params.id;
    try{
        const table=await Table.findOne({_id :tableId, createdBy:userId});
        if (!table){
            return res.status(404).json({msg:'table not found'});
        }
        res.status(200).json(table);
    }catch(err){
        console.error('Error fetching the data:',err);
        res.status(500).json({msg:'Error fetching the table'});
    }
};
const updateTableById= async(req,res)=>{
    const userId =req.userId;
    const tableId=req.params.id;
    const {name, fields , data=[]}=req.body;
    try{
        for (let row of data){
            validateRow(fields, row);
        }
        const table =await Table.findOneAndUpdate(
           { _id:tableId, createdBy:userId},
           {name, fields, data},
           {new : true}
        );
        if (!table){
            return res.status(404).json({msg:'table not found'});

        }
        res.status(200).json({msg:'Table updated successfully',table});
    }catch(err){
        console.error('Error updating',err);
        res.status(500).json({msg:'Error updating table'});
    }
};
const deleteTable =async(req,res)=>{
      const {tableId} =req.params;
      const userId= req.userId;
      try{
        const table= await Table.findById(tableId);
        if (!table) return res.status(404).json({msg:'Table not found'});
        if (table.createdBy.toString()!==userId){ 
            return res.status(403).json({msg:'Unauthorized'});
        }
        await table.deleteOne();
        res.status(200).json({msg:'Table deleted successfully'});
      
      }catch(err){
        res.status(500).json({msg:'Error deleting table', error:err.message});
      }
    };
module.exports={createTable, getUserTables, getTableById, updateTableById, deleteTable};