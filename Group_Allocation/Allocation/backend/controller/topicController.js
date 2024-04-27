const Topic = require("../models/topicModel");

const addTopic = async (req, res) => {
  const { topic, description, supervisedBy, isApproved, addedBy } = req.body;

  try {
    const addTopic = await Topic.addTopic(topic, description, supervisedBy, isApproved, addedBy);

    res.status(201).json(addTopic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all topics
const allTopics = async (req, res) => {
  try {
    const topics = await Topic.topics();

    res.status(200).json({ topics });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all topics of a supervisor
const supervisorTopics = async (req, res) => {
  const { supervisedBy } = req.body;
  try {
    const topics = await Topic.topicsBySupervisor(supervisedBy);

    res.status(200).json({ topics });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTopic = async (req, res) => {
  const { id, topic, description, supervisedBy } = req.body;

  try {
    const editedTopic = await Topic.editTopic(
      id,
      topic,
      description,
      supervisedBy
    );

    res.status(200).json({ editedTopic });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Find a topic by ID and delete
const deleteTopic = async (req, res) => {
  const { id } = req.body;

  try {
    const deletedTopic = await Topic.deleteTopic(id);
    res
      .status(200)
      .json({ message: "Topic deleted successfully", deletedTopic });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const approveTopic = async (req, res) => {
  const { id, supervisedBy } = req.body;

  try {
    const approvedTopic = await Topic.approveTopic(
      id,
      supervisedBy
    );

    res.status(200).json({ approvedTopic });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// remove supervisedBy
const removeSupervisedBy = async (req, res) => {
  const { id } = req.body;

  try {
    const removedTopic = await Topic.removeSupervisedBy(id);

    res.status(200).json({ removedTopic });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//Add feedback
const addFeedback = async (req,res) => {
  const { topicId, feedback, addedBy } = req.body;
  console.log(topicId, feedback, addedBy);
  
  try {
    const feedbackTopic = await Topic.addFeedback( topicId, feedback, addedBy );

    res.status(200).json({ feedbackTopic });
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ error: error.message });
  }
}

//fetch feedbacks of a topic submitted by a student
const fetchFeedback = async (req,res) => {
  const { addedBy } = req.body;

  try {
    const topic = await Topic.fetchFeedback(addedBy);

    const feedbacks = topic.feedbacks

    res.status(200).json({ topicId: topic._id, feedbacks });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
} 

// Delete a specific feedback
const deleteFeedback = async (req, res) => {
  const { topicId, feedbackId } = req.body;

  try {
    await Topic.deleteFeedback(topicId, feedbackId);

    res.status(200).json('Feedback deleted sucessfully');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//Fetch topic added by a student
const studentTopic = async (req, res) => {
  const { addedBy } = req.body;

  try {
    const topic = await Topic.studentTopic(addedBy);

    res.status(200).json({ topic });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { addTopic, allTopics, supervisorTopics, updateTopic, deleteTopic, approveTopic, removeSupervisedBy, addFeedback, fetchFeedback, deleteFeedback, studentTopic };
