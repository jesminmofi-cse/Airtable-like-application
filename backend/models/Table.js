const mongoose=require('mongoose');
const fieldSchema=new mongoose.Schema({
    label:{type:String, required:true},
    type:{type: String, required:true},
    required:{type:Boolean, default:false},
    options:[String],
});
const rowSchema=new mongoose.Schema({},{strict:false});
const tableSchema=new mongoose.Schema({
    name:{type:String, required:true},
    fields:[fieldSchema],
    data:[rowSchema],
    createdBy:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true}

},{timestamps:true});
module.exports=mongoose.model('Table', tableSchema);