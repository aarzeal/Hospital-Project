

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /v1/hospital/hospital-groups:
 *   post:
 *     summary: Create a new hospital group
 *     tags: [Hospital Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               HospitalGroupName:
 *                 type: string
 *               LicensedHospitalCount:
 *                 type: integer
 *               CreatedBy:
 *                 type: integer
 *             required:
 *               - HospitalGroupName
 *               - LicensedHospitalCount
 *               - CreatedBy
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HospitalGroup'
 */

const hospitalGroupController = require('../controllers/hospitalGroupController');

router.post('/hospital-groups', hospitalGroupController.createHospitalGroup);
router.get('/hospital-groups', hospitalGroupController.getAllHospitalGroups);
router.get('/hospital-groups/:id', hospitalGroupController.getHospitalGroupById);
router.put('/hospital-groups/:id', hospitalGroupController.updateHospitalGroup);
router.delete('/hospital-groups/:id', hospitalGroupController.deleteHospitalGroup);

module.exports = router;
