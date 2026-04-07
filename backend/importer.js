const XLSX = require('xlsx');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const DB_URL = 'postgresql://neondb_owner:npg_VZtmcv0Xy5GM@ep-royal-recipe-a4ft4jg7.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: false // Disable to see our custom error logs
});

// Import same models as server.js
const Product = sequelize.define('Product', {
  inventoryId: { type: DataTypes.STRING }, productId: { type: DataTypes.STRING },
  sku: { type: DataTypes.STRING }, barcode: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING }, category: { type: DataTypes.STRING },
  subCategory: { type: DataTypes.STRING }, brand: { type: DataTypes.STRING },
  supplierId: { type: DataTypes.STRING }, unitOfMeasure: { type: DataTypes.STRING },
  quantityOnHand: { type: DataTypes.INTEGER }, reorderLevel: { type: DataTypes.INTEGER },
  reorderQuantity: { type: DataTypes.INTEGER }, warehouseLocation: { type: DataTypes.STRING },
  binNumber: { type: DataTypes.STRING }, costPrice: { type: DataTypes.FLOAT },
  landedCost: { type: DataTypes.FLOAT }, holdingCostPerUnit: { type: DataTypes.FLOAT },
  lastRestockedDate: { type: DataTypes.DATE }, lastSoldDate: { type: DataTypes.DATE },
  expiryDate: { type: DataTypes.DATE }, batchNumber: { type: DataTypes.STRING },
  avgDailyConsumption: { type: DataTypes.FLOAT }, stockStatus: { type: DataTypes.STRING },
  storeId: { type: DataTypes.STRING }, region: { type: DataTypes.STRING }
});

const SalesRecord = sequelize.define('SalesRecord', {
  orderId: { type: DataTypes.STRING }, transactionDate: { type: DataTypes.DATE },
  transactionTime: { type: DataTypes.STRING }, customerId: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING }, productId: { type: DataTypes.STRING },
  productName: { type: DataTypes.STRING }, category: { type: DataTypes.STRING },
  channel: { type: DataTypes.STRING }, storeId: { type: DataTypes.STRING },
  posTerminalId: { type: DataTypes.STRING }, quantitySold: { type: DataTypes.INTEGER },
  unitPrice: { type: DataTypes.FLOAT }, discountApplied: { type: DataTypes.FLOAT },
  discountedPrice: { type: DataTypes.FLOAT }, lineTotal: { type: DataTypes.FLOAT },
  taxAmount: { type: DataTypes.FLOAT }, grandTotal: { type: DataTypes.FLOAT },
  paymentMethod: { type: DataTypes.STRING }, couponCode: { type: DataTypes.STRING },
  promotionFlag: { type: DataTypes.BOOLEAN }, holidayFlag: { type: DataTypes.BOOLEAN },
  seasonalityIndex: { type: DataTypes.FLOAT }, weatherCondition: { type: DataTypes.STRING },
  trendIndicator: { type: DataTypes.STRING }, salesTarget: { type: DataTypes.FLOAT },
  isReturn: { type: DataTypes.BOOLEAN }, returnId: { type: DataTypes.STRING },
  returnReason: { type: DataTypes.STRING }, refundAmount: { type: DataTypes.FLOAT },
  region: { type: DataTypes.STRING }, currency: { type: DataTypes.STRING }
});

const CustomerService = sequelize.define('CustomerService', {
  ticketId: { type: DataTypes.STRING }, customerId: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING }, email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING }, preferredLanguage: { type: DataTypes.STRING },
  tier: { type: DataTypes.STRING }, issueType: { type: DataTypes.STRING },
  issueDescription: { type: DataTypes.TEXT }, status: { type: DataTypes.STRING },
  priority: { type: DataTypes.STRING }, channelSource: { type: DataTypes.STRING },
  assignedAgent: { type: DataTypes.STRING }, botHandled: { type: DataTypes.BOOLEAN },
  escalationFlag: { type: DataTypes.BOOLEAN }, linkedOrderId: { type: DataTypes.STRING },
  deliveryStatus: { type: DataTypes.STRING }, trackingNumber: { type: DataTypes.STRING },
  complaintCategory: { type: DataTypes.STRING }, createdDate: { type: DataTypes.DATE },
  resolvedDate: { type: DataTypes.DATE }, resolutionTimeHrs: { type: DataTypes.FLOAT },
  csatScore: { type: DataTypes.FLOAT }, npsRating: { type: DataTypes.FLOAT },
  sentimentLabel: { type: DataTypes.STRING }, feedbackText: { type: DataTypes.TEXT },
  storeId: { type: DataTypes.STRING }, region: { type: DataTypes.STRING },
  sessionId: { type: DataTypes.STRING }
});

const Recommendation = sequelize.define('Recommendation', {
  recId: { type: DataTypes.STRING }, sessionId: { type: DataTypes.STRING },
  customerId: { type: DataTypes.STRING }, customerName: { type: DataTypes.STRING },
  deviceType: { type: DataTypes.STRING }, channel: { type: DataTypes.STRING },
  viewedProductId: { type: DataTypes.STRING }, viewedProductName: { type: DataTypes.STRING },
  viewedCategory: { type: DataTypes.STRING }, timeOnPageSec: { type: DataTypes.INTEGER },
  searchQuery: { type: DataTypes.STRING }, clickPath: { type: DataTypes.STRING },
  pastOrderCount: { type: DataTypes.INTEGER }, avgOrderValue: { type: DataTypes.FLOAT },
  preferredCategories: { type: DataTypes.STRING }, brandAffinity: { type: DataTypes.STRING },
  priceRangePref: { type: DataTypes.STRING }, recommendedProductId: { type: DataTypes.STRING },
  recommendedProductName: { type: DataTypes.STRING }, recommendedCategory: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING }, avgRating: { type: DataTypes.FLOAT },
  reviewCount: { type: DataTypes.INTEGER }, relatedProducts: { type: DataTypes.STRING },
  frequentlyBoughtWith: { type: DataTypes.STRING }, marginScore: { type: DataTypes.FLOAT },
  recModelVersion: { type: DataTypes.STRING }, recScore: { type: DataTypes.FLOAT },
  clickThroughRate: { type: DataTypes.FLOAT }, conversionRate: { type: DataTypes.FLOAT },
  recommendationDate: { type: DataTypes.DATE }, region: { type: DataTypes.STRING },
  loyaltyLevel: { type: DataTypes.STRING }, dataConsentFlag: { type: DataTypes.BOOLEAN }
});

const mapKeys = (obj, mapping) => {
  const newObj = {};
  for (let key in obj) {
    const trimmedKey = key.trim();
    if (mapping[trimmedKey]) {
      let val = obj[key];
      const strVal = String(val).toLowerCase().trim();

      // Catch common Excel "null" representations
      if (strVal === 'n/a' || strVal === 'na' || strVal === '-' || strVal.includes('invalid') || strVal === 'nan' || strVal === '' || strVal === 'null') {
        val = null;
      } else if (typeof val === 'string') {
        // Special handle for numbers/prices
        if (val.includes('₹') || val.includes('$') || val.includes(',')) {
          const cleaned = val.replace(/[₹$,]/g, '');
          if (!isNaN(cleaned) && cleaned !== '') val = parseFloat(cleaned);
        } else if (strVal === 'yes' || strVal === 'true') {
          val = true;
        } else if (strVal === 'no' || strVal === 'false') {
          val = false;
        }
      } else if (val instanceof Date) {
        if (isNaN(val.getTime())) val = null;
      }
      
      newObj[mapping[trimmedKey]] = val;
    }
  }
  return newObj;
};

const safeImport = async (Model, data, mapping, label) => {
  let success = 0;
  let failed = 0;
  for (const d of data) {
    try {
      await Model.create(mapKeys(d, mapping));
      success++;
    } catch (err) {
      if (failed === 0) console.error(`[ERROR] First fail in ${label}:`, err.message);
      failed++;
    }
  }
  console.log(`[${label}] Done. Success: ${success}, Failed: ${failed}`);
};

async function runImport() {
  await sequelize.sync({ alter: true });
  console.log('Database synced.');

  const workbook = XLSX.readFile('C:\\Users\\nalla\\Desktop\\Microland\\Retail_Intelligence_Dataset_500.xlsx');
  console.log('Workbook loaded. Sheets found:', workbook.SheetNames.join(', '));

  // 1. Inventory -> Product
  const invData = XLSX.utils.sheet_to_json(workbook.Sheets['Inventory']);
  console.log(`Inventory records found: ${invData.length}`);
  const invMap = {
    'Inventory Id': 'inventoryId', 'Product Id': 'productId', 'Sku': 'sku', 'Barcode': 'barcode',
    'Product Name': 'name', 'Category': 'category', 'Sub Category': 'subCategory', 'Brand': 'brand',
    'Supplier Id': 'supplierId', 'Unit Of Measure': 'unitOfMeasure', 'Quantity On Hand': 'quantityOnHand',
    'Reorder Level': 'reorderLevel', 'Reorder Quantity': 'reorderQuantity', 'Warehouse Location': 'warehouseLocation',
    'Bin Number': 'binNumber', 'Cost Price': 'costPrice', 'Landed Cost': 'landedCost', 'Holding Cost Per Unit': 'holdingCostPerUnit',
    'Last Restocked Date': 'lastRestockedDate', 'Last Sold Date': 'lastSoldDate', 'Expiry Date': 'expiryDate',
    'Batch Number': 'batchNumber', 'Avg Daily Consumption': 'avgDailyConsumption', 'Stock Status': 'stockStatus',
    'Store Id': 'storeId', 'Region': 'region'
  };
  await Product.destroy({ truncate: { cascade: true } });
  await safeImport(Product, invData, invMap, 'Inventory');

  // 2. Sales
  const salesData = XLSX.utils.sheet_to_json(workbook.Sheets['Sales']);
  console.log(`Sales records found: ${salesData.length}`);
  const salesMap = {
    'Order Id': 'orderId', 'Transaction Date': 'transactionDate', 'Transaction Time': 'transactionTime',
    'Customer Id': 'customerId', 'Customer Name': 'customerName', 'Product Id': 'productId',
    'Product Name': 'productName', 'Category': 'category', 'Channel': 'channel', 'Store Id': 'storeId',
    'Pos Terminal Id': 'posTerminalId', 'Quantity Sold': 'quantitySold', 'Unit Price': 'unitPrice',
    'Discount Applied': 'discountApplied', 'Discounted Price': 'discountedPrice', 'Line Total': 'lineTotal',
    'Tax Amount': 'taxAmount', 'Grand Total': 'grandTotal', 'Payment Method': 'paymentMethod',
    'Coupon Code': 'couponCode', 'Promotion Flag': 'promotionFlag', 'Holiday Flag': 'holidayFlag',
    'Seasonality Index': 'seasonalityIndex', 'Weather Condition': 'weatherCondition', 'Trend Indicator': 'trendIndicator',
    'Sales Target': 'salesTarget', 'Is Return': 'isReturn', 'Return Id': 'returnId', 'Return Reason': 'returnReason',
    'Refund Amount': 'refundAmount', 'Region': 'region', 'Currency': 'currency'
  };
  await SalesRecord.destroy({ truncate: { cascade: true } });
  await safeImport(SalesRecord, salesData, salesMap, 'Sales');

  // 3. Customer Service
  const csData = XLSX.utils.sheet_to_json(workbook.Sheets['Customer_Service']);
  console.log(`Customer Service records found: ${csData.length}`);
  const csMap = {
    'Ticket Id': 'ticketId', 'Customer Id': 'customerId', 'Customer Name': 'customerName', 'Email': 'email',
    'Phone': 'phone', 'Preferred Language': 'preferredLanguage', 'Tier': 'tier', 'Issue Type': 'issueType',
    'Issue Description': 'issueDescription', 'Status': 'status', 'Priority': 'priority', 'Channel Source': 'channelSource',
    'Assigned Agent': 'assignedAgent', 'Bot Handled': 'botHandled', 'Escalation Flag': 'escalationFlag',
    'Linked Order Id': 'linkedOrderId', 'Delivery Status': 'deliveryStatus', 'Tracking Number': 'trackingNumber',
    'Complaint Category': 'complaintCategory', 'Created Date': 'createdDate', 'Resolved Date': 'resolvedDate',
    'Resolution Time Hrs': 'resolutionTimeHrs', 'Csat Score': 'csatScore', 'Nps Rating': 'npsRating',
    'Sentiment Label': 'sentimentLabel', 'Feedback Text': 'feedbackText', 'Store Id': 'storeId',
    'Region': 'region', 'Session Id': 'sessionId'
  };
  await CustomerService.destroy({ truncate: { cascade: true } });
  await safeImport(CustomerService, csData, csMap, 'Customer_Service');

  // 4. Recommendation
  const recData = XLSX.utils.sheet_to_json(workbook.Sheets['Recommendations']);
  console.log(`Recommendation records found: ${recData.length}`);
  const recMap = {
    'Rec Id': 'recId', 'Session Id': 'sessionId', 'Customer Id': 'customerId', 'Customer Name': 'customerName',
    'Device Type': 'deviceType', 'Channel': 'channel', 'Viewed Product Id': 'viewedProductId',
    'Viewed Product Name': 'viewedProductName', 'Viewed Category': 'viewedCategory', 'Time On Page Sec': 'timeOnPageSec',
    'Search Query': 'searchQuery', 'Click Path': 'clickPath', 'Past Order Count': 'pastOrderCount',
    'Avg Order Value': 'avgOrderValue', 'Preferred Categories': 'preferredCategories', 'Brand Affinity': 'brandAffinity',
    'Price Range Pref': 'priceRangePref', 'Recommended Product Id': 'recommendedProductId',
    'Recommended Product Name': 'recommendedProductName', 'Recommended Category': 'recommendedCategory',
    'Tags': 'tags', 'Avg Rating': 'avgRating', 'Review Count': 'reviewCount', 'Related Products': 'relatedProducts',
    'Frequently Bought With': 'frequentlyBoughtWith', 'Margin Score': 'marginScore', 'Rec Model Version': 'recModelVersion',
    'Rec Score': 'recScore', 'Click Through Rate': 'clickThroughRate', 'Conversion Rate': 'conversionRate',
    'Recommendation Date': 'recommendationDate', 'Region': 'region', 'Loyalty Level': 'loyaltyLevel',
    'Data Consent Flag': 'dataConsentFlag'
  };
  await Recommendation.destroy({ truncate: { cascade: true } });
  await safeImport(Recommendation, recData, recMap, 'Recommendations');

  console.log('ALL IMPORTS COMPLETED SUCCESSFULLY!');
  process.exit();
}

runImport().catch(err => { console.error(err); process.exit(1); });
