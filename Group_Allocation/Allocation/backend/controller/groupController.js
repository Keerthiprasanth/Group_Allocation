const Group = require("../models/groupModel");
const Topic = require("../models/topicModel");

const createGroup = async (email, topic, supervisedBy) => {
  try {
    console.log("Topic:",topic);
    const existingGroup = await Group.findOne({ topic });
    console.log("Existing Group:",existingGroup)
    if (existingGroup) {
      existingGroup.emails.push(email);
      await existingGroup.save();
      return existingGroup;
    } 
      const newGroup = new Group({
        topic: topic,
        supervisedBy: supervisedBy,
        emails: [email],
      });

      const savedGroup = await newGroup.save();
      return savedGroup;
  } catch (error) {
    console.error("Error during allocation:", error);
    throw new Error("Failed to add groups to the database.");
  }
};

//get all groups
const allGroups = async (req, res) => {
  try {
    const groups = await Group.groups();

    res.status(200).json({ groups });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//delete all allocations
const deleteGroups = async (req, res) => {
  try{
    await Group.deleteAll();

    console.log("Deleted all Groups");
  } catch (error) {
    console.error("Error deleting allocations:", error.message);
  }
}

//get all groups of a supervisor
const groupsOfSupervisor = async (req, res) => {
  const { email } = req.body;
  try {
    const supervisorGroups = await Group.groupsOfSupervisor(email);

    res.status(200).json({ supervisorGroups });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//get group of a student
const studentGroup = async (req, res) => {
  const { email } = req.body;
  try {
    const studentGroup = await Group.groupOfStudent(email);

    res.status(200).json({ studentGroup });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
}

const updateGroup = async (req, res) => {
  const { topic, email } = req.body;
  try {
    const { allocation, targetAllocation } = await Group.editAllocation( email, topic );

    if (!allocation) {
      throw new Error(`No allocation found for email: ${email}`);
    }

    if (!targetAllocation) {
      throw new Error(`No allocation found for topic: ${topic}`);
    }

    allocation.emails = allocation.emails.filter((e) => e !== email);

    targetAllocation.emails.push(email);

    await Promise.all([allocation.save(), targetAllocation.save()]);

    res.status(200).json({ message: "Allocation updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// refine groups
const refineGroups = async (groupSize) => {
  try {
    console.log("Starting group refinement...");
    
    const groups = await Group.find().sort({ 'emails.length': -1 });

    console.log(groups);

    const groupsToRefine = groups.filter(group => group.emails.length < groupSize);

    if (groupsToRefine.length === 0) {
      console.log("No group needs refinement.");
      return;
    }

    console.log("Group(s) needing refinement found:", groupsToRefine.length);
    const refinedGroupIds = [];

    for (const groupToRefine of groupsToRefine) {
      if(!(refinedGroupIds.indexOf(groupToRefine._id.toString()) > -1)){
        const remainingGroups = groups.filter(group => group._id.toString() !== groupToRefine._id.toString()).reverse();
        const emailsToMove = [];
        for (const email of groupToRefine.emails) {
          for (const targetGroup of remainingGroups) {
            if (targetGroup.emails.length < groupSize) {
              targetGroup.emails.push(email);
              emailsToMove.push(email);
              console.log("group size is ", targetGroup, targetGroup.emails.length);
              if(targetGroup.emails.length === groupSize){
                console.log("group refined ->", targetGroup);
                refinedGroupIds.push(targetGroup._id.toString());
              }
              break; 
            }
          }
        }

        groupToRefine.emails = groupToRefine.emails.filter(email => !emailsToMove.includes(email));
        await groupToRefine.save();

        for (const targetGroup of remainingGroups) {
          await targetGroup.save();
        }
      }
    }

    console.log("Group refinement completed.");
  } catch (error) {
    console.error("Error during group refinement:", error);
    throw new Error("Failed to refine groups.");
  }
};

//Allocation Email
const allocationEmail = async (req, res) => {

  try {
    await Group.sendEmail();
    console.log("Email sent successfully")
    res.status(200).json({ message: "Allocations status email sent successfully." });
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ error: error.message });
  }
}

module.exports = { createGroup, allGroups, deleteGroups, groupsOfSupervisor, studentGroup, updateGroup, refineGroups, allocationEmail };