/**
 * AI深度思考页面组件 - 提供AI深度分析和思考功能
 * 
 * 功能特性：
 * - 类似ChatGPT的对话界面
 * - 支持多轮对话
 * - 显示思考过程
 * - 响应式设计
 * - 现代化UI交互
 * - 自动滚动到最新消息
 * - 隐藏滚动条设计
 * 
 * 设计参考：
 * - ChatGPT的界面布局
 * - 项目配色方案（蓝色系）
 * - 现代化交互体验
 * - 毛玻璃效果和渐变设计
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Brain, Lightbulb, Zap, Clock, User, Bot, Sparkles, Target, TrendingUp } from 'lucide-react';
import { cn } from '../utils';

/**
 * 消息接口 - 定义对话消息的数据结构
 * @interface Message
 * @property {string} id - 消息唯一标识符
 * @property {'user' | 'ai'} type - 消息类型：用户消息或AI消息
 * @property {string} content - 消息内容
 * @property {Date} timestamp - 消息时间戳
 * @property {boolean} [isThinking] - 是否为思考状态（可选）
 */
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

/**
 * AI思考页面属性接口
 * @interface AiThinkingPageProps
 * @property {() => void} [onBackToHome] - 返回首页的回调函数（可选）
 */
interface AiThinkingPageProps {
  onBackToHome?: () => void;
}

/**
 * AI深度思考页面主组件
 * @param {AiThinkingPageProps} props - 组件属性
 * @returns {JSX.Element} 渲染的AI思考页面
 */
export function AiThinkingPage({ onBackToHome }: AiThinkingPageProps) {
  // 消息列表状态 - 存储所有对话消息
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '你好！我是AI深度思考助手。我可以帮助你进行深度分析、逻辑推理和创造性思考。请告诉我你想要探讨的问题或话题。',
      timestamp: new Date(),
    }
  ]);
  
  // 输入框值状态 - 存储用户当前输入的内容
  const [inputValue, setInputValue] = useState('');
  
  // 加载状态 - 控制AI思考时的加载动画
  const [isLoading, setIsLoading] = useState(false);
  
  // 滚动目标引用 - 用于自动滚动到对话底部
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 自动滚动到底部函数
   * 使用平滑滚动效果将页面滚动到最新消息位置
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * 自动滚动效果
   * 当消息列表或加载状态发生变化时，自动滚动到底部
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  /**
   * 发送消息处理函数
   * 处理用户发送消息的逻辑，包括添加用户消息和模拟AI回复
   */
  const handleSendMessage = () => {
    // 验证输入：如果输入为空或正在加载中，则不执行发送操作
    if (!inputValue.trim() || isLoading) return;

    // 创建用户消息对象
    const userMessage: Message = {
      id: Date.now().toString(), // 使用时间戳作为唯一ID
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    // 将用户消息添加到消息列表
    setMessages(prev => [...prev, userMessage]);
    
    // 清空输入框
    setInputValue('');
    
    // 设置加载状态，显示AI思考动画
    setIsLoading(true);

    // 模拟AI思考过程 - 2秒后生成回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(), // 确保ID唯一性
        type: 'ai',
        content: generateAiResponse(inputValue),
        timestamp: new Date(),
      };
      
      // 将AI回复添加到消息列表
      setMessages(prev => [...prev, aiMessage]);
      
      // 关闭加载状态
      setIsLoading(false);
    }, 2000);
  };

  /**
   * 生成AI回复内容
   * 根据用户输入生成模拟的AI深度思考回复
   * @param {string} query - 用户的输入问题
   * @returns {string} AI生成的回复内容
   */
  const generateAiResponse = (query: string): string => {
    // 预定义的AI回复模板数组
    const responses = [
      // 模板1：多角度分析型回复
      `关于"${query}"，让我从多个角度来深入分析：

首先，从逻辑层面来看，这个问题涉及...
其次，从实际应用角度考虑...
最后，从未来发展视角分析...

我的建议是：`,
      
      // 模板2：结构化思考型回复
      `这是一个很有趣的问题！让我进行深度思考：

1. 核心问题分析：${query}的本质是...
2. 影响因素：需要考虑...
3. 解决方案：基于以上分析，我建议...

希望这个分析对你有帮助！`,
      
      // 模板3：系统性思维型回复
      `让我用系统性的思维来思考"${query}"：

**问题拆解：**
- 表层现象：...
- 深层原因：...
- 根本问题：...

**思考过程：**
通过多维度分析，我认为...

你觉得这个思考方向如何？`
    ];
    
    // 随机选择一个回复模板返回
    return responses[Math.floor(Math.random() * responses.length)];
  };

  /**
   * 返回首页处理函数
   * 处理用户点击返回按钮的逻辑
   */
  const handleBackToHome = () => {
    if (onBackToHome) {
      // 如果提供了返回首页的回调函数，则调用它
      onBackToHome();
    } else {
      // 默认行为：刷新页面
      window.location.reload();
    }
  };

  return (
    // 主容器：全屏高度，渐变背景，弹性布局，相对定位，隐藏溢出
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 - 创建动态视觉效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 左上角装饰圆环 - 蓝色到紫色渐变 */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* 右上角装饰圆环 - 靛蓝到青色渐变，延迟1秒 */}
        <div className="absolute -top-32 -right-32 w-48 h-48 bg-gradient-to-bl from-indigo-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* 左下角装饰圆环 - 紫色到粉色渐变，延迟2秒 */}
        <div className="absolute -bottom-24 -left-24 w-36 h-36 bg-gradient-to-tr from-purple-400/25 to-pink-500/25 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* 右下角装饰圆环 - 青色到蓝色渐变，延迟0.5秒 */}
        <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-gradient-to-tl from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
      </div>

                   {/* 顶部导航栏 - 固定在顶部，毛玻璃效果 */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 z-40 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧区域：返回按钮和标题 */}
            <div className="flex items-center space-x-4">
              {/* 返回首页按钮 */}
              <button
                onClick={handleBackToHome}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="返回首页"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {/* 应用标题和图标 */}
              <div className="flex items-center space-x-3">
                {/* AI图标 - 渐变背景 */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                {/* 标题文字 */}
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    AI深度思考
                  </h1>
                  <p className="text-sm text-gray-600">智能分析与逻辑推理</p>
                </div>
              </div>
            </div>
            
            {/* 右侧区域：状态指示器和升级按钮 */}
            <div className="flex items-center space-x-3">
              {/* 在线状态指示器 */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">在线</span>
              </div>
              {/* 升级按钮 */}
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                升级到专业版
              </button>
            </div>
          </div>
        </div>
      </header>

            {/* 主要内容区域 - 弹性布局，居中容器 */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full relative min-h-0">
        {/* 对话区域 - 固定高度，可滚动，隐藏滚动条 */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 min-h-0 scrollbar-hide">
          {/* 消息列表 - 使用Framer Motion实现动画效果 */}
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }} // 初始状态：透明且向下偏移
                animate={{ opacity: 1, y: 0 }} // 动画状态：显示且回到原位
                transition={{ duration: 0.4, delay: index * 0.1 }} // 动画时长和延迟
                className={cn(
                  "flex space-x-4",
                  message.type === 'user' ? "justify-end" : "justify-start" // 用户消息右对齐，AI消息左对齐
                )}
              >
                {/* AI消息头像 - 仅在AI消息时显示 */}
                {message.type === 'ai' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                {/* 消息气泡 */}
                <div className={cn(
                  "max-w-4xl rounded-2xl px-6 py-4 shadow-lg",
                  message.type === 'user' 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" // 用户消息：蓝紫渐变背景
                    : "bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl" // AI消息：半透明白色背景
                )}>
                  <div className="flex items-start space-x-3">
                    {/* AI思考动画 - 仅在AI思考状态时显示 */}
                    {message.type === 'ai' && message.isThinking && (
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                    
                    {/* 消息内容区域 */}
                    <div className="flex-1">
                      {/* 消息文本内容 */}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* AI消息的元信息 - 仅在AI消息时显示 */}
                      {message.type === 'ai' && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          {/* 左侧信息：时间、思考类型 */}
                          <div className="flex items-center space-x-4">
                            {/* 时间戳 */}
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                            </div>
                            
                            {/* 深度思考标签 */}
                            <div className="flex items-center space-x-1 text-xs text-blue-600 font-medium">
                              <Lightbulb className="w-3 h-3" />
                              <span>深度思考</span>
                            </div>
                            
                            {/* 智能分析标签 */}
                            <div className="flex items-center space-x-1 text-xs text-purple-600 font-medium">
                              <Zap className="w-3 h-3" />
                              <span>智能分析</span>
                            </div>
                          </div>
                          
                          {/* 右侧信息：AI生成标识 */}
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">AI生成</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 用户消息头像 - 仅在用户消息时显示 */}
                {message.type === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
                    {/* AI思考加载状态 - 显示思考动画 */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} // 初始状态：透明且向下偏移
              animate={{ opacity: 1, y: 0 }} // 动画状态：显示且回到原位
              className="flex space-x-4 justify-start"
            >
              {/* AI头像 */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              
              {/* 思考状态气泡 */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-3">
                  {/* 思考动画点 */}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {/* 思考状态文字 */}
                  <span className="text-sm text-gray-600 font-medium">AI正在深度思考中...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 滚动目标元素 - 用于自动滚动到底部 */}
          <div ref={messagesEndRef} />
         </div>

                         {/* 输入区域 - 固定在底部，渐变背景 */}
        <div className="bg-gradient-to-t from-white via-blue-50/20 to-purple-50/20 backdrop-blur-2xl border-t border-white/20 p-6 relative flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* 主输入区域 */}
            <div className="relative">
              <div className="flex items-end gap-3">
                {/* 输入框容器 */}
                <div className="flex-1 relative group">
                  {/* 文本输入框 */}
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      // 按Enter键发送消息（Shift+Enter换行）
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="输入你的问题，让AI进行深度思考..."
                    className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-blue-400/40 focus:border-blue-300/50 outline-none resize-none shadow-lg text-gray-800 placeholder-gray-500 transition-all duration-300 group-hover:bg-white/80 group-hover:border-blue-200/50"
                    rows={1}
                    style={{ minHeight: '52px', maxHeight: '120px' }}
                  />
                  {/* 悬停时的渐变叠加效果 */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                
                {/* 发送按钮 */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    "relative p-4 rounded-2xl transition-all duration-300 shadow-lg group",
                    inputValue.trim() && !isLoading
                      ? "bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 text-white hover:shadow-xl hover:scale-105" // 激活状态
                      : "bg-gray-200 text-gray-400 cursor-not-allowed hover:scale-100" // 禁用状态
                  )}
                >
                  {/* 发送图标 */}
                  <Send className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  {/* 悬停时的高光效果 */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
            
            {/* 快捷操作按钮区域 */}
            <div className="mt-4 flex items-center justify-center gap-3">
              {/* 分析问题按钮 */}
              <button className="group relative px-4 py-2.5 text-sm bg-white/60 hover:bg-white/80 backdrop-blur-sm text-blue-700 rounded-xl transition-all duration-300 border border-white/40 hover:border-blue-200/50 shadow-sm hover:shadow-md hover:scale-105">
                <Target className="w-4 h-4 inline mr-2 transition-transform duration-200 group-hover:scale-110" />
                分析问题
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              {/* 逻辑推理按钮 */}
              <button className="group relative px-4 py-2.5 text-sm bg-white/60 hover:bg-white/80 backdrop-blur-sm text-purple-700 rounded-xl transition-all duration-300 border border-white/40 hover:border-purple-200/50 shadow-sm hover:shadow-md hover:scale-105">
                <Brain className="w-4 h-4 inline mr-2 transition-transform duration-200 group-hover:scale-110" />
                逻辑推理
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              {/* 创意思考按钮 */}
              <button className="group relative px-4 py-2.5 text-sm bg-white/60 hover:bg-white/80 backdrop-blur-sm text-indigo-700 rounded-xl transition-all duration-300 border border-white/40 hover:border-indigo-200/50 shadow-sm hover:shadow-md hover:scale-105">
                <Lightbulb className="w-4 h-4 inline mr-2 transition-transform duration-200 group-hover:scale-110" />
                创意思考
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              {/* 决策建议按钮 */}
              <button className="group relative px-4 py-2.5 text-sm bg-white/60 hover:bg-white/80 backdrop-blur-sm text-cyan-700 rounded-xl transition-all duration-300 border border-white/40 hover:border-cyan-200/50 shadow-sm hover:shadow-md hover:scale-105">
                <TrendingUp className="w-4 h-4 inline mr-2 transition-transform duration-200 group-hover:scale-110" />
                决策建议
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
