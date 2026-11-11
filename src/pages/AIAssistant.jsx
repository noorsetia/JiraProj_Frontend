import { useState } from 'react';
import Layout from '../components/Layout';
import { Bot, Send, Sparkles } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AIAssistant = ({ publicView = false }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI project management assistant. How can I help you today?'
    }
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    
    // Add user message to chat immediately
    const newChat = [...chat, { role: 'user', content: userMessage }];
    setChat(newChat);
    setLoading(true);

    try {
      if (publicView) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        setChat(prev => [...prev, {
          role: 'assistant',
          content: 'This is a safe demo preview. Sign in to connect the assistant to your authorized projects and tasks.'
        }]);
        return;
      }
      console.log('🤖 Sending AI request:', { message: userMessage });

      // Simple, direct API call with just the message
      const response = await api.post('/ai/chat', { 
        message: userMessage
      });

      console.log('✅ AI Response received:', response.data);

      // Add AI response to chat
      setChat(prev => [...prev, {
        role: 'assistant',
        content: response.data.data.response
      }]);
    } catch (error) {
      // Log the full error for debugging
      console.error('❌ AI Assistant Error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Sorry, I encountered an error. ';
      
      if (error.response?.status === 500) {
        const backendMessage = error.response?.data?.message;
        errorMessage += backendMessage || 'The AI service might not be configured properly. Please check with your administrator.';
        console.error('Backend error message:', backendMessage);
      } else if (error.response?.status === 400) {
        errorMessage += error.response?.data?.message || 'Your message couldn\'t be processed. Please try rephrasing your question.';
      } else if (!error.response) {
        errorMessage += 'Unable to connect to the AI service. Is the backend server running on port 5000?';
        console.error('No response from backend. Backend might be offline.');
      } else {
        errorMessage += `Server returned status ${error.response?.status}. Please try again in a moment.`;
      }
      
      // Show error toast
      toast.error('Failed to get AI response');
      
      // Add error message to chat
      setChat(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout publicView={publicView}>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col p-5 sm:p-8">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400"><span>Workspace</span><span>/</span><span className="text-slate-600">AI Assistant</span></div>
          <header className="flex items-center gap-4 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100">
              <Bot className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">AI Assistant</h1>
              <p className="text-sm text-slate-600">Ask questions, summarize work, and find your next best action.</p>
            </div>
          </header>

          {publicView && <div className="demo-banner mb-4 self-start"><span className="demo-dot" /> Demo assistant · no private data connected</div>}
          <div className="flex min-h-[30rem] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {chat.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500">
                        <Sparkles className="h-4 w-4" />
                        AI Assistant
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                  placeholder={publicView ? 'Try the demo assistant...' : 'Ask about your projects...'}
                  className="input flex-1"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="btn btn-primary px-6"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setMessage('Summarize my project progress')}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Summarize progress
                </button>
                <button
                  onClick={() => setMessage('What tasks are overdue?')}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Find overdue tasks
                </button>
                <button
                  onClick={() => setMessage('Which tasks should I prioritize?')}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Prioritize tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAssistant;
