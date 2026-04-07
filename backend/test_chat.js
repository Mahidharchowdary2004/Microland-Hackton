const axios = require('axios');

async function runTests() {
  const testCases = [
    { question: "hi", expectedType: "text" },
    { question: "show low stock", expectedType: "text" },
    { question: "sales performance", expectedType: "text" },
    { question: "inventory summary", expectedType: "text" },
    { question: "list products", expectedType: "text" }
  ];

  console.log("🚀 Starting Chatbot API Tests...\n");

  for (const test of testCases) {
    try {
      console.log(`[TEST] Asking: "${test.question}"`);
      const response = await axios.post('http://localhost:5000/api/chat', { message: test.question });
      
      const { type, text } = response.data;
      
      if (type === test.expectedType && text) {
        console.log(`✅ SUCCESS: Received ${type} response.`);
        console.log(`💬 Message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"\n`);
      } else {
        console.log(`❌ FAILED: Unexpected response type. Expected ${test.expectedType}, got ${type}.\n`);
      }
    } catch (err) {
      console.log(`❌ ERROR: Could not connect to the server at http://localhost:5000. \nIs the backend running? ${err.message}\n`);
      break;
    }
  }

  console.log("🏁 Testing Finished.");
}

runTests();
