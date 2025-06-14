const User= require ('../models/User');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const register=async(req,res)=>{
    const {name,email,password}=req.body;
    try{
        const userExists=await User.findOne({email});
        if (userExists) return res.status(400).json({msg:'Email already registered'});
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser=await User.create({name,emai,password:hashedPassword});
        const token=jwt.sign({userId:newUser._id},process.env.JWT_SECRET);
        res.status(201).json({token, user:{name:newUser.name, email:newUser.email}});
    }catch(err){
        res.status(500),json({msg:'Registration failed'});
    }
};
const login=async(req, res)=>{
    const {email, password}=req.body;
    try{
        const user=await User.findOne({email});
        if(!user) return res.status(400).json({msg:'Invalid credientials'});
        const match=await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({msg:'Incorrect password'});
        const token=jwt.sign({userId:user._id}, process.env.JWT_SECRET);
        res.status(200).json({token, user:{name:user.name, email:user.email}});
    }catch(err){
        res.status(500).json({msg:'Login error'});

    }
};
module.exports={register,login};
