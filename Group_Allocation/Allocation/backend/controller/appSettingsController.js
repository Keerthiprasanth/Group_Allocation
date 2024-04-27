const AppSettings = require("../models/appSettingsModel");

// Update preference submission state
const updatePreferenceState = async (req, res) => {
  
    try {
        await AppSettings.preferenceState();
  
      res.status(200).json({ message: "Preference submission state has been updated" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// Update preference submission state
const updateAllocationState = async (req, res) => {
  
  try {
      await AppSettings.allocationState();

    res.status(200).json({ message: "Allocation view state has been updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update preference submission state
const updateRemoveTopicsState = async (req, res) => {
  
  try {
      await AppSettings.removeTopicsState();

    res.status(200).json({ message: "Remove topics state has been updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update preference submission state
const updateApproveTopicsState = async (req, res) => {
  
  try {
      await AppSettings.approveTopicsState();

    res.status(200).json({ message: "Approve topics state has been updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get app settings 
const fetchSettings = async (req, res) => {
    try {
      const settings = await AppSettings.fetchSettings();
  
      res.status(200).json({ settings });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  module.exports = { updatePreferenceState, updateAllocationState, updateApproveTopicsState, updateRemoveTopicsState, fetchSettings }