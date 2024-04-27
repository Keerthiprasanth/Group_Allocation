const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const allocationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
    },
    supervisedBy: {
      type: String
    }
  },
  { timestamps: true }
);

//get all allocations
allocationSchema.statics.allocations = async function() {
    
  const allocations = await this.find()

  return allocations
}

//get all allocations of a supervisor
allocationSchema.statics.allocationsOfSupervisor = async function(supervisedBy) {

  const supervisorAllocations = await this.find({ supervisedBy })

  return supervisorAllocations
}

//get allocation of a student
allocationSchema.statics.allocationOfStudent = async function(email) {

  const studentAllocation = await this.find({ email })

  return studentAllocation
}

//update allocation
allocationSchema.statics.editAllocation = async function (
  email
) {
  const allocation = await this.findOne({ email });

  return allocation;
};

//delete single allocation
allocationSchema.statics.deleteAllocation = async function (id){
  
  const deletedAllocation = await this.findOneAndDelete({ _id: id});

  return deletedAllocation;
}

//delete all allocations
allocationSchema.statics.deleteAll = async function(){

  const result = await this.deleteMany({});

  return result
}

module.exports = mongoose.model("topicAllocation", allocationSchema);