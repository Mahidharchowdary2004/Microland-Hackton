import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Bot, User, LayoutDashboard, Database, BarChart3, TrendingUp, AlertCircle, ShoppingBag, Terminal, Sparkles, RefreshCcw, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Dashboard from './components/Dashboard'
import ProductList from './components/ProductList'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', type: 'text', content: "Greetings! I'm your AI Retail Intelligence Assistant. I have successfully audited your inventory and sales performance. How can I assist you today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState('chat') // chat, products
  const [allProducts, setAllProducts] = useState([])
  
  const messagesEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/insights`)
      setAllProducts(res.data)
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }

  const handleSend = async (e, textOverride) => {
    e?.preventDefault()
    const userMsg = textOverride || input.trim()
    if (!userMsg || isLoading) return

    if (!textOverride) setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMsg,
        history: messages.slice(-5).map(m => ({ 
          role: m.role === 'bot' ? 'assistant' : 'user', 
          content: m.role === 'user' ? m.content : (m.text || m.content)
        }))
      })

      const botResponse = res.data
      setMessages(prev => [...prev, { role: 'bot', ...botResponse }])
    } catch (err) {
      console.error("Chat Error:", err)
      setMessages(prev => [...prev, { role: 'bot', type: 'text', content: "Connection error. Please ensure the backend server is running." }])
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        handleSend(null, transcript)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech Rec Error:", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const stopRecording = () => {
    // Web Speech API usually stops automatically on end of speech,
    // but we can ensure it's handled by just toggling state if needed.
    // However, the recognition object isn't stored in ref here for simplicity
    // since it's a one-shot command.
    setIsRecording(false)
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-img-wrapper">
            <img src="/logo.png" alt="Retail Hub Logo" className="logo-img" />
          </div>
          <h2>Microland AI</h2>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <Sparkles size={18} />
            <span>AI Assistant</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Database size={18} />
            <span>Inventory Master</span>
          </button>
        </nav>

        <div className="sidebar-stats">
          <div className="stat-card">
            <BarChart3 size={16} color="#4CAF50" />
            <div className="stat-info">
              <span className="stat-label">Stock OK</span>
              <span className="stat-value">{allProducts.filter(p => p.quantityOnHand >= p.reorderLevel).length}</span>
            </div>
          </div>
          <div className="stat-card alert">
            <AlertCircle size={16} color="#D32F2F" />
            <div className="stat-info">
              <span className="stat-label">Low Stock</span>
              <span className="stat-value">{allProducts.filter(p => p.quantityOnHand < p.reorderLevel).length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-info">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={activeTab}
            >
              {activeTab === 'chat' ? 'AI Business Hub' : 'Enterprise Inventory Master'}
            </motion.h1>
            <p className="subtitle">Real-time Retail Analytics & Cloud Control</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="Sync Database" onClick={fetchProducts}>
              <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <div className="user-profile">
              <span>Admin Terminal</span>
              <div className="avatar">AD</div>
            </div>
          </div>
        </header>

        {activeTab === 'chat' ? (
          <div className="chat-window">
            <div className="messages-area gray-scroll">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`message-wrapper ${msg.role}`}
                  >
                    <div className="avatar-icon">
                      {msg.role === 'bot' ? <Bot size={18} /> : <User size={18} />}
                    </div>
                    <div className={`message-bubble ${msg.type === 'dashboard' ? 'dashboard-bubble' : ''}`}>
                      {msg.type === 'text' && <p>{msg.text || msg.content}</p>}
                      {msg.type === 'dashboard' && <Dashboard data={msg} />}
                      {msg.type === 'product_list' && <ProductList products={msg.products} text={msg.text} />}
                      {msg.content && msg.role === 'user' && <p>{msg.content}</p>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="loading-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="input-area" onSubmit={handleSend}>
              <div className="input-wrapper">
                <Terminal size={18} className="terminal-icon" />
                <input 
                  type="text" 
                  placeholder={isRecording ? "Listening..." : "Ask for 'revenue graph', 'low stock'..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isRecording}
                  autoFocus
                />
              </div>
              <button 
                type="button" 
                className={`icon-btn voice-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                {isRecording ? <MicOff size={20} color="#D32F2F" /> : <Mic size={20} color="#666" />}
              </button>
              <button type="submit" disabled={isLoading || isRecording || !input.trim()} className="send-btn">
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="inventory-view fade-in">
             <ProductList products={allProducts} fullView />
          </div>
        )}
      </main>
    </div>

  )
}

export default App
