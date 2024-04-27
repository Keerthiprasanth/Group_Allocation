const express=require('express')
const requireAuth = require('../middleware/requireAuth')
const { addTopic, allTopics, supervisorTopics, updateTopic, deleteTopic, approveTopic, addFeedback, fetchFeedback, deleteFeedback, removeSupervisedBy, studentTopic } = require('../controller/topicController');
const { submitPreference, allPreferences, allocateStudents, allocateGroups, allocatePreferenceGroups, selectedPreferences } = require('../controller/preferenceController')
const { allAllocations, allocationsOfSupervisor, updateAllocation, deleteAllocations, allocationsOfStudent, deleteSingleAllocation } = require("../controller/allocationController");
const { allGroups, deleteGroups, groupsOfSupervisor, studentGroup, allocationEmail, updateGroup } = require('../controller/groupController')


const router=express.Router()

//Auth request
router.use(requireAuth);

router.post('/add-topic', addTopic);
router.get('/fetchtopics', allTopics);
router.post('/supervisorTopics', supervisorTopics);
router.put('/updateTopic', updateTopic);
router.delete('/deleteTopic', deleteTopic);
router.post('/studentTopic', studentTopic);

router.post('/submitpref', submitPreference)
router.get('/fetchPreferences', allPreferences);
router.post('/selectedPreferences',selectedPreferences);

router.post('/allocateStudents', allocateStudents);
router.post('/allocateGroups', allocateGroups);
router.post('/allocatePreferenceGroups', allocatePreferenceGroups);
router.put('/updateAllocation', updateAllocation);
router.put('/updateGroup', updateGroup);
router.delete('/deleteSingleAllocation', deleteSingleAllocation);
router.delete('/deleteAllocations', deleteAllocations);
router.get('/fetchAllocations', allAllocations);
router.post('/fetch-supervisor-allocations', allocationsOfSupervisor);
router.post('/fetch-student-allocation', allocationsOfStudent);

router.put('/approveTopic', approveTopic);
router.put('/removeSupervisedBy', removeSupervisedBy);
router.post('/addFeedback', addFeedback);
router.post('/fetchFeedback', fetchFeedback);
router.post('/deleteFeedback', deleteFeedback);

router.get('/fetchGroups', allGroups);
router.post('/fetch-supervisor-groups', groupsOfSupervisor);
router.post('/fetch-student-group', studentGroup);
router.delete('/deleteGroups', deleteGroups);
router.post('/sendAllocationEmail', allocationEmail);


//Module export
module.exports=router