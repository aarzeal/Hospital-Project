

exports.createProduct = async (sequelize, productData) => {
  const Product = require('../models/productmodel')(sequelize);
    await Product.sync({ force: false });
  return await Product.create(productData);
};;

exports.getAllProducts = async (sequelize,{ page, limit}) => {
    const Product = require('../models/productmodel')(sequelize);
  const offset = (page - 1) * limit;
   return await Product.findAndCountAll({
    limit,
    offset
  });
};

exports.getProductAsPerQueryParam = async (sequelize, { page, limit, fields }) => {
  const Product = require('../models/productmodel')(sequelize);
  const offset = (page - 1) * limit;
  const queryOptions = {
    limit,
    offset,
  };

  if (fields && fields.length > 0) {
    queryOptions.attributes = fields;
  }

  return await Product.findAndCountAll(queryOptions);
};




