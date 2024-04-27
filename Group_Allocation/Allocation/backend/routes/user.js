const express = require('express')

const { signupUser, loginUser, allUsers, updateUser, deleteUser, viewProfile, changePassword, forgotPassword, resetPassword} = require('../controller/userController')
// const { user } = require('../controller/userController'); 
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

//login routes
// router.post('/admin', loginUser)
// router.post('/supervisor', loginUser)
router.post('/login', loginUser)

// Route to request password reset
router.post("/forgot-password", forgotPassword);
router.post('/reset', resetPassword);

//Auth request
router.use(requireAuth)

//signup route
router.post('/signup', signupUser)

//get all users
router.get('/admin/users', allUsers)

// Update user route
router.put('/admin/update', updateUser);

//delete user
router.delete('/admin/deleteuser', deleteUser)

//view profile
router.post('/viewProfile', viewProfile);

//change password
router.post('/changePassword', changePassword);

module.exports = router