const Preference = require("../models/preferenceModel");
const Topic = require("../models/topicModel");
const Allocation = require("./allocationController");
const User = require("../models/userModel");
const { createGroup, refineGroups } = require("./groupController");

const submitPreference = async (req, res) => {
  const { email, preference1, preference2, preference3 } = req.body;

  try {
    const preference = await Preference.submitPref(
      email,
      preference1,
      preference2,
      preference3
    );

    res.status(200).json({ preference });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all preferences
const allPreferences = async (req, res) => {
  try {
    const preferences = await Preference.preferences();

    res.status(200).json({ preferences });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get preferences of a student
const selectedPreferences = async (req, res) => {
  const { email } = req.body;
  try {
    const selectedPreferences = await Preference.selectedPreferences(email);

    res.status(200).json({ selectedPreferences });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Allocate each student into a topic
const allocateStudents = async () => {
  try {
    const preferences = await Preference.preferences();
    const users = await User.users();

    const students = users.filter((user) => user.userRole === "student");

    const studentsWithPreferences = [];
    const studentsWithoutPreferences = [];

    students.forEach((student) => {
      const studentPreference = preferences.find(
        (pref) => pref.email === student.email
      );
      if (studentPreference) {
        studentsWithPreferences.push({
          student,
          preference: studentPreference,
        });
      } else {
        studentsWithoutPreferences.push(student);
      }
    });

    // Fetch available topics
    const topics = await Topic.topics();
    const availableTopics = topics
      .filter((topic) => topic.isApproved)
      .map((topic) => topic._id);

    console.log(availableTopics);

    const allocation = {};
    const topicCount = {};

    availableTopics.forEach((topic) => {
      topicCount[topic] = 0;
    });

    count = Math.ceil(students.length / topics.length);

    console.log("Count:", count);

    const isTopicAvailable = (topic, maxCount) => {
      return (topicCount[topic] || 0) < maxCount;
    };

    const allocateTopic = async (studentEmail, preference, supervisedBy) => {
      if (!allocation[preference]) {
        allocation[preference] = [];
      }
      allocation[preference].push(studentEmail);

      if (preference) {
        const topic = topics.find(
          (topic) => topic._id.toString() === preference
        );
        if (topic) {
          supervisedBy = topic.supervisedBy;
        }
      }
      console.log("Allocating:", studentEmail, preference, supervisedBy);

      await Allocation.addAllocation(studentEmail, preference, supervisedBy);
    };

    // Sort students based on preference submission time
    studentsWithPreferences.sort((a, b) => {
      return (
        new Date(a.preference.createdAt) - new Date(b.preference.createdAt)
      );
    });

    // Allocate students with preferences to their preferred topics
    for (let i = 0; i < studentsWithPreferences.length; i++) {
      const { student, preference } = studentsWithPreferences[i];
      const { email, preference1, preference2, preference3 } = preference;

      if (
        isTopicAvailable(preference1, count) &&
        topicCount[preference1] < count
      ) {
        await allocateTopic(email, preference1);
        topicCount[preference1] = (topicCount[preference1] || 0) + 1;
      } else if (
        isTopicAvailable(preference2, count) &&
        topicCount[preference2] < count
      ) {
        await allocateTopic(email, preference2);
        topicCount[preference2] = (topicCount[preference2] || 0) + 1;
      } else if (
        isTopicAvailable(preference3, count) &&
        topicCount[preference3] < count
      ) {
        await allocateTopic(email, preference3);
        topicCount[preference3] = (topicCount[preference3] || 0) + 1;
      } else {
        studentsWithoutPreferences.push(student);
      }
    }

    console.log(studentsWithoutPreferences);

    // Allocate students without preferences to available topics
    for (const [index, student] of studentsWithoutPreferences.entries()) {
      const topicCountsArray = availableTopics.map(
        (topic) => topicCount[topic] || 0
      );
      const minTopicCount = Math.min(...topicCountsArray);
      const leastCountTopicIndex = topicCountsArray.indexOf(minTopicCount);
      const availableTopic = availableTopics[leastCountTopicIndex];

      if (isTopicAvailable(availableTopic, count)) {
        const topic = topics.find(
          (t) => t._id.toString() === availableTopic.toString()
        );
        await allocateTopic(
          student.email,
          availableTopic.toString(),
          topic.supervisedBy
        );
        topicCount[availableTopic] = minTopicCount + 1;
      } else {
        console.log("Could not allocate topic", student);
      }
    }

    console.log("Topic Count:", topicCount);

    console.log("Allocation", allocation);
    return allocation;
  } catch (error) {
    console.log("Error:", error);
    throw new Error("Failed to allocate students.");
  }
};

// Allocate students into groups
const allocateGroups = async (req, res) => {
  const { groupCount } = req.body;
  console.log("req->",req.body);
  try {
    const preferences = await Preference.preferences();
    const users = await User.users();

    const students = users.filter((user) => user.userRole === "student");

    const studentsWithPreferences = [];
    const studentsWithoutPreferences = [];

    students.forEach((student) => {
      const studentPreference = preferences.find(
        (pref) => pref.email === student.email
      );
      if (studentPreference) {
        studentsWithPreferences.push({
          student,
          preference: studentPreference,
        });
      } else {
        studentsWithoutPreferences.push(student);
      }
    });

    // Fetch available topics
    const topics = await Topic.topics();
    const availableTopics = topics
      .filter((topic) => topic.isApproved)
      .map((topic) => topic._id);

    const count = Math.ceil(students.length / availableTopics.length);

    console.log(count);
    const groupSize = parseInt(groupCount);

    if (groupSize <= count) {
      console.log("Allocation not possible as group size is less");
      return res.status(400).json({
        error: `Group size should be more than ${count}. Topics available are less than total number of students present for this group size.`,
      });
    }

    const allocation = {};
    const topicCount = {};

    availableTopics.forEach((topic) => {
      topicCount[topic] = 0;
    });

    console.log("Group Size:", groupSize);

    const isTopicAvailable = (topic, maxCount) => {
      return (topicCount[topic] || 0) < maxCount;
    };

    const allocateTopic = async (studentEmail, preference, supervisedBy) => {
      if (!allocation[preference]) {
        allocation[preference] = [];
      }
      allocation[preference].push(studentEmail);

      if (preference) {
        const topic = topics.find(
          (topic) => topic._id.toString() === preference
        );
        if (topic) {
          supervisedBy = topic.supervisedBy;
        }
      }

      await createGroup(studentEmail, preference, supervisedBy);
    };

    // Sort students based on preference submission time
    studentsWithPreferences.sort((a, b) => {
      return (
        new Date(a.preference.createdAt) - new Date(b.preference.createdAt)
      );
    });

    // Allocate students with preferences to their preferred topics
    for (const { student, preference, index } of studentsWithPreferences) {
      const { email, preference1, preference2, preference3 } = preference;

      if (isTopicAvailable(preference1, groupSize)) {
        await allocateTopic(email, preference1);
        topicCount[preference1] = (topicCount[preference1] || 0) + 1;
      } else if (isTopicAvailable(preference2, groupSize)) {
        await allocateTopic(email, preference2);
        topicCount[preference2] = (topicCount[preference2] || 0) + 1;
      } else if (isTopicAvailable(preference3, groupSize)) {
        await allocateTopic(email, preference3);
        topicCount[preference3] = (topicCount[preference3] || 0) + 1;
      } else {
        studentsWithoutPreferences.push(student);
      }
    }

    // Allocate students without preferences to available topics
    for (const [index, student] of studentsWithoutPreferences.entries()) {
      const availableTopicsWithCounts = availableTopics
        .filter((topic) => topicCount[topic] < groupSize)
        .map((topic) => ({
          topicId: topic,
          count: topicCount[topic] || 0,
        }));

      availableTopicsWithCounts.sort((a, b) => b.count - a.count);

      const mostCountTopic = availableTopicsWithCounts.find(
        (topic) => topic.count < groupSize
      );

      if (mostCountTopic) {
        const topic = topics.find(
          (t) => t._id.toString() === mostCountTopic.topicId.toString()
        );
        await allocateTopic(
          student.email,
          mostCountTopic.topicId.toString(),
          topic.supervisedBy
        );
        topicCount[mostCountTopic.topicId] += 1;
      } else {
        console.log("Could not allocate topic", student);
      }
    }

    console.log(allocation);

    await refineGroups(groupSize);
    return res
      .status(200)
      .json({ message: "Students allocated successfully", allocation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Allocate students into groups using logic 2
const allocatePreferenceGroups = async (req, res) => {
  const { groupCount } = req.body;

  try {
    const preferences = await Preference.preferences();
    const users = await User.users();

    const students = users.filter((user) => user.userRole === "student");
    let studentsWithPreferences = students
      .filter((student) =>
        preferences.some((pref) => pref.email === student.email)
      )
      .map((student) => {
        const studentPreference = preferences.find(
          (pref) => pref.email === student.email
        );
        return {
          student,
          preference: studentPreference,
        };
      });

    const studentsWithoutPreferences = students.filter(
      (student) =>
        !studentsWithPreferences.some(
          (item) => item.student.email === student.email
        )
    );

    const topics = await Topic.topics();
    const availableTopics = topics
      .filter((topic) => topic.isApproved)
      .map((topic) => topic._id);

      const groupSize = parseInt(groupCount);
      const allocation = {};
    const topicCount = {};

    availableTopics.forEach((topic) => {
      topicCount[topic] = 0;
    });

    const isTopicAvailable = (topic, maxCount) => {
      return (topicCount[topic] || 0) < maxCount;
    };

    const allocateTopic = async (studentEmail, preference, supervisedBy) => {
      if (!allocation[preference]) {
        allocation[preference] = [];
      }
      allocation[preference].push(studentEmail);

      if (preference) {
        const topic = topics.find(
          (topic) => topic._id.toString() === preference
        );
        if (topic) {
          supervisedBy = topic.supervisedBy;
        }
      }

      await createGroup(studentEmail, preference, supervisedBy);
    };

    for (let preferenceIndex = 0; preferenceIndex < 3; preferenceIndex++) {
      const studentsToRemove = [];

      for (const { student, preference } of studentsWithPreferences) {
        const selectedPreference =
          preference[`preference${preferenceIndex + 1}`];

        if (
          selectedPreference &&
          isTopicAvailable(selectedPreference, groupSize)
        ) {
          await allocateTopic(student.email, selectedPreference);
          topicCount[selectedPreference] =
            (topicCount[selectedPreference] || 0) + 1;
          studentsToRemove.push(student.email);
        }
      }

      studentsWithPreferences = studentsWithPreferences.filter(
        (item) => !studentsToRemove.includes(item.student.email)
      );

      if (preferenceIndex === 2 && studentsToRemove.length === 0) {
        studentsWithoutPreferences.push(
          ...studentsWithPreferences.map((item) => item.student)
        );
        studentsWithPreferences = [];
      }
    }

    // Allocate students without preferences to available topics
    for (const [index, student] of studentsWithoutPreferences.entries()) {
      const availableTopicsWithCounts = availableTopics
        .filter((topic) => topicCount[topic] < groupSize)
        .map((topic) => ({
          topicId: topic,
          count: topicCount[topic] || 0,
        }));

      availableTopicsWithCounts.sort((a, b) => b.count - a.count);

      const mostCountTopic = availableTopicsWithCounts.find(
        (topic) => topic.count < groupSize
      );

      if (mostCountTopic) {
        const topic = topics.find(
          (t) => t._id.toString() === mostCountTopic.topicId.toString()
        );
        await allocateTopic(
          student.email,
          mostCountTopic.topicId.toString(),
          topic.supervisedBy
        );
        topicCount[mostCountTopic.topicId] += 1;
      } else {
        console.log("Could not allocate topic", student);
      }
    }

    console.log("Allocation:", allocation);

    await refineGroups(groupSize);
    return res
      .status(200)
      .json({ message: "Students allocated successfully", allocation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  submitPreference,
  allPreferences,
  selectedPreferences,
  allocateStudents,
  allocateGroups,
  allocatePreferenceGroups,
};
