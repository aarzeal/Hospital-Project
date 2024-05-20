const HospitalGroup = require('../models/HospitalGroup');

exports.createHospitalGroup = async (req, res) => {
  try {
    const hospitalGroup = await HospitalGroup.create(req.body);
    res.status(200).json({
      meta: {
        statusCode: 200
      },
      data: hospitalGroup
    });
  } catch (error) {
    res.status(400).json({
      meta: {
        statusCode: 400
      },
      error: {
        message: error.message
      }
    });
  }
};

exports.getAllHospitalGroups = async (req, res) => {
  try {
    const hospitalGroups = await HospitalGroup.findAll();
    res.json({
      meta: {
        statusCode: 200
      },
      data: hospitalGroups
    });
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500
      },
      error: {
        message: error.message
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
          statusCode: 404
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.json({
        meta: {
          statusCode: 200
        },
        data: hospitalGroup
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500
      },
      error: {
        message: error.message
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
          statusCode: 404
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.json({
        meta: {
          statusCode: 200
        },
        message: 'Hospital group updated successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500
      },
      error: {
        message: error.message
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
          statusCode: 404
        },
        error: {
          message: 'Hospital group not found'
        }
      });
    } else {
      res.json({
        meta: {
          statusCode: 200
        },
        message: 'Hospital group deleted successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      meta: {
        statusCode: 500
      },
      error: {
        message: error.message
      }
    });
  }
};
