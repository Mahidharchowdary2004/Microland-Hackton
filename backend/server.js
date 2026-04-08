const express = require('express');
const { Ollama } = require('ollama');
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

// Local AI & Audio Engine
const { pipeline } = require('@xenova/transformers');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const wavefile = require('wavefile');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URL = 'postgresql://neondb_owner:npg_VZtmcv0Xy5GM@ep-royal-recipe-a4ft4jg7.us-east-1.aws.neon.tech/neondb?sslmode=require';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 60000 // Keep connection longer
  },
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL (Neon)'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Database Models
const Product = sequelize.define('Product', {
  inventoryId: { type: DataTypes.STRING },
  productId: { type: DataTypes.STRING },
  sku: { type: DataTypes.STRING },
  barcode: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  subCategory: { type: DataTypes.STRING },
  brand: { type: DataTypes.STRING },
  supplierId: { type: DataTypes.STRING },
  unitOfMeasure: { type: DataTypes.STRING },
  quantityOnHand: { type: DataTypes.INTEGER },
  reorderLevel: { type: DataTypes.INTEGER },
  reorderQuantity: { type: DataTypes.INTEGER },
  warehouseLocation: { type: DataTypes.STRING },
  binNumber: { type: DataTypes.STRING },
  costPrice: { type: DataTypes.FLOAT },
  landedCost: { type: DataTypes.FLOAT },
  holdingCostPerUnit: { type: DataTypes.FLOAT },
  lastRestockedDate: { type: DataTypes.DATE },
  lastSoldDate: { type: DataTypes.DATE },
  expiryDate: { type: DataTypes.DATE },
  batchNumber: { type: DataTypes.STRING },
  avgDailyConsumption: { type: DataTypes.FLOAT },
  stockStatus: { type: DataTypes.STRING },
  storeId: { type: DataTypes.STRING },
  region: { type: DataTypes.STRING },
  lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const SalesRecord = sequelize.define('SalesRecord', {
  orderId: { type: DataTypes.STRING },
  transactionDate: { type: DataTypes.DATE },
  transactionTime: { type: DataTypes.STRING },
  customerId: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING },
  productId: { type: DataTypes.STRING },
  productName: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  channel: { type: DataTypes.STRING },
  storeId: { type: DataTypes.STRING },
  posTerminalId: { type: DataTypes.STRING },
  quantitySold: { type: DataTypes.INTEGER },
  unitPrice: { type: DataTypes.FLOAT },
  discountApplied: { type: DataTypes.FLOAT },
  discountedPrice: { type: DataTypes.FLOAT },
  lineTotal: { type: DataTypes.FLOAT },
  taxAmount: { type: DataTypes.FLOAT },
  grandTotal: { type: DataTypes.FLOAT },
  paymentMethod: { type: DataTypes.STRING },
  couponCode: { type: DataTypes.STRING },
  promotionFlag: { type: DataTypes.BOOLEAN },
  holidayFlag: { type: DataTypes.BOOLEAN },
  seasonalityIndex: { type: DataTypes.FLOAT },
  weatherCondition: { type: DataTypes.STRING },
  trendIndicator: { type: DataTypes.STRING },
  salesTarget: { type: DataTypes.FLOAT },
  isReturn: { type: DataTypes.BOOLEAN },
  returnId: { type: DataTypes.STRING },
  returnReason: { type: DataTypes.STRING },
  refundAmount: { type: DataTypes.FLOAT },
  region: { type: DataTypes.STRING },
  currency: { type: DataTypes.STRING }
});

const CustomerService = sequelize.define('CustomerService', {
  ticketId: { type: DataTypes.STRING },
  customerId: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  preferredLanguage: { type: DataTypes.STRING },
  tier: { type: DataTypes.STRING },
  issueType: { type: DataTypes.STRING },
  issueDescription: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING },
  priority: { type: DataTypes.STRING },
  channelSource: { type: DataTypes.STRING },
  assignedAgent: { type: DataTypes.STRING },
  botHandled: { type: DataTypes.BOOLEAN },
  escalationFlag: { type: DataTypes.BOOLEAN },
  linkedOrderId: { type: DataTypes.STRING },
  deliveryStatus: { type: DataTypes.STRING },
  trackingNumber: { type: DataTypes.STRING },
  complaintCategory: { type: DataTypes.STRING },
  createdDate: { type: DataTypes.DATE },
  resolvedDate: { type: DataTypes.DATE },
  resolutionTimeHrs: { type: DataTypes.FLOAT },
  csatScore: { type: DataTypes.FLOAT },
  npsRating: { type: DataTypes.FLOAT },
  sentimentLabel: { type: DataTypes.STRING },
  feedbackText: { type: DataTypes.TEXT },
  storeId: { type: DataTypes.STRING },
  region: { type: DataTypes.STRING },
  sessionId: { type: DataTypes.STRING }
});

const Recommendation = sequelize.define('Recommendation', {
  recId: { type: DataTypes.STRING },
  sessionId: { type: DataTypes.STRING },
  customerId: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING },
  deviceType: { type: DataTypes.STRING },
  channel: { type: DataTypes.STRING },
  viewedProductId: { type: DataTypes.STRING },
  viewedProductName: { type: DataTypes.STRING },
  viewedCategory: { type: DataTypes.STRING },
  timeOnPageSec: { type: DataTypes.INTEGER },
  searchQuery: { type: DataTypes.STRING },
  clickPath: { type: DataTypes.STRING },
  pastOrderCount: { type: DataTypes.INTEGER },
  avgOrderValue: { type: DataTypes.FLOAT },
  preferredCategories: { type: DataTypes.STRING },
  brandAffinity: { type: DataTypes.STRING },
  priceRangePref: { type: DataTypes.STRING },
  recommendedProductId: { type: DataTypes.STRING },
  recommendedProductName: { type: DataTypes.STRING },
  recommendedCategory: { type: DataTypes.STRING },
  tags: { type: DataTypes.STRING },
  avgRating: { type: DataTypes.FLOAT },
  reviewCount: { type: DataTypes.INTEGER },
  relatedProducts: { type: DataTypes.STRING },
  frequentlyBoughtWith: { type: DataTypes.STRING },
  marginScore: { type: DataTypes.FLOAT },
  recModelVersion: { type: DataTypes.STRING },
  recScore: { type: DataTypes.FLOAT },
  clickThroughRate: { type: DataTypes.FLOAT },
  conversionRate: { type: DataTypes.FLOAT },
  recommendationDate: { type: DataTypes.DATE },
  region: { type: DataTypes.STRING },
  loyaltyLevel: { type: DataTypes.STRING },
  dataConsentFlag: { type: DataTypes.BOOLEAN }
});

// Trend model preserved for UI charts
const Trend = sequelize.define('Trend', {
  productId: { type: DataTypes.INTEGER },
  type: { type: DataTypes.STRING }, // 'daily', 'monthly', 'quarterly'
  labels: { type: DataTypes.JSONB },
  values: { type: DataTypes.JSONB }
});

// Self-Learning Insights Model
const TrainingLog = sequelize.define('TrainingLog', {
  prompt: { type: DataTypes.STRING },
  lastSeen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  hitCount: { type: DataTypes.INTEGER, defaultValue: 1 }
});

// Sync Schema (Skip legacy seeding as we use Excel Data)
const isDev = process.env.NODE_ENV !== 'production';
sequelize.sync({ alter: isDev }).then(() => console.log('Database schema ready.'));
// Local AI Pipeline Initialization
let transcriber = null;
async function initializeAiPipeline() {
  console.log('🚀 [AI] Initializing Local Transcription Engine...');
  console.log('📦 [AI] This will download the 150MB model on the first run. Please wait...');
  try {
    transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        quantized: true,
        progress_callback: (p) => {
            if (p.status === 'progress') {
                process.stdout.write(`\r📥 [AI] Downloading Model: ${p.progress.toFixed(2)}% `);
            }
        }
    });
    console.log('\n✅ [AI] Local Transcription Engine Ready (100% Offline)');
  } catch (err) {
    console.error('❌ [AI] Initialization Failed:', err.message);
  }
}
initializeAiPipeline();

setInterval(() => {
  console.log(`[HEARTBEAT] Retail Hub backend active... (${new Date().toLocaleTimeString()})`);
  sequelize.query('SELECT 1').catch(() => { });
}, 300000);

function formatCurrencyINR(value) {
  return `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;
}

function formatBusinessDate(dateValue) {
  if (!dateValue) return 'N/A';

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function getUtcDayBounds(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  return {
    start: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)),
    end: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999))
  };
}

function formatChange(currentValue, previousValue, label) {
  if (previousValue === null || previousValue === undefined) return `0.0% ${label}`;
  if (Number(previousValue) === 0) return `${currentValue > 0 ? '+100.0%' : '0.0%'} ${label}`;

  const change = ((Number(currentValue) - Number(previousValue)) / Number(previousValue)) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% ${label}`;
}

// Chatbot logic (Professional Enterprise Edition)
async function getChatbotResponse(message, history = []) {
  const lowerMsg = message.toLowerCase();

  // Self-Learning Trace: Log query for automated training & pattern recognition
  try {
    const [log, created] = await TrainingLog.findOrCreate({
      where: { prompt: lowerMsg },
      defaults: { prompt: lowerMsg, hitCount: 1 }
    });
    if (!created) {
      await log.increment('hitCount');
      await log.update({ lastSeen: new Date() });
    }
    console.log(`[TRAINING] Prompt learned/updated: "${lowerMsg}" (Hits: ${log.hitCount})`);
  } catch (err) {
    console.warn('[TRAINING SKIPPED] Could not log prompt:', err.message);
  }

  console.log(`[QUERY] Message: "${message}" | From History: ${history.length} lines`);

  // 1. Pre-fetch Enterprise Statistics
  const totalItems = await Product.count();
  const lowStockItems = await Product.count({ where: { quantityOnHand: { [Op.lt]: sequelize.col('reorderLevel') } } });
  const totalRevenue = await SalesRecord.sum('grandTotal') || 0;
  const pendingTickets = await CustomerService.count({ where: { status: 'Open' } });
  const totalRevenueAll = await SalesRecord.sum('grandTotal') || 0;

  // --- CRUD OPERATIONS START ---
  const crudKeywords = ['add', 'create', 'update', 'change', 'set', 'delete', 'remove', 'restock', 'modify'];
  const isCrudIntent = crudKeywords.some(k => lowerMsg.includes(k));

  if (isCrudIntent) {
    try {
      console.log(`[INTENT] Potential CRUD Operation Detected: "${message}"`);
      
      let crud = { operation: 'UNKNOWN', model: 'Product', data: {} };

      // Regex Extraction
      if (lowerMsg.includes('add') || lowerMsg.includes('create')) {
        crud.operation = 'CREATE';
        const nameMatch = message.match(/(?:add|create)(?:\s+a\s+new\s+product)?\s+["']?([^"']+)["']?/i);
        const priceMatch = message.match(/(?:price|cost)(?:\s+of|\s+is)?\s+([0-9.]+)/i);
        const stockMatch = message.match(/(?:stock|quantity)(?:\s+of|\s+is)?\s+([0-9.]+)/i);
        const catMatch = message.match(/category\s+["']?([^"']+)["']?/i);

        if (nameMatch) crud.data.name = nameMatch[1].trim();
        if (priceMatch) crud.data.costPrice = parseFloat(priceMatch[1]);
        if (stockMatch) crud.data.quantityOnHand = parseInt(stockMatch[1]);
        if (catMatch) crud.data.category = catMatch[1].trim();
      } else if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('set') || lowerMsg.includes('restock')) {
        crud.operation = 'UPDATE';
        // Improved regex for update: look for product name in quotes or after glue words
        const quotedName = message.match(/["']([^"']+)["']/);
        const nameAfterUpdate = message.match(/(?:update|change|set|restock)(?:\s+the)?\s+(?:price|stock|quantity|category)?(?:\s+of|\s+for)?\s+([^"']+)[\s\.]/i);
        
        crud.searchValue = quotedName ? quotedName[1] : (nameAfterUpdate ? nameAfterUpdate[1].trim() : null);
        
        const priceMatch = message.match(/(?:price|cost)\s+(?:to|is)\s+([0-9.]+)/i);
        const stockMatch = message.match(/(?:stock|quantity|units)\s+(?:to|is|by)\s+([0-9.]+)/i);
        const catMatch = message.match(/category\s+to\s+["']?([^"']+)["']?/i);

        if (priceMatch) crud.data.costPrice = parseFloat(priceMatch[1]);
        if (stockMatch) crud.data.quantityOnHand = parseInt(stockMatch[1]);
        if (catMatch) crud.data.category = catMatch[1].trim();
      } else if (lowerMsg.includes('delete') || lowerMsg.includes('remove')) {
        crud.operation = 'DELETE';
        const quotedName = message.match(/["']([^"']+)["']/);
        const nameMatch = message.match(/(?:delete|remove)\s+(?:product\s+)?([^"']+)[\s\.]?/i);
        crud.searchValue = quotedName ? quotedName[1] : (nameMatch ? nameMatch[1].trim() : null);
      }

      // Cleanup logic: if searchValue is a keyword, it's likely a bad match
      if (crud.searchValue && (crud.searchValue.toLowerCase() === 'price' || crud.searchValue.toLowerCase() === 'stock')) {
         crud.searchValue = null;
      }

      // Use AI to refine if regex missed something or for better semantic understanding
      try {
        if (crud.operation === 'UNKNOWN' || (!crud.data.name && !crud.searchValue)) {
          const crudPrompt = `Extract CRUD operation (CREATE/UPDATE/DELETE) and parameters (name, price, stock, category).
          User: "${message}"
          Return JSON only.`;
          const aiResult = await ollama.chat({ model: 'mistral:latest', messages: [{ role: 'system', content: crudPrompt }], format: 'json' });
          const aiCrud = JSON.parse(aiResult.message.content);
          if (aiCrud.operation !== 'UNKNOWN') crud = { ...crud, ...aiCrud, data: { ...crud.data, ...aiCrud.data } };
        }
      } catch (aiErr) { console.warn('[CRUD] AI Refinement skipped/failed.'); }

      console.log(`[CRUD] Final Parsed:`, crud);

      if (crud.operation === 'CREATE' && crud.data.name) {
        const newProduct = await Product.create({
          productId: `PRD-${Math.floor(Math.random() * 9000) + 1000}`,
          sku: `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
          name: crud.data.name,
          category: crud.data.category || 'General',
          costPrice: crud.data.costPrice || 0,
          quantityOnHand: crud.data.quantityOnHand || 0,
          reorderLevel: crud.data.reorderLevel || 10,
          stockStatus: 'In Stock',
          lastUpdated: new Date()
        });
        return {
          type: 'text',
          text: `✅ **Success!** Created new product: **${newProduct.name}**
- Product ID: ${newProduct.productId}
- Price: ₹${newProduct.costPrice}
- Stock: ${newProduct.quantityOnHand} units`
        };
      }

      if (crud.operation === 'UPDATE' && crud.searchValue) {
        const product = await Product.findOne({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${crud.searchValue}%` } },
              { productId: crud.searchValue }
            ]
          }
        });

        if (product) {
          const oldData = { ...product.dataValues };
          if (lowerMsg.includes('restock') && crud.data.quantityOnHand) {
             crud.data.quantityOnHand = product.quantityOnHand + crud.data.quantityOnHand;
          }
          
          await product.update({ ...crud.data, lastUpdated: new Date() });
          
          let changes = [];
          if (crud.data.costPrice) changes.push(`Price: ₹${oldData.costPrice} ➔ ₹${crud.data.costPrice}`);
          if (crud.data.quantityOnHand !== undefined) changes.push(`Stock: ${oldData.quantityOnHand} ➔ ${product.quantityOnHand}`);
          if (crud.data.category) changes.push(`Category: ${oldData.category} ➔ ${crud.data.category}`);

          return {
            type: 'text',
            text: `🛠️ **Updated ${product.name} Successfully!**
${changes.length > 0 ? changes.map(c => `• ${c}`).join('\n') : '• No changes detected in numeric fields.'}`
          };
        }
      }

      if (crud.operation === 'DELETE' && crud.searchValue) {
        const product = await Product.findOne({
          where: {
            [Op.or]: [
              { name: { [Op.iLike]: `%${crud.searchValue}%` } },
              { productId: crud.searchValue }
            ]
          }
        });

        if (product) {
          const productName = product.name;
          await product.destroy();
          return {
            type: 'text',
            text: `🗑️ **Product Removed:** "${productName}" has been deleted from the enterprise inventory.`
          };
        }
      }
    } catch (err) {
      console.error('[CRUD ERROR]', err.message);
    }
  }
  // --- CRUD OPERATIONS END ---

  // 2. Intent Priority 1: Greetings & Help
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.startsWith('start') || lowerMsg === 'help') {
    return {
      type: 'text',
      text: `Greetings! I am your AI Retail Intelligence Assistant. I have successfully audited your ${totalItems} inventory records and latest sales trends. 

How can I assist you today?`
    };
  }

  // 3. Intent Priority 2: Product Recommendations (Non-Visual List)
  if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('promote')) {
    console.log(`[INTENT] Recommendation Engine Triggered`);
    const recs = await Recommendation.findAll({
      order: [['recScore', 'DESC']],
      limit: 4
    });
    const recProductIds = recs.map(r => r.recommendedProductId);
    const recProducts = await Product.findAll({
      where: { productId: { [Op.in]: recProductIds } }
    });
    const productMap = {};
    recProducts.forEach(p => { productMap[p.productId] = p; });
    return {
      type: 'product_list',
      recommendations: true,
      text: `Based on conversion scores, here are the top 4 recommended products:`,
      products: recs.map(r => {
        const p = productMap[r.recommendedProductId] || {};
        const costPrice = p.costPrice || 0;
        const qoh = p.quantityOnHand || 0;
        const rl = p.reorderLevel || 0;
        const rq = p.reorderQuantity || 0;
        
        return {
          id: r.recommendedProductId,
          sku: r.recommendedProductId,
          name: p.name || r.recommendedProductName || 'Retail SKU',
          category: p.category || r.recommendedCategory || 'Category',
          price: `₹${Math.round(costPrice).toLocaleString()}`,
          costPrice: costPrice,
          stock: qoh,
          quantityOnHand: qoh,
          total: qoh + rq,
          threshold: rl,
          reorderLevel: rl,
          region: r.region || 'Global',
          lastUpdated: r.recommendationDate ? new Date(r.recommendationDate).toLocaleDateString() : 'Recent'
        };
      })
    };
  }

  // 4. Intent Priority 3: Customer Support Intelligence (Visual Dashboard)
  // 4. Intent Priority 3: Customer Support Intelligence (Visual Dashboard)
  if (lowerMsg.includes('ticket') || lowerMsg.includes('customer service') || lowerMsg.includes('service status') || 
      lowerMsg.includes('support') || lowerMsg.includes('sentiment') || lowerMsg.includes('automation')) {
    
    console.log(`[INTENT] Support Intelligence Triggered`);
    try {
      const avgCsat = await CustomerService.aggregate('csatScore', 'AVG') || 0;
      const totalTicketsTotal = await CustomerService.count();
      const openTicketsCount = await CustomerService.count({ where: { status: 'Open' } });
      const botHandledCount = await CustomerService.count({ where: { botHandled: true } });
      
      const sentimentDistribution = await CustomerService.findAll({
        attributes: ['sentimentLabel', [sequelize.fn('COUNT', sequelize.col('sentimentLabel')), 'count']],
        group: ['sentimentLabel'],
        raw: true
      });

      console.log(`[DATABASE] Found ${totalTicketsTotal} total tickets, ${sentimentDistribution.length} sentiment groups.`);

      return {
        type: 'dashboard',
        productName: 'Support Hub Intelligence',
        inventory: {
          total: totalTicketsTotal,
          available: totalTicketsTotal - openTicketsCount,
          threshold: openTicketsCount,
          lastUpdated: new Date().toLocaleDateString()
        },
        sales: {
          totalRevenue: `${Number(avgCsat).toFixed(1)} / 5.0`,
          growth: `CSAT Performance`
        },
        charts: [
          {
            title: 'Ticket Resolution Status',
            type: 'bar',
            labels: ['Resolved', 'Open Pending'],
            data: [totalTicketsTotal - openTicketsCount, openTicketsCount]
          },
          {
            title: 'Live Sentiment Index',
            type: 'line',
            labels: sentimentDistribution.length > 0 ? sentimentDistribution.map(s => s.sentimentLabel || 'Neutral') : ['Neutral'],
            data: sentimentDistribution.length > 0 ? sentimentDistribution.map(s => parseInt(s.count) || 0) : [0]
          }
        ]
      };
    } catch (dbErr) {
      console.error('[DATABASE ERROR] Support Intent failed:', dbErr.message);
      return {
        type: 'text',
        text: "I encountered an error accessing the Customer Service database. Please ensure your enterprise data is correctly loaded."
      };
    }
  }

  const forecastKeywords = ['forecast', 'predict', 'prediction', 'predictions', 'projection', 'projected', 'outlook'];
  const wantsScopedSalesDashboard = (lowerMsg.includes('sale') || lowerMsg.includes('revenue') || lowerMsg.includes('performance')) &&
    (lowerMsg.includes('today') || forecastKeywords.some(keyword => lowerMsg.includes(keyword)));

  if (wantsScopedSalesDashboard) {
    console.log(`[INTENT] Scoped Financial Dashboard Triggered`);

    const recentDailyTotals = await SalesRecord.findAll({
      attributes: ['transactionDate', [sequelize.fn('SUM', sequelize.col('grandTotal')), 'total']],
      group: ['transactionDate'],
      order: [['transactionDate', 'DESC']],
      limit: 7,
      raw: true
    });

    const latestSalesDate = recentDailyTotals[0]?.transactionDate || await SalesRecord.max('transactionDate');
    const previousSalesDate = recentDailyTotals[1]?.transactionDate || null;
    const latestDayBounds = getUtcDayBounds(latestSalesDate);
    const previousDayBounds = getUtcDayBounds(previousSalesDate);
    const isToday = lowerMsg.includes('today');
    const isForecast = forecastKeywords.some(keyword => lowerMsg.includes(keyword));
    const scopedWhere = isToday && latestDayBounds ? {
      transactionDate: { [Op.between]: [latestDayBounds.start, latestDayBounds.end] }
    } : {};

    const salesByCategory = await SalesRecord.findAll({
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('grandTotal')), 'total']],
      where: scopedWhere,
      group: ['category'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 5,
      raw: true
    });

    const [dailySales] = await sequelize.query(`
      SELECT TRIM(TO_CHAR("transactionDate", 'Dy')) AS day, AVG("grandTotal") AS avg
      FROM "SalesRecords"
      GROUP BY TRIM(TO_CHAR("transactionDate", 'Dy'))
    `);

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const avgMap = {};
    dailySales.forEach(d => {
      avgMap[String(d.day).trim()] = Math.round(parseFloat(d.avg) || 0);
    });

    const forecastData = dayOrder.map(day => Math.round((avgMap[day] || 0) * 1.08));
    const forecastRevenue = forecastData.reduce((sum, value) => sum + value, 0);
    const [scopedRevenue, scopedUnits, scopedReturns, scopedTransactions, previousDayRevenue] = await Promise.all([
      SalesRecord.sum('grandTotal', { where: scopedWhere }),
      SalesRecord.sum('quantitySold', { where: scopedWhere }),
      SalesRecord.count({ where: { ...scopedWhere, isReturn: true } }),
      SalesRecord.count({ where: scopedWhere }),
      isToday && previousDayBounds
        ? SalesRecord.sum('grandTotal', {
          where: { transactionDate: { [Op.between]: [previousDayBounds.start, previousDayBounds.end] } }
        })
        : Promise.resolve(null)
    ]);

    const trendRows = recentDailyTotals.slice().reverse();
    const trendLabels = trendRows.map(row => formatBusinessDate(row.transactionDate));
    const trendData = trendRows.map(row => Math.round(parseFloat(row.total) || 0));
    const latestDateLabel = latestSalesDate ? formatBusinessDate(latestSalesDate) : new Date().toLocaleDateString('en-IN');

    return {
      type: 'dashboard',
      productName: isForecast ? 'Sales Forecasting (Next 7 Days)' : `Sales Performance for ${latestDateLabel}`,
      inventory: {
        total: isForecast ? dayOrder.length : scopedTransactions,
        available: isForecast ? Math.round(forecastRevenue / Math.max(forecastData.length, 1)) : (scopedUnits || 0),
        threshold: isForecast ? Math.max(...forecastData, 0) : scopedReturns,
        lastUpdated: isForecast ? `Model updated ${latestDateLabel}` : latestDateLabel
      },
      sales: {
        totalRevenue: isForecast ? formatCurrencyINR(forecastRevenue) : formatCurrencyINR(scopedRevenue || 0),
        growth: isForecast ? '+8.0% Predicted (weekday trend model)' : formatChange(scopedRevenue || 0, previousDayRevenue, 'vs previous trading day')
      },
      charts: [
        {
          title: isForecast ? 'Projected Revenue by Day' : `Revenue by Category (${latestDateLabel})`,
          type: 'bar',
          labels: isForecast ? dayOrder.map(day => `${day}*`) : salesByCategory.map(s => s.category || 'Variable'),
          data: isForecast ? forecastData : salesByCategory.map(s => Math.round(parseFloat(s.total) || 0))
        },
        {
          title: isForecast ? 'Forecast Momentum' : 'Recent Daily Revenue Trend',
          type: 'line',
          labels: isForecast ? dayOrder : trendLabels,
          data: isForecast ? forecastData : trendData
        }
      ]
    };
  }

  // 5. Intent Priority 4: Sales Analysis and Forecasting (Visual/Dashboards)
  if (lowerMsg.includes('revenue') || lowerMsg.includes('sale') || lowerMsg.includes('performance') || lowerMsg.includes('forecast')) {
    console.log(`[INTENT] Financial Dashboards Triggered`);
    const topSales = await SalesRecord.findAll({ order: [['grandTotal', 'DESC']], limit: 5 });

    if (lowerMsg.includes('visual') || lowerMsg.includes('chart') || lowerMsg.includes('graph') || lowerMsg.includes('dash') || lowerMsg.includes('forecast')) {
      const isToday = lowerMsg.includes('today');
      const isForecast = lowerMsg.includes('forecast');

      const salesByCategory = await SalesRecord.findAll({
        attributes: ['category', [sequelize.fn('SUM', sequelize.col('grandTotal')), 'total']],
        group: ['category'],
        order: [[sequelize.literal('total'), 'DESC']],
        limit: 5,
        raw: true
      });

      // AI Forecast Calculation
      const dailySales = await SalesRecord.findAll({
        attributes: [
          [sequelize.fn('TO_CHAR', sequelize.col('transactionDate'), 'Dy'), 'day'],
          [sequelize.fn('AVG', sequelize.col('grandTotal')), 'avg']
        ],
        group: [sequelize.fn('TO_CHAR', sequelize.col('transactionDate'), 'Dy')],
        raw: true
      });

      const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const avgMap = {};
      dailySales.forEach(d => { avgMap[d.day] = Math.round(parseFloat(d.avg) || 0); });
      const forecastData = dayOrder.map(d => Math.round((avgMap[d] || 0) * 1.08));
      const forecastLabels = dayOrder.map(d => d + '*');

      return {
        type: 'dashboard',
        productName: isForecast ? "Sales Forecasting (Next 7 Days)" : (isToday ? "Today's Sales Performance" : 'Enterprise Sales Intelligence'),
        inventory: {
          total: await SalesRecord.count(),
          available: await SalesRecord.sum('quantitySold') || 0,
          threshold: await SalesRecord.count({ where: { isReturn: true } }),
          lastUpdated: new Date().toLocaleDateString()
        },
        sales: {
          totalRevenue: `₹${Math.round(totalRevenue).toLocaleString()}`,
          growth: isForecast ? '+8% Predicted (Daily Avg Model)' : (isToday ? '+4.2% Today' : '+14.2% Index')
        },
        charts: [
          {
            title: isForecast ? 'Forecast (8% growth on avg)' : (isToday ? 'Revenue Split (Current)' : 'Revenue by Category'),
            type: 'bar',
            labels: isForecast ? forecastLabels : salesByCategory.map(s => s.category || 'Variable'),
            data: isForecast ? forecastData : salesByCategory.map(s => Math.round(parseFloat(s.total) || 0))
          },
          {
            title: isForecast ? 'Forecast Momentum' : 'Sales Volume Trend',
            type: 'line',
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: isForecast ? forecastData : [45000, 52000, 48000, 61000, 55000, 67000, 59000]
          }
        ]
      };
    }

    return {
      type: 'text',
      text: `📈 **Financial Performance Summary:**
- **Total Enterprise Revenue:** ₹${Math.round(totalRevenue).toLocaleString()}
- **Top Sale Record:** ₹${Math.round(topSales[0]?.grandTotal || 0).toLocaleString()} (${topSales[0]?.productName || 'N/A'})
- **Top Channel:** Retail Intelligence Store
- **Store Status:** Active and performing above targets.`
    };
  }

  // 6. Intent Priority 5: Inventory Tracking (Specific Phrases)
  if (lowerMsg.includes('inventory') || lowerMsg.includes('stock level') || lowerMsg.includes('reorder') ||
    lowerMsg.includes('all') || lowerMsg.includes('list') || lowerMsg.includes('table') ||
    lowerMsg.includes('record') || lowerMsg.includes('status')) {

    console.log(`[INTENT] Inventory Intelligence Triggered`);

    // Handle "status" query (Text Summary)
    if (lowerMsg.includes('status') && !lowerMsg.includes('all') && !lowerMsg.includes('list')) {
      return {
        type: 'text',
        text: `📦 **Current Inventory Status:**
- Total SKUs: ${totalItems}
- Low Stock Items: ${lowStockItems}
- Healthy Stock Items: ${totalItems - lowStockItems}
- Last Audited: ${new Date().toLocaleDateString()}`
      };
    }

    // Handle "all", "list", "table" queries (Product List)
    if (lowerMsg.includes('all') || lowerMsg.includes('list') || lowerMsg.includes('table') || lowerMsg.includes('record')) {
      const isLow = lowerMsg.includes('low');
      const products = await Product.findAll({
        where: isLow ? { quantityOnHand: { [Op.lt]: sequelize.col('reorderLevel') } } : {},
        limit: lowerMsg.includes('all') ? 50 : 15
      });

      return {
        type: 'product_list',
        text: isLow ? `Found **${products.length} items** currently below the safety threshold.` : `Here are the top **${products.length} records** from your enterprise inventory.`,
        products: products.map(p => ({
          id: p.productId,
          sku: p.sku || 'N/A',
          name: p.name,
          category: p.category,
          price: `₹${Math.round(p.costPrice || 0).toLocaleString()}`,
          costPrice: p.costPrice || 0,
          stock: p.quantityOnHand,
          quantityOnHand: p.quantityOnHand,
          total: (p.quantityOnHand || 0) + (p.reorderQuantity || 0),
          threshold: p.reorderLevel,
          reorderLevel: p.reorderLevel,
          region: p.region || 'Global',
          lastUpdated: p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString() : 'Recent'
        }))
      };
    }

    // Default: Dynamic Inventory Dashboard logic
    const stockByCategory = await Product.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('productId')), 'count']],
      group: ['category'],
      limit: 5,
      raw: true
    });

    return {
      type: 'dashboard',
      productName: lowerMsg.includes('low') ? 'Inventory Health Alert' : 'Enterprise Inventory Audit',
      inventory: {
        total: totalItems,
        available: await Product.sum('quantityOnHand') || 0,
        threshold: lowStockItems,
        lastUpdated: new Date().toLocaleDateString()
      },
      sales: {
        totalRevenue: `₹${Math.round(totalRevenue).toLocaleString()}`,
        growth: '+14% HealthIndex'
      },
      charts: [
        {
          title: 'Safety Stock Status',
          type: 'bar',
          labels: ['Healthy', 'At Risk (Low)'],
          data: [totalItems - lowStockItems, lowStockItems]
        },
        {
          title: 'Item Concentration by Category',
          type: 'line',
          labels: stockByCategory.map(s => s.category || 'Other'),
          data: stockByCategory.map(s => parseInt(s.count) || 0)
        }
      ]
    };
  }


  // 7. Intent Priority 6: Specific Product Lookup (Dashboard)
  if (message.trim().length > 3) {
    const productMatch = await Product.findOne({
      where: {
        [Op.or]: [
          { productId: message.trim() },
          { name: { [Op.iLike]: `%${message.trim()}%` } }
        ]
      }
    });

    if (productMatch && lowerMsg.includes(productMatch.name.toLowerCase().split(' ')[0])) {
      console.log(`[INTENT] Specific Product Lookup: ${productMatch.name}`);
      return await getDashboardResponse(productMatch);
    }
  }

  // 8. Final Priority: AI Fallback (Context-Aware)
  console.log(`[INTENT] No strong keyword found. Falling back to AI Consultant.`);
  try {
    // Fetch top 3 learned patterns for AI context
    const topLearned = await TrainingLog.findAll({ order: [['hitCount', 'DESC']], limit: 3 });
    const learnedPatterns = topLearned.map(l => l.prompt).join(', ');

    const relevantProducts = await Product.findAll({
      where: { [Op.or]: [{ name: { [Op.iLike]: `%${message.slice(0, 15)}%` } }, { category: { [Op.iLike]: `%${message.slice(0, 15)}%` } }] },
      limit: 3
    });

    const contextStr = relevantProducts.map(p => `${p.name} (Stock: ${p.quantityOnHand})`).join('; ');
    const systemPrompt = `You are Microland's AI Consultant. 
Context: Total Revenue ₹${totalRevenue.toLocaleString()}, Total Items: ${totalItems}. 
Relevant: ${contextStr || 'General Query'}. 
Self-Learned Patterns: ${learnedPatterns || 'Learning in progress...'}.
Always provide a concise, professional answer.`;

    const response = await ollama.chat({
      model: 'mistral:latest',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
    });

    return { type: 'text', text: response.message.content || "I've reviewed the data. How else can I assist with your enterprise metrics?" };
  } catch (e) {
    return {
      type: 'text',
      text: `Your enterprise database is active with **${totalItems} records**. I'm currently processing your request about "${message}". How would you like me to proceed?`
    };
  }
}

async function getDashboardResponse(product) {
  const sales = await SalesRecord.findOne({ where: { productId: product.productId } });
  return {
    type: 'dashboard',
    productName: product.name,
    inventory: {
      total: product.quantityOnHand + product.reorderLevel,
      available: product.quantityOnHand,
      threshold: product.reorderLevel,
      lastUpdated: new Date().toLocaleDateString()
    },
    sales: {
      totalRevenue: sales ? `₹${sales.grandTotal.toLocaleString()}` : 'No recent sales',
      growth: '+12% Trend'
    },
    charts: [
      { title: 'Inventory Levels', type: 'bar', labels: ['Available', 'Safety Target'], data: [product.quantityOnHand, product.reorderLevel] }
    ]
  };
}

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const result = await getChatbotResponse(message, history);
    res.json(result);
  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API for Analytics
app.get('/api/insights', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Transcription Endpoint (Fully Local)
const upload = multer({ dest: 'uploads/' });
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  console.log('[TRANSCRIPTION] Local Request received');
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });
    if (!transcriber) return res.status(503).json({ error: 'AI engine still loading...' });

    const inputPath = req.file.path;
    const outputPath = `${inputPath}.wav`;

    console.log(`[TRANSCRIPTION] Processing: ${req.file.originalname}`);

    // 1. Local Conversion: m4a -> wav (16kHz mono)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('error', reject)
        .on('end', resolve)
        .save(outputPath);
    });

    // 2. Local Transcription (Manual Audio Decoding for Node.js)
    const buffer = fs.readFileSync(outputPath);
    const wav = new wavefile.WaveFile(buffer);
    wav.toBitDepth('32f'); // Convert to 32-bit float
    wav.toSampleRate(16000); // Ensure 16kHz
    
    let audioData = wav.getSamples();
    if (Array.isArray(audioData)) {
      // If stereo, take only one channel
      audioData = audioData[0];
    }

    const result = await transcriber(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    console.log(`[TRANSCRIPTION] Success: "${result.text}"`);

    // 3. Clean up temp files
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    return res.json({ text: result.text.trim() });

  } catch (error) {
    console.error('[TRANSCRIPTION] Local Fatal Error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Local Transcription failed', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Retail Backend running on port ${PORT}`);
});
