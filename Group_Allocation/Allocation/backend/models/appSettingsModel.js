const mongoose = require("mongoose");

const appSettingsSchema = new mongoose.Schema({
  preferencesOpen: {
    type: Boolean,
    default: false,
  },
  allocationView: {
    type: Boolean,
    default: false
  }, 
  removeTopicsState: {
    type: Boolean,
    default: false
  },
  approveTopicsState: {
    type: Boolean,
    default: false
  },
});

appSettingsSchema.statics.preferenceState = async function () {
  const currentAppSettings = await this.findOne();
  if (!currentAppSettings) {
    throw new Error("App settings not found");
  }

  const newPreferenceState = !currentAppSettings.preferencesOpen;

  await this.updateOne({}, { preferencesOpen: newPreferenceState });
};

appSettingsSchema.statics.allocationState = async function () {
  const currentAppSettings = await this.findOne();
  if (!currentAppSettings) {
    throw new Error("App settings not found");
  }

  const newAllocationState = !currentAppSettings.allocationView;

  await this.updateOne({}, { allocationView: newAllocationState });
};

appSettingsSchema.statics.removeTopicsState = async function () {
  const currentAppSettings = await this.findOne();
  if (!currentAppSettings) {
    throw new Error("App settings not found");
  }

  const newRemoveTopicsState = !currentAppSettings.removeTopicsState;

  await this.updateOne({}, { removeTopicsState: newRemoveTopicsState });
};

appSettingsSchema.statics.approveTopicsState = async function () {
  const currentAppSettings = await this.findOne();
  if (!currentAppSettings) {
    throw new Error("App settings not found");
  }

  const newApproveTopicsState = !currentAppSettings.approveTopicsState;

  await this.updateOne({}, { approveTopicsState: newApproveTopicsState });
};

appSettingsSchema.statics.fetchSettings = async function () {
  const settings = this.find();

  return settings;
}

module.exports = mongoose.model("AppSettings", appSettingsSchema);
