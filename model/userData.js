const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,'username must be provided']
    },
    password:{
        type:String,
        required:[true,'password must be provided']
    },
    task:{
        type:[{
            taskName:{
                type:String,
                required:[true,'must provide task name'],
                maxlength: [20, 'name can not be more than 20 characters']
            },
            completed:{
                type:Boolean,
                default:false
            }
        }],
        default:[]
    }
})

module.exports=mongoose.model('Userinfo',userSchema);