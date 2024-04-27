const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    enum: ["admin", "supervisor", "student"],
    default: "Student",
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordTokenExpiry: {
    type: String
  }
});

//static signup method
userSchema.statics.signup = async function (
  name,
  email,
  password,
  confirmPassword,
  userRole
) {
  
  //Validation
  if (!name || !email || !password || !confirmPassword) {
    throw Error("Please provide all the fields!!!");
  }
  if (!validator.isEmail(email)) {
    throw Error("Invalid Email! Enter a valid email address.");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Weak Password! Please choose a stronger one.");
  }
  if (password !== confirmPassword) {
    throw Error("Password and confirm password does not match.");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already taken");
  }

  //password hashing
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ name, email: email.toLowerCase(), password: hash, userRole });

  return user;
};

//static login method
userSchema.statics.login = async function (email, password) {
  //Validation
  if (!email || !password) {
    throw Error("Please provide all the fields!");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

//get all users
userSchema.statics.users = async function () {
  const users = await this.find();

  return users;
};

//update user
userSchema.statics.updateProfile = async function (
  name,
  email,
  password,
  userRole
) {
  const profile = await this.findOne({ email });

  // Update the user properties
  if (name) profile.name = name;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    profile.password = hash;
  }
  if (userRole) profile.userRole = userRole;

  console.log(profile);

  // Save the updated user object
  await profile.save();

  return profile;
};

//delete user
userSchema.statics.deleteUser = async function (id) {
  const deletedUser = await this.findOneAndDelete({ _id: id });

  return deletedUser;
};

//view profile
userSchema.statics.viewProfile = async function (email) {
  const viewProfile = await this.findOne({ email });

  return viewProfile;
};

//change password
userSchema.statics.changePassword = async function (
  email,
  oldPassword,
  password,
  confirmPassword
) {
  const profile = await this.findOne({ email });

  const isMatch = await bcrypt.compare(oldPassword, profile.password);

  if (!oldPassword || !password || !confirmPassword) {
    throw Error("Please provide all the fields!");
  }
  if (!isMatch) {
    throw Error("Password Mismatch! Please provide a valid old password.");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Weak Password! Please choose a stronger one.");
  }
  if (password !== confirmPassword) {
    throw Error("Password and confirm password does not match.");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  profile.password = hash;

  await profile.save();
};

//forgotPassword
userSchema.statics.forgotPassword = async function (email) {
  
  if (!email) {
    throw Error("Please provide an email address!");
  }
  if (!validator.isEmail(email)) {
    throw Error("Enter a valid email address.");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("No user with this email address exists.");
  }

  // Generate a password reset token and expiry time
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordTokenExpiry = resetTokenExpiry;

  await user.save();

  // Send the reset email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.GMAIL_USER,
    port: 465,
    secure: true,
    auth: {
     user: process.env.GMAIL_USER,
     pass: process.env.GMAIL_PASS,
    },
   });

  const resetPasswordLink = `http://localhost:3000/reset/${encodeURIComponent(resetToken)}`;


  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Password Reset",
    text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n`
      + `Please click on the following link, or paste this into your browser to complete the process:\n\n`
      // + `http://localhost:3000/reset/${resetToken}\n\n`
      + `${resetPasswordLink}\n\n`
      + `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
};

//reset password
userSchema.statics.resetPassword = async function (token, newPassword) {
  console.log(token,newPassword);
  const user = await this.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw Error('Invalid or expired token');
  }

  const salt = await bcrypt.genSalt(10);
  console.log(newPassword);
  const hash = await bcrypt.hash(newPassword, salt);

  // Update user's password and reset token properties
  user.password = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save();
}

module.exports = mongoose.model("User", userSchema);
