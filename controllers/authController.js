// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { body, validationResult } = require('express-validator');
// const SysUser = require('../models/SysUser');

// exports.loginValidationRules = () => {
//   return [
//     body('SysUserName').notEmpty().withMessage('Username is required'),
//     body('SysUserPwd').notEmpty().withMessage('Password is required')
//   ];
// };

// exports.login = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { SysUserName, SysUserPwd } = req.body;

//   try {
//     const user = await SysUser.findOne({ where: { SysUserName, Active: true } });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid username or password' });
//     }

//     const isPasswordValid = await bcrypt.compare(SysUserPwd, user.SysUserPwd);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid username or password' });
//     }

//     const token = jwt.sign(
//       { userId: user.SysUserID, userType: user.UserType },
//       'your_jwt_secret_key',
//       { expiresIn: '1h' }
//     );

//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
