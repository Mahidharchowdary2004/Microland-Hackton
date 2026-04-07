const { Ollama } = require('ollama');
const ollama = new Ollama();

async function test() {
  try {
    console.log('Testing ollama.chat...');
    const response = await ollama.chat({
      model: 'mistral:latest',
      messages: [{ role: 'user', content: 'hello' }],
    });
    console.log('Ollama chat successful:', response.message.content);
  } catch (error) {
    console.error('Ollama chat failed:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
  }
}

test();
