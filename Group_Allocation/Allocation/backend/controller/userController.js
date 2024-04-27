const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

//signup user
const signupUser = async (req, res) => {
  const { name, email, password, confirmPassword, userRole } = req.body;

  try {
    const user = await User.signup( name, email, password, confirmPassword, userRole);

    //create a token
    const token = createToken(user._id);

    res.status(200).json({ name, email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    //create a token
    const token = createToken(user._id);

    // Export the user object
    module.exports.user = user;

    res.status(200).json({ email, token, userRole: user.userRole });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all users
const allUsers = async (req, res) => {
  try {
    const users = await User.users();

    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update user details
const updateUser = async (req, res) => {
  const { name, email, password, userRole } = req.body;

  try {
    const profile = await User.updateProfile(name, email, password, userRole);

    // Respond with the updated user object
    res.status(200).json({ profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Find a user by ID and delete
const deleteUser = async (req, res) => {
    const { id } = req.body; 
  
    try {
      const deletedUser = await User.deleteUser(id)
      res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

//change password
const changePassword = async (req, res) => {
  const { email, oldPassword, password, confirmPassword } = req.body;

  try {
    const profile = await User.changePassword( email, oldPassword, password, confirmPassword);

    res.status(200).json({ profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//View profile
const viewProfile = async (req, res) => {

  const { email } = req.body;

  try {
    const profile = await User.viewProfile( email );

    res.status(200).json({ profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    await User.forgotPassword(email);
    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    await User.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successful, try logging in again' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { signupUser, loginUser, allUsers, updateUser, deleteUser, viewProfile, changePassword, forgotPassword, resetPassword };
