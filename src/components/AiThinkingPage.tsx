/**
 * AI深度思考页面组件 - 提供AI深度分析和思考功能
 * 
 * 功能特性：
 * - 类似ChatGPT的对话界面
 * - 支持多轮对话
 * - 显示思考过程
 * - 响应式设计
 * - 现代化UI交互
 * 
 * 设计参考：
 * - ChatGPT的界面布局
 * - 项目配色方案（蓝色系）
 * - 现代化交互体验
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Brain, Lightbulb, Zap, Clock, User, Bot, Sparkles, Target, TrendingUp } from 'lucide-react';
import { cn } from '../utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

interface AiThinkingPageProps {
  onBackToHome?: () => void;
}

export function AiThinkingPage({ onBackToHome }: AiThinkingPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是AI深度思考助手。我可以帮助你进行深度分析、逻辑推理和创造性思考。请告诉我你想要探讨的问题或话题。',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI思考过程
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAiResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const generateAiResponse = (query: string): string => {
    const responses = [
      `关于"${query}"，让我从多个角度来深入分析：

首先，从逻辑层面来看，这个问题涉及...
其次，从实际应用角度考虑...
最后，从未来发展视角分析...

我的建议是：`,
      `这是一个很有趣的问题！让我进行深度思考：

1. 核心问题分析：${query}的本质是...
2. 影响因素：需要考虑...
3. 解决方案：基于以上分析，我建议...

希望这个分析对你有帮助！`,
      `让我用系统性的思维来思考"${query}"：

**问题拆解：**
- 表层现象：...
- 深层原因：...
- 根本问题：...

**思考过程：**
通过多维度分析，我认为...

你觉得这个思考方向如何？`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      // 默认行为：刷新页面
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 左上角装饰 */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        {/* 右上角装饰 */}
        <div className="absolute -top-32 -right-32 w-48 h-48 bg-gradient-to-bl from-indigo-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        {/* 左下角装饰 */}
        <div className="absolute -bottom-24 -left-24 w-36 h-36 bg-gradient-to-tr from-purple-400/25 to-pink-500/25 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        {/* 右下角装饰 */}
        <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-gradient-to-tl from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="返回首页"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    AI深度思考
                  </h1>
                  <p className="text-sm text-gray-600">智能分析与逻辑推理</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">在线</span>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                升级到专业版
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full relative">
        {/* 对话区域 */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={cn(
                  "flex space-x-4",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.type === 'ai' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-4xl rounded-2xl px-6 py-4 shadow-lg",
                  message.type === 'user' 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                    : "bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl"
                )}>
                  <div className="flex items-start space-x-3">
                    {message.type === 'ai' && message.isThinking && (
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {message.type === 'ai' && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1 text-xs text-blue-600 font-medium">
                              <Lightbulb className="w-3 h-3" />
                              <span>深度思考</span>
                            </div>
                            
                            <div className="flex items-center space-x-1 text-xs text-purple-600 font-medium">
                              <Zap className="w-3 h-3" />
                              <span>智能分析</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">AI生成</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* 加载状态 */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex space-x-4 justify-start"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">AI正在深度思考中...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="border-t border-white/20 bg-white/80 backdrop-blur-md p-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="输入你的问题，让AI进行深度思考..."
                  className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none resize-none shadow-lg"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "p-3 rounded-full transition-all duration-200 shadow-lg",
                  inputValue.trim() && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* 快捷操作按钮 */}
            <div className="flex items-center justify-center space-x-3 mt-6">
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 rounded-full transition-all duration-200 border border-blue-200/50 hover:border-blue-300/50 shadow-sm hover:shadow-md">
                <Target className="w-4 h-4 inline mr-2" />
                分析问题
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 rounded-full transition-all duration-200 border border-purple-200/50 hover:border-purple-300/50 shadow-sm hover:shadow-md">
                <Brain className="w-4 h-4 inline mr-2" />
                逻辑推理
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-50 to-cyan-50 hover:from-indigo-100 hover:to-cyan-100 text-indigo-700 rounded-full transition-all duration-200 border border-indigo-200/50 hover:border-indigo-300/50 shadow-sm hover:shadow-md">
                <Lightbulb className="w-4 h-4 inline mr-2" />
                创意思考
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 text-cyan-700 rounded-full transition-all duration-200 border border-cyan-200/50 hover:border-cyan-300/50 shadow-sm hover:shadow-md">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                决策建议
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
