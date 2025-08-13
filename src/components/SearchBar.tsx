/**
 * 搜索栏组件 - 提供搜索输入和交互功能
 * 
 * 功能特性：
 * - 搜索输入框和提交功能
 * - 语音搜索和图片搜索按钮
 * - 搜索状态指示和加载动画
 * - 搜索建议显示
 * - 响应式设计和动画效果
 * - Web Speech API语音识别集成
 * 
 * 技术实现：
 * - 使用Framer Motion实现动画效果
 * - 集成useRef管理输入框焦点
 * - 支持键盘和按钮提交
 * - 实时状态反馈和视觉提示
 * - 使用Web Speech API进行语音识别
 */
import { useState, useRef, useEffect } from 'react';
import { Search, Mic, Camera, Send, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ImageRecognition } from './ImageRecognition';

/**
 * 搜索栏组件的属性接口
 */
interface SearchBarProps {
  onSearch: (query: string) => void;  // 搜索提交回调函数
  isLoading?: boolean;                // 是否正在加载
  placeholder?: string;               // 输入框占位符
  className?: string;                 // 自定义CSS类名
}

export function SearchBar({ 
  onSearch, 
  isLoading = false, 
  placeholder = "搜索任何内容...",
  className 
}: SearchBarProps) {
  // 搜索关键词状态
  const [query, setQuery] = useState('');
  
  // 输入框焦点状态
  const [isFocused, setIsFocused] = useState(false);
  
  // 输入框引用，用于程序化控制焦点
  const inputRef = useRef<HTMLInputElement>(null);

  // 语音识别Hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    reset: resetSpeech
  } = useSpeechRecognition({
    language: 'zh-CN',
    continuous: false,
    interimResults: true,
    autoStop: true,
    autoStopDelay: 2000
  });

  /**
   * 处理搜索表单提交
   * @param e 表单提交事件
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 阻止默认表单提交行为
    
    // 只有当搜索词不为空且不在加载状态时才执行搜索
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  /**
   * 处理语音搜索按钮点击
   * 使用Web Speech API进行语音识别
   */
  const handleVoiceSearch = () => {
    if (!isSpeechSupported) {
      alert('当前浏览器不支持语音识别功能，请使用Chrome、Edge或Safari浏览器');
      return;
    }

    if (isListening) {
      // 如果正在监听，停止语音识别
      stopListening();
    } else {
      // 开始语音识别
      startListening();
    }
  };

  // 图像识别相关状态
  const [showImageRecognition, setShowImageRecognition] = useState(false);

  /**
   * 处理图片搜索按钮点击
   * 显示图像识别组件
   */
  const handleImageSearch = () => {
    setShowImageRecognition(!showImageRecognition);
  };

  /**
   * 处理图像识别搜索
   * @param query 识别结果关键词
   */
  const handleImageRecognitionSearch = (query: string) => {
    setQuery(query);
    onSearch(query);
    setShowImageRecognition(false);
  };

  /**
   * 当焦点状态改变时，程序化控制输入框焦点
   */
  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  // 语音识别成功状态
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * 处理语音识别结果
   * 当有最终识别结果时，自动填充到搜索框并执行搜索
   */
  useEffect(() => {
    if (transcript && !isListening) {
      // 有最终识别结果且不在监听状态时，填充到搜索框
      setQuery(transcript);
      setShowSuccess(true);
      
      // 延迟一点时间让用户看到结果，然后自动搜索
      setTimeout(() => {
        onSearch(transcript);
        resetSpeech(); // 重置语音识别状态
        // 隐藏成功提示
        setTimeout(() => setShowSuccess(false), 2000);
      }, 500);
    }
  }, [transcript, isListening, onSearch, resetSpeech]);

  /**
   * 处理语音识别错误
   */
  useEffect(() => {
    if (speechError) {
      console.error('语音识别错误:', speechError);
      // 可以在这里显示错误提示
    }
  }, [speechError]);

  return (
    // 主容器：带动画效果的搜索栏
    <motion.div
      initial={{ opacity: 0, y: 20 }}  // 初始状态：透明且向下偏移
      animate={{ opacity: 1, y: 0 }}   // 动画状态：显示且回到原位
      transition={{ duration: 0.5 }}   // 动画持续0.5秒
      className={cn(
        "w-full max-w-2xl mx-auto",
        className
      )}
    >
      {/* 搜索表单 */}
      <form onSubmit={handleSubmit} className="relative">
        {/* 搜索输入框容器 */}
        <div className={cn(
          "relative flex items-center bg-white rounded-full shadow-lg border-2 transition-all duration-300",
          isFocused ? "border-primary-500 shadow-xl" : "border-gray-200", // 焦点状态样式
          isLoading && "opacity-75" // 加载状态透明度
        )}>
          {/* 左侧搜索图标 */}
          <div className="flex items-center pl-4 pr-2">
            <Search 
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                isFocused ? "text-primary-500" : "text-gray-400" // 焦点状态颜色变化
              )} 
            />
          </div>
          
          {/* 搜索输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={isListening ? (interimTranscript || query) : query}
            onChange={(e) => setQuery(e.target.value)} // 更新搜索关键词
            onFocus={() => setIsFocused(true)}         // 设置焦点状态
            onBlur={() => setIsFocused(false)}        // 清除焦点状态
            placeholder={isListening ? "正在听您说话..." : placeholder}
            disabled={isLoading || isListening} // 加载或语音识别时禁用输入
            className="flex-1 px-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent outline-none text-lg"
          />
          
          {/* 右侧功能按钮组 */}
          <div className="flex items-center pr-2 space-x-1">
                         {/* 语音搜索按钮 */}
             <button
               type="button"
               onClick={handleVoiceSearch}
               disabled={!isSpeechSupported}
               className={cn(
                 "relative p-3 rounded-full transition-all duration-500 transform hover:scale-110",
                 isListening
                   ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200 animate-pulse" // 正在监听状态
                   : isSpeechSupported
                     ? "text-gray-400 hover:text-primary-500 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 hover:shadow-md" // 支持语音识别
                     : "text-gray-300 cursor-not-allowed bg-gray-100" // 不支持语音识别
               )}
               title={isListening ? "停止语音识别" : "开始语音识别"}
             >
               {isListening ? (
                 <div className="relative">
                   <Volume2 className="w-5 h-5" />
                   {/* 声波动画效果 */}
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-6 h-6 border-2 border-white/30 rounded-full animate-ping" />
                     <div className="absolute w-4 h-4 border-2 border-white/50 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                     <div className="absolute w-2 h-2 border-2 border-white/70 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                   </div>
                 </div>
               ) : (
                 <Mic className="w-5 h-5" />
               )}
               
               {/* 语音识别状态指示器 */}
               {isListening && (
                 <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-bounce shadow-lg">
                   <div className="w-full h-full bg-white rounded-full animate-ping" />
                 </div>
               )}
             </button>
            
                         {/* 图片搜索按钮 */}
             <button
               type="button"
               onClick={handleImageSearch}
               className={cn(
                 "relative p-3 rounded-full transition-all duration-300 transform hover:scale-110",
                 showImageRecognition
                   ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200"
                   : "text-gray-400 hover:text-primary-500 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 hover:shadow-md"
               )}
               title={showImageRecognition ? "关闭图像识别" : "图像识别搜索"}
             >
               <Camera className="w-5 h-5" />
               
               {/* 图像识别状态指示器 */}
               {showImageRecognition && (
                 <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-bounce shadow-lg">
                   <div className="w-full h-full bg-white rounded-full animate-ping" />
                 </div>
               )}
             </button>
            
            {/* 搜索提交按钮 */}
            <button
              type="submit"
              disabled={!query.trim() || isLoading} // 空内容或加载时禁用
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                query.trim() && !isLoading
                  ? "text-primary-500 hover:bg-primary-50" // 可点击状态
                  : "text-gray-300 cursor-not-allowed"     // 禁用状态
              )}
              title="搜索"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 加载状态遮罩层 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full"
          >
            {/* 加载动画 */}
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </form>
      
              {/* 语音识别状态提示 */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-3 bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 rounded-2xl shadow-xl border border-red-200/50 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* 动态麦克风图标 */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Mic className="w-4 h-4 text-white" />
                    </div>
                    {/* 声波动画 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-red-300/50 rounded-full animate-ping" />
                      <div className="absolute w-6 h-6 border-2 border-red-400/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
                      <div className="absolute w-3 h-3 border-2 border-red-500/30 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-red-700">
                      正在听您说话...
                    </span>
                    {interimTranscript && (
                      <span className="text-xs text-gray-600 mt-1 font-medium">
                        "{interimTranscript}"
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 停止按钮 */}
                <button
                  onClick={handleVoiceSearch}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  停止
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 语音识别成功提示 */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-3 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl border border-green-200/50 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* 成功图标 */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {/* 成功动画 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-green-300/50 rounded-full animate-ping" />
                      <div className="absolute w-6 h-6 border-2 border-green-400/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-green-700">
                      语音识别成功
                    </span>
                    <span className="text-xs text-gray-600 mt-1">
                      正在搜索: "{transcript}"
                    </span>
                  </div>
                </div>
                
                {/* 搜索中指示器 */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">搜索中...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 语音识别错误提示 */}
        <AnimatePresence>
          {speechError && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-3 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-2xl shadow-xl border border-red-200/50 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* 错误图标 */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    {/* 错误动画 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-red-300/50 rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-red-700">
                      语音识别错误
                    </span>
                    <span className="text-xs text-gray-600 mt-1">
                      {speechError.message}
                    </span>
                  </div>
                </div>
                
                {/* 重试按钮 */}
                <button
                  onClick={handleVoiceSearch}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  重试
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

                 {/* 图像识别组件 */}
         <AnimatePresence>
           {showImageRecognition && (
             <motion.div
               initial={{ opacity: 0, y: -10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -10, scale: 0.95 }}
               className="mt-4"
             >
               <ImageRecognition
                 onSearch={handleImageRecognitionSearch}
                 className="w-full"
               />
             </motion.div>
           )}
         </AnimatePresence>

         {/* 搜索建议面板 - 仅在焦点且有输入时显示 */}
         {isFocused && query && !isListening && !showImageRecognition && (
           <motion.div
             initial={{ opacity: 0, y: -10 }} // 初始状态：透明且向上偏移
             animate={{ opacity: 1, y: 0 }}   // 动画状态：显示且回到原位
             className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
           >
             <div className="text-sm text-gray-500 px-3 py-1">
               搜索建议: "{query}"
             </div>
           </motion.div>
         )}
    </motion.div>
  );
}
