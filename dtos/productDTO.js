
exports.toProductEntityPOST = (dto) => ({
 productName: dto.Name,
  price: dto.product_price
});


exports.toProductEntity = (dto) => ({
  ProductID:dto.id,
  Name: dto.productName,
  product_price: dto.price
});

