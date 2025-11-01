import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: [ 3, 'First name must be at least 3 characters long' ],
    },

    lastname: {
        type: String,
        minlength: [ 3, 'Last name must be at least 3 characters long' ],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [ 5, 'Email must be at least 5 characters long' ],
    },
    password: {
        type: String,
        required: true,
   
    },
    socketId: {
        type: String,
    },
    refreshToken: {
        type: String,

    }

},
{
    timestamps: true,
})

//hasing password using pre save hook
userSchema.pre('save', async function (next) {
    if(!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();

})

//for checking is password is correct or not using methods
userSchema.methods.isPasswordCorrect = async function(password){
    //return true or false    
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // e.g. "15m"
      }
    );
  };
  
  userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        _id: this._id, // only id for safety
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // e.g. "7d"
      }
    );
  };
  


 export  const User = mongoose.model('User', userSchema);