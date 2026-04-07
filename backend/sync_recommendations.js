const { Sequelize, DataTypes, Op } = require('sequelize');

const DB_URL = 'postgresql://neondb_owner:npg_VZtmcv0Xy5GM@ep-royal-recipe-a4ft4jg7.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false
});

const Product = sequelize.define('Product', {
  productId: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  costPrice: { type: DataTypes.FLOAT },
  quantityOnHand: { type: DataTypes.INTEGER },
  reorderLevel: { type: DataTypes.INTEGER }
});

const Recommendation = sequelize.define('Recommendation', {
  recId: { type: DataTypes.STRING },
  recommendedProductId: { type: DataTypes.STRING },
  recommendedProductName: { type: DataTypes.STRING },
  recommendedCategory: { type: DataTypes.STRING },
  recScore: { type: DataTypes.FLOAT },
  region: { type: DataTypes.STRING },
  recommendationDate: { type: DataTypes.DATE }
});

async function repairRecommendations() {
  try {
    await sequelize.authenticate();
    console.log('Synchronizing Enterprise Database...');

    // 1. Get real High-Performing Products
    const products = await Product.findAll({
      order: [['quantityOnHand', 'DESC']], // Using stock as a proxy for 'Major Stock' promotion
      limit: 10
    });

    if (products.length === 0) {
      console.log('No products found in the database to recommend.');
      return;
    }

    // 2. Clear old dummy recommendations
    await Recommendation.destroy({ where: {} });
    console.log('Cleared legacy dummy recommendations.');

    // 3. Insert real enterprise recommendations
    const newRecs = products.map((p, index) => ({
      recId: `REC-${Date.now()}-${index}`,
      recommendedProductId: p.productId,
      recommendedProductName: p.name,
      recommendedCategory: p.category,
      recScore: 90 + (10 - index), // High priority scores
      region: 'Enterprise Primary',
      recommendationDate: new Date()
    }));

    await Recommendation.bulkCreate(newRecs);
    console.log(`Successfully migrated ${newRecs.length} real enterprise SKUs into the Recommendation logic.`);

  } catch (error) {
    console.error('REPAIR FAILED:', error);
  } finally {
    await sequelize.close();
  }
}

repairRecommendations();
