import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    user_name_en:{
        type: String,
        required: true
    },
    user_email:{
        type: String,
        required: true
    },
    user_password:{
        type: String,
        required: true
    },
    user_role:{
        type: String,
        required: true,
        enum: ["super_admin","admin", "customer"]
    },
    user_address:{
        type: String
    },
    user_phone_number:{
        type: String
    }

})

const User = mongoose.model("User", userSchema);
export default User;