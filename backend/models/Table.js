const mongoose=require('mongoose');
const fieldSchema=new mongoose.Schema({
    label:{type:String, required:true},
    type:{type: String, required:true},
    required:{type:Boolean, default:false},
    options:[String],
});
const tableSchema=new mongoose.Schema({
    name:{type:String, required:true},
    fields:[fieldSchema],
    createdBy:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true}

},{timeStamps:true});
module.exports=mongoose.model('Table', tableSchema);