

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Middleware/authMiddleware');

// /**
//  * @swagger
//  * /v1/hospital/hospital-groups:
//  *   post:
//  *     summary: Create a new hospital group
//  *     tags: [Hospital Groups]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               HospitalGroupName:
//  *                 type: string
//  *               LicensedHospitalCount:
//  *                 type: integer
//  *               CreatedBy:
//  *                 type: integer
//  *             required:
//  *               - HospitalGroupName
//  *               - LicensedHospitalCount
//  *               - CreatedBy
//  *     responses:
//  *       '200':
//  *         description: OK
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/HospitalGroup'
//  */

const hospitalGroupController = require('../controllers/hospitalGroupController');

router.post('/admin/login', hospitalGroupController.loginValidationRules(),hospitalGroupController.login,)

router.post('/hospital-groups',verifyToken(['admin']),hospitalGroupController.createHospitalGroup);
router.get('/hospital-groups',verifyToken(['admin']), hospitalGroupController.getAllHospitalGroups);
router.get('/hospital-groups/:id',verifyToken(['admin']), hospitalGroupController.getHospitalGroupById);
router.put('/hospital-groups/:id', verifyToken(['admin']),hospitalGroupController.updateHospitalGroup);
router.delete('/hospital-groups/:id',verifyToken(['admin']), hospitalGroupController.deleteHospitalGroup);

module.exports = router;
