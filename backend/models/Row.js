const mongoose=require('mongoose');
const rowSchema=new mongoose.Schema({
    tableId:{type:mongoose.Schema.Types.ObjectId, ref: 'Table', required:true},
    values:{type:Object, required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true }
},{timestamps:true});
module.exports=mongoose.model('Row', rowSchema);