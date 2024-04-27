const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {

    //verify authentication
    const { authorization } = req.headers

    if(!authorization) {
        return res.status(401).json({ error: 'Unauthorized access' })
    }
    
    try{
        const {_id} = jwt.verify(authorization, process.env.SECRET)

        req.user = await User.findOne({_id}).select('_id')
        next()

    } catch (error){
        console.log(error)
        return res.status(401).json({ error: 'Unauthorized' })
    }
}

module.exports = requireAuth