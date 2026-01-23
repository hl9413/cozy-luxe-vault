// products.js
// 这是一个商品数组，存放所有商品信息
const products = [
  {
    id: 1,
    name: "Luxury Designer Hoodie",
    category: "Apparel",
    price: 129.99,
    image: "images/hoodie.jpg", // 你需要准备一张图片放在项目里
    description: "Premium cotton luxury hoodie for men."
  },
  {
    id: 2,
    name: "Golden Chain Necklace",
    category: "Jewelry",
    price: 299.00,
    image: "images/necklace.jpg",
    description: "18K gold plated stainless steel chain."
  }
  // ...更多商品
];

// 导出数据，供HTML调用
export default products;