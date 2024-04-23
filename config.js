const mongoose=require('mongoose')
const connect=mongoose.connect('mongodb://127.0.0.1:27017/CCLab')

connect.then(()=>{
    console.log('Database connected successfully')
})
.catch((error)=>{
    console.log('Database cannot be connected', error )
})

// Create a schema 
const loginSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }
    ,
    password:{
        type: String,
        required: true 
    }
})

// Collections part 
const collections=new mongoose.model('users', loginSchema)

module.exports = collections
