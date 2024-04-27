const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const preferenceSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    preference1: {
      type: String,
      required: true,
    },
    preference2: {
      type: String,
      required: true,
    },
    preference3: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

preferenceSchema.statics.submitPref = async function (
  email,
  preference1,
  preference2,
  preference3
) {
  try {
    if (!preference1 || !preference2 || !preference3) {
      throw Error("Please choose all the three preferences!");
    }

    let existingPreference = await this.findOne({ email });

    if (existingPreference) {
      await this.deleteOne({ email });
    }

    const preference = await this.create({
      email,
      preference1,
      preference2,
      preference3,
    });

    return preference;
  } catch (error) {
    throw new Error("Failed to submit preference.");
  }
};

//get all preferences
preferenceSchema.statics.preferences = async function() {
    
  const preferences = await this.find();

  return preferences
}

//get preferences of a student
preferenceSchema.statics.selectedPreferences = async function (email) {

  const preferences = await this.find({ email }); 
  
  return preferences;
};

module.exports = mongoose.model("studentPreference", preferenceSchema);
