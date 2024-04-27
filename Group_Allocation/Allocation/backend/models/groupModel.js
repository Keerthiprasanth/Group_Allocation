const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Topic = require("../models/topicModel");

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    topic: {
      type: String,
      required: true,
      unique: true,
    },
    supervisedBy: {
      type: String,
    },
    emails: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

//get all groups
groupSchema.statics.groups = async function () {
  // const groups = await this.find();
  const groups = await this.aggregate([
    {
      "$project": {
        "topic": 1,
        "supervisedBy": 1,
        "emails": 1,
        "length": { "$size" : "$emails"}
      }
    },
    {"$sort": { "length": 1 } },
  ])

  return groups;
};

//delete all allocations
groupSchema.statics.deleteAll = async function () {
  const result = await this.deleteMany({});

  return result;
};

//get all groups of a supervisor
groupSchema.statics.groupsOfSupervisor = async function (supervisedBy) {
  const supervisorGroups = await this.find({ supervisedBy });

  return supervisorGroups;
};

//get allocation of a student
groupSchema.statics.groupOfStudent = async function (email) {
  const studentGroup = await this.find({ emails: email });

  return studentGroup;
};

//update allocation
groupSchema.statics.editAllocation = async function (
  email, topic
) {
  const allocation = await this.findOne({ emails: email });
  let targetAllocation = await this.findOne({ topic });

  if (!targetAllocation) {
    const topics = await Topic.topics();

    const selectedTopic = topics.find((t) => t._id.toString() === topic);
    targetAllocation = new this({ topic: topic, supervisedBy: selectedTopic.supervisedBy });
  }

  return { allocation, targetAllocation };
};

//allocation email
groupSchema.statics.sendEmail = async function () {
  try {
    const groups = await this.find();
    const topics = await Topic.topics();

    console.log(groups);
    console.log(topics);

    const findTopicById = (topicId) => {
      return topics.find((topic) => topic._id.toString() === topicId.toString()) || {};
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.GMAIL_USER,
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    for (const group of groups) {
      const emailRecipients = group.emails.join(", ");
      const allRecipients = ["rkpkeerthi22@gmail.com", ...group.emails];

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: allRecipients.join(", "),
        subject: "Allocation status",
        text:
          `Dear Participants,\n\n` +
          `Your group allocation status for personal and group skills has been finalised and the following is your allocation status:\n\n` +
          `Topic allocated: "${findTopicById(group.topic).topic}" \n` +
          `Supervised by: ${group.supervisedBy}\n` +
          `Group members:\n${group.emails
            .map((email) => `- ${email}`)
            .join("\n")}\n\n` +
          `If you have any questions or concerns, please feel free to contact us.\n\n` +
          `Best regards,\nPersonal and Group Skills Module Convenor`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to group participants of "${group.topic}"`);
    }
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

module.exports = mongoose.model("groupAllocation", groupSchema);
