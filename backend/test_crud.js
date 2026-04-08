const axios = require('axios');

async function testCRUD() {
  const serverUrl = 'http://localhost:5000/api/chat';
  
  const tests = [
    {
      name: 'CREATE Product',
      message: 'Add a new product "Super Widget" in category "Electronics" with price 500 and stock 100',
    },
    {
      name: 'UPDATE Product',
      message: 'Update price of "Super Widget" to 600',
    },
    {
      name: 'RESTOCK Product',
      message: 'Restock "Super Widget" by adding 50 units',
    },
    {
      name: 'DELETE Product',
      message: 'Remove product "Super Widget" from inventory',
    }
  ];

  console.log("🚀 Starting Chatbot CRUD Tests...\n");

  for (const test of tests) {
    try {
      console.log(`[TEST] ${test.name}: "${test.message}"`);
      const response = await axios.post(serverUrl, { message: test.message });
      console.log(`💬 Response: ${response.data.text}\n`);
    } catch (err) {
      console.error(`❌ Error in ${test.name}:`, err.response ? err.response.data : err.message);
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("🏁 CRUD Testing Finished.");
}

testCRUD();
