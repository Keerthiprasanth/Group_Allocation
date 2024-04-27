const express=require('express')
const requireAuth = require('../middleware/requireAuth')
const { updatePreferenceState, fetchSettings, updateAllocationState, updateRemoveTopicsState, updateApproveTopicsState } = require('../controller/appSettingsController');

const router=express.Router()

//Auth request
router.use(requireAuth);

router.put('/updatePreferenceState', updatePreferenceState);
router.put('/updateAllocationState', updateAllocationState);
router.put('/updateApproveTopicsState', updateApproveTopicsState);
router.put('/updateRemoveTopicsState', updateRemoveTopicsState);
router.get('/fetchSettings', fetchSettings);

module.exports=router