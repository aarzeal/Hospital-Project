const HospitalGroup = require('../models/HospitalGroup');

exports.createHospitalGroup = async (req, res) => {
  try {
    const hospitalGroup = await HospitalGroup.create(req.body);
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0
      },
      data: hospitalGroup
    });
  } catch (error) {
    res.status(400).json({
      meta: {
        statusCode: 400,
        errorCode: 900
      },
      error: {
        message: 'Error creating hospital group: ' + error.message
      }
    });
  }
};

exports.getAllHospitalGroups = async (req, res) => {
  try {
    const hospitalGroups = await HospitalGroup.findAll();
    res.status(200).json({
      meta: {
        statusCode: 200,
        errorCode: 0
      },
      data: hospitalGroups
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 901
      },
      error: {
        message: 'Error retrieving hospital groups: ' + error.message
      }
    });
  }
};

exports.getHospitalGroupById = async (req, res) => {
  const id = req.params.id;
  try {
    const hospitalGroup = await HospitalGroup.findByPk(id);
    if (!hospitalGroup) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 902
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: hospitalGroup
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 903
      },
      error: {
        message: 'Error retrieving hospital group: ' + error.message
      }
    });
  }
};

exports.updateHospitalGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const [updatedRows] = await HospitalGroup.update(req.body, {
      where: { HospitalGroupID: id }
    });
    if (updatedRows === 0) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 904
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: {
          message: 'Hospital group updated successfully'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 905
      },
      error: {
        message: 'Error updating hospital group: ' + error.message
      }
    });
  }
};

exports.deleteHospitalGroup = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedRows = await HospitalGroup.destroy({
      where: { HospitalGroupID: id }
    });
    if (deletedRows === 0) {
      res.status(404).json({
        meta: {
          statusCode: 404,
          errorCode: 906
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.status(200).json({
        meta: {
          statusCode: 200,
          errorCode: 0
        },
        data: {
          message: 'Hospital group deleted successfully'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500,
        errorCode: 907
      },
      error: {
        message: 'Error deleting hospital group: ' + error.message
      }
    });
  }
};
