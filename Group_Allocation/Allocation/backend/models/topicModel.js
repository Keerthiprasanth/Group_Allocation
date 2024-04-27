const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    feedback: {
      type: String,
      required: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const topicSchema = new Schema(
  {
    topic: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    supervisedBy: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
    feedbacks: [feedbackSchema],
  },
  { timestamps: true }
);

//add new topic
topicSchema.statics.addTopic = async function (
  topic,
  description,
  supervisedBy,
  isApproved,
  addedBy
) {
  if (!topic || !description) {
    throw Error("Please provide all the fields!!!");
  }

  const exists = await this.findOne({ topic });

  if (exists) {
    throw Error("Topic already added");
  }

  const addTopic = await this.create({
    topic,
    description,
    supervisedBy,
    isApproved,
    addedBy,
  });

  return addTopic;
};

//get all topics
topicSchema.statics.topics = async function () {
  const topics = await this.find();

  return topics;
};

//get all topics of a supervisor
topicSchema.statics.topicsBySupervisor = async function (supervisedBy) {
  const topics = await this.find({ supervisedBy });

  return topics;
};

//update topic
topicSchema.statics.editTopic = async function (
  id,
  topic,
  description,
  supervisedBy
) {
  const editedTopic = await this.findOne({ _id: id });

  if (topic) editedTopic.topic = topic;
  if (description) editedTopic.description = description;
  if (supervisedBy) {
    editedTopic.isApproved = true;
    editedTopic.supervisedBy = supervisedBy;
  }
  
  await editedTopic.save();

  return editedTopic;
};

//delete topic
topicSchema.statics.deleteTopic = async function (id) {
  
  const deletedAllocation = await this.findOneAndDelete({ _id: id });

  return deletedAllocation;
};

//approve topic
topicSchema.statics.approveTopic = async function (id, supervisedBy) {
  const approvedTopic = await this.findOne({ _id: id });

  approvedTopic.supervisedBy = supervisedBy;

  await approvedTopic.save();

  return approvedTopic;
};

//remove topic supervisedBy
topicSchema.statics.removeSupervisedBy = async function (id) {
  const removedTopic = await this.findOne({ _id: id });

  removedTopic.isApproved = false;
  removedTopic.supervisedBy = "";

  await removedTopic.save()

  return removedTopic;
}

//Add a feedback to a topic
topicSchema.statics.addFeedback = async function (topicId, feedback, addedBy) {
  const feedbackTopic = await this.findOne({ _id: topicId });

  if (!feedback) {
    throw Error("Feedback cannot be empty");
  }
  if (!feedbackTopic) {
    throw Error("Topic not found");
  }

  feedbackTopic.feedbacks.push({ feedback, addedBy });
  await feedbackTopic.save();

  return feedbackTopic;
};

// Fetch feedbacks of a topic submitted by a student
topicSchema.statics.fetchFeedback = async function (addedBy) {
  const topic = await this.findOne({ addedBy });

  if (!topic) {
    throw Error("No topics added by you");
  }

  return topic;
};

// Delete a specific feedback
topicSchema.statics.deleteFeedback = async function (topicId, feedbackId) {
  const topic = await this.findOne({ _id: topicId });

  if (!topic) {
    throw Error("No topics added by you");
  }

  const feedbackIndex = topic.feedbacks.findIndex(
    (fb) => fb._id.toString() === feedbackId
  );
  if (feedbackIndex === -1) {
    throw new Error("Feedback not found");
  }

  topic.feedbacks.splice(feedbackIndex, 1);
  await topic.save();

  return topic;
};

//Fetch topic added by a student
topicSchema.statics.studentTopic = async function (addedBy) {
  const topic = await this.find({ addedBy });

  if (!topic) {
    throw Error("No topics added by you");
  }

  return topic;
}

module.exports = mongoose.model("topics", topicSchema);
