const Allocation = require("../models/allocationModel");
const Topic = require("../models/topicModel");


const addAllocation = async (email, topic, supervisedBy) => {
  try {
    const allocation = new Allocation({
      email,
      topic,
      supervisedBy
    });

    const newAllocation = await Allocation.create(allocation);
    return newAllocation;
  } catch (error) {
    console.error("Error during allocation:", error);

    throw new Error("Failed to add allocation to the database.");
  }
};

//get all allocations
const allAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.allocations();

    res.status(200).json({ allocations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all allocations of a supervisor
const allocationsOfSupervisor = async (req, res) => {
  const { email } = req.body;
  try {
    const supervisorAllocations = await Allocation.allocationsOfSupervisor(email);

    res.status(200).json({ supervisorAllocations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//get allocation of a student
const allocationsOfStudent = async (req, res) => {
  const { email } = req.body;
  try {
    const studentAllocation = await Allocation.allocationOfStudent(email);

    res.status(200).json({ studentAllocation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const updateAllocation = async (req, res) => {
  const { topic, email } = req.body;
  try {
    const allocation = await Allocation.editAllocation( email );
    const topics = await Topic.topics();

    const selectedTopic = topics.find((t) => t._id.toString() === topic);

    allocation.topic = topic;
    allocation.supervisedBy = selectedTopic.supervisedBy;

    await allocation.save();

    res.status(200).json({ message: "Allocation updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Find a allocation by ID and delete
const deleteSingleAllocation = async (req, res) => {
  const { id } = req.body; 

  try {
    const deletedAllocation = await Allocation.deleteAllocation(id);
    res
      .status(200)
      .json({ message: "Allocation deleted successfully", deletedAllocation });
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ error: error.message });
  }
};

//delete all allocations
const deleteAllocations = async (req, res) => {
  try{
    await Allocation.deleteAll();

    console.log("Deleted all allocations");
  } catch (error) {
    console.error("Error deleting allocations:", error.message);
  }
}

module.exports = { addAllocation, allAllocations, allocationsOfSupervisor, allocationsOfStudent, updateAllocation, deleteSingleAllocation, deleteAllocations };
