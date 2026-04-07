import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, Code, Book, Lightbulb } from 'lucide-react';
import { ChatMessage } from '../types';

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI programming tutor. I can help you with programming concepts, debugging, best practices, and learning resources. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('javascript') || message.includes('js')) {
      return "JavaScript is a versatile programming language! Here are some key concepts:\n\n• Variables: Use let, const, and var\n• Functions: function myFunc() {} or const myFunc = () => {}\n• Arrays: [1, 2, 3] with methods like map(), filter(), reduce()\n• Objects: { key: value } pairs\n• Promises: Handle asynchronous operations\n\nWhat specific JavaScript topic would you like to explore?";
    }
    
    if (message.includes('react')) {
      return "React is a powerful library for building user interfaces! Key concepts:\n\n• Components: Reusable pieces of UI\n• JSX: Write HTML-like syntax in JavaScript\n• State: Manage component data with useState\n• Props: Pass data between components\n• Hooks: useEffect, useContext, useReducer\n• Virtual DOM: Efficient rendering\n\nWould you like to dive deeper into any of these concepts?";
    }
    
    if (message.includes('python')) {
      return "Python is great for beginners and powerful for experts! Here's what makes it special:\n\n• Simple syntax: Easy to read and write\n• Data structures: Lists, dictionaries, sets, tuples\n• Functions: def function_name(parameters):\n• Classes: Object-oriented programming\n• Libraries: NumPy, Pandas, Django, Flask\n• Use cases: Web development, data science, AI\n\nWhat Python topic interests you most?";
    }
    
    if (message.includes('java')) {
      return "Java is a robust, object-oriented programming language! Key features:\n\n• Platform independent: Write once, run anywhere\n• Object-oriented: Classes, objects, inheritance\n• Strong typing: Compile-time error checking\n• Memory management: Automatic garbage collection\n• Frameworks: Spring, Hibernate, Maven\n• Use cases: Enterprise apps, Android development\n\nWhat Java concept would you like to explore?";
    }
    
    if (message.includes('html')) {
      return "HTML is the foundation of web development! Essential concepts:\n\n• Structure: Elements, tags, attributes\n• Semantic HTML: header, nav, main, section, article\n• Forms: input, textarea, select, button\n• Media: img, video, audio elements\n• Links: anchor tags and navigation\n• Best practices: Accessibility, SEO optimization\n\nWhat HTML topic would you like to learn about?";
    }
    
    if (message.includes('css')) {
      return "CSS brings life to web pages! Important concepts:\n\n• Selectors: .class, #id, element, pseudo-classes\n• Box model: margin, border, padding, content\n• Layout: Flexbox, Grid, positioning\n• Responsive design: Media queries, mobile-first\n• Animations: transitions, keyframes, transforms\n• Modern CSS: Custom properties, CSS Grid\n\nWhich CSS topic interests you?";
    }
    
    if (message.includes('machine learning') || message.includes('ml')) {
      return "Machine Learning is fascinating! Here's what you should know:\n\n• Supervised learning: Classification, regression\n• Unsupervised learning: Clustering, dimensionality reduction\n• Algorithms: Linear regression, decision trees, neural networks\n• Libraries: scikit-learn, pandas, numpy\n• Process: Data preprocessing, training, validation, testing\n• Applications: Recommendation systems, image recognition\n\nWhat ML concept would you like to explore?";
    }
    
    if (message.includes('deep learning') || message.includes('dl') || message.includes('neural network')) {
      return "Deep Learning is the cutting edge of AI! Key concepts:\n\n• Neural networks: Layers, neurons, activation functions\n• Architectures: CNN, RNN, LSTM, Transformers\n• Frameworks: TensorFlow, PyTorch, Keras\n• Applications: Computer vision, NLP, speech recognition\n• Training: Backpropagation, gradient descent, optimization\n• Advanced: GANs, autoencoders, transfer learning\n\nWhich deep learning topic interests you most?";
    }
    
    if (message.includes('c programming') || message.includes(' c ')) {
      return "C is a powerful systems programming language! Core concepts:\n\n• Basics: Variables, data types, operators\n• Control flow: if-else, loops, switch statements\n• Functions: Declaration, definition, parameters\n• Pointers: Memory addresses, pointer arithmetic\n• Arrays: Static arrays, dynamic allocation\n• Structures: Custom data types, unions\n• Memory management: malloc, free, memory leaks\n\nWhat C programming topic would you like to learn?";
    }
    
    if (message.includes('algorithm') || message.includes('data structure')) {
      return "Algorithms and data structures are fundamental! Here's a quick overview:\n\n• Arrays: O(1) access, O(n) search\n• Linked Lists: Dynamic size, O(1) insertion\n• Stacks: LIFO principle (push/pop)\n• Queues: FIFO principle (enqueue/dequeue)\n• Trees: Hierarchical data (BST, AVL)\n• Graphs: Nodes and edges (BFS, DFS)\n• Sorting: Bubble, Quick, Merge sort\n• Searching: Linear, Binary search\n\nWhich data structure or algorithm would you like to learn about?";
    }
    
    if (message.includes('css') || message.includes('styling')) {
      return "CSS is essential for web styling! Here are key concepts:\n\n• Selectors: .class, #id, element\n• Box model: margin, border, padding, content\n• Flexbox: Flexible layouts\n• Grid: 2D layouts\n• Responsive design: Media queries\n• Animations: transitions, keyframes\n• Pseudo-classes: :hover, :focus, :active\n\nWhat aspect of CSS would you like to explore?";
    }
    
    if (message.includes('help') || message.includes('learn')) {
      return "I'm here to help you learn programming! I can assist with:\n\n• 🚀 Programming languages (JavaScript, Python, Java, etc.)\n• 💻 Web development (HTML, CSS, React, Node.js)\n• 📊 Data structures and algorithms\n• 🔧 Debugging and troubleshooting\n• 📚 Best practices and code review\n• 🎯 Career advice and project ideas\n\nJust ask me anything programming-related!";
    }
    
    if (message.includes('debug') || message.includes('error')) {
      return "Debugging is a crucial skill! Here's my debugging approach:\n\n• 🔍 Read the error message carefully\n• 📝 Use console.log() to trace values\n• 🔧 Use browser developer tools\n• 📚 Check documentation and Stack Overflow\n• 🧪 Test with smaller inputs\n• 🤝 Rubber duck debugging (explain to someone)\n• 📖 Use debugger statements\n\nWhat specific error are you encountering?";
    }
    
    if (message.includes('career') || message.includes('job')) {
      return "Great question about programming careers! Here's some advice:\n\n• 📚 Build a strong portfolio with diverse projects\n• 💼 Contribute to open source projects\n• 🔗 Network with other developers\n• 📖 Keep learning new technologies\n• 🎯 Practice coding interviews\n• 📝 Write about your learning journey\n• 🤝 Attend meetups and conferences\n\nWhat specific career aspect interests you?";
    }
    
    // Default response
    return "That's an interesting question! While I specialize in programming topics, I'd be happy to help you with:\n\n• Programming concepts and syntax\n• Code debugging and optimization\n• Best practices and design patterns\n• Learning resources and roadmaps\n• Project ideas and implementation\n\nCould you rephrase your question to be more specific about programming? I'm here to help!";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    { icon: Code, text: "Explain JavaScript closures", category: "JavaScript" },
    { icon: Book, text: "What is machine learning?", category: "ML" },
    { icon: Lightbulb, text: "Java vs Python differences", category: "General" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-4xl mx-auto flex flex-col" style={{ height: '600px' }}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">AI Programming Tutor</h2>
            <p className="text-blue-100">Ask me anything about programming!</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${
              message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className={`rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-6 py-4 border-t">
          <p className="text-sm text-gray-600 mb-3">Quick questions to get started:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question.text)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                <question.icon className="w-4 h-4" />
                {question.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 border-t">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about programming concepts, debugging, or best practices..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};