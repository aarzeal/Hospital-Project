const AccLedger = require("../models/AccLedger");
const HospitalGroup = require("../models/HospitalGroup");

// Create a new ledger
const createLedger = async (req, res) => {
  try {
    const {
      ledger_name,
      ledger_alias,
      ledger_cheque,
      maintain_bill_wise,
      isdiscount_ledger,
      remark,
      is_tax_aplicable,
      taxplan_IDR,
      creditperied,
      hospital_group_IDR,
    } = req.body;

    // Validate required fields
    if (!ledger_name) {
      return res.status(400).json({ success: false, message: "Ledger name is required." });
    }

    // Check if hospital group exists if hospital_group_IDR is provided
    if (hospital_group_IDR) {
      const hospitalGroup = await HospitalGroup.findByPk(hospital_group_IDR);
      if (!hospitalGroup) {
        return res.status(404).json({ success: false, message: "Hospital group not found." });
      }
    }

    // Create ledger entry
    const newLedger = await AccLedger.create({
      ledger_name,
      ledger_alias,
      ledger_cheque,
      maintain_bill_wise,
      isdiscount_ledger,
      remark,
      is_tax_aplicable,
      taxplan_IDR,
      creditperied,
      hospital_group_IDR,
    });

    res.status(201).json({
      success: true,
      message: "Ledger created successfully",
      data: newLedger,
    });
  } catch (error) {
    console.error("Error creating ledger:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

module.exports = { createLedger };
