const Row=require('../models/Row');
const Table=require('../models/Table');
const addRow=async(req,res)=>{
    const {tableId}=req.params;
    const rowValues=req.body;
    const userId=req.userId;
    try{
        const table=await Table.findById(tableId);
        if (!table) return res.status(404).json({msg: 'Table not found'});
        if (table.createdBy.toString()!==userId) return res.status(403).json({msg:'Unauthorized'});
        const errors=[];
        for (const field of table.fields){
            const val=rowValues[field.label];
            if (field.required &&(val===undefined || val=== '')){
                errors.push(`${field.label} is required`);
                continue;
            }
            if (val !==undefined && val !==''){
                switch(field.type){
                    case 'number':
                        if (isNaN(val)) error.push('${field.label} must be a number');
                        break;
                    case 'checkbox':
                        if (typeof val!== 'boolean') errors.push(`${field.label} must be true/false`);
                        break;
                    case 'dropdown':
                        if (!field.options.includes(val)) errors.push(`{field.label} must be a valid date`);
                        break;
                }
            }
        }
        if (errors.length>0) return res.status(400).json({errors});
        const newRow=await Row.create({
            tableId,
            values:rowValues,
            createdBy:userId
        });
        res.status(201).json(newRow);
    }catch(err){
        res.status(500).json({msg: 'Failed to add row', error:err.message});
    }
};
module.exports={addRow};