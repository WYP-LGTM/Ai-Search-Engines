/**
 * 搜索栏组件 - 提供搜索输入和交互功能
 * 
 * 功能特性：
 * - 搜索输入框和提交功能
 * - 语音搜索和图片搜索按钮
 * - 搜索状态指示和加载动画
 * - 智能搜索建议显示
 * - 热门搜索和历史记录
 * - 相关搜索推荐
 * - 响应式设计和动画效果
 * - Web Speech API语音识别集成
 * 
 * 技术实现：
 * - 使用Framer Motion实现动画效果
 * - 集成useRef管理输入框焦点
 * - 支持键盘和按钮提交
 * - 实时状态反馈和视觉提示
 * - 使用Web Speech API进行语音识别
 * - 本地存储搜索历史
 * - 智能搜索建议算法
 */
import { useState, useRef, useEffect } from 'react';
import { Search, Mic, Camera, Send, Volume2, Clock, TrendingUp, Sparkles, ArrowRight, X, History, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ImageRecognition } from './ImageRecognition';

/**
 * 搜索建议项接口
 */
interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'trending' | 'related' | 'smart';
  icon?: React.ReactNode;
  count?: number;
}

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
  
  // 搜索建议状态
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  
  // 搜索历史状态
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // 当前选中的建议索引
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
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

  // 图像识别相关状态
  const [showImageRecognition, setShowImageRecognition] = useState(false);

  /**
   * 从本地存储加载搜索历史
   */
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error('加载搜索历史失败:', error);
      }
    }
  }, []);

  /**
   * 保存搜索历史到本地存储
   */
  const saveSearchHistory = (searchTerm: string) => {
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  /**
   * 清除搜索历史
   */
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  /**
   * 生成智能搜索建议
   */
  const generateSuggestions = (input: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    if (!input.trim()) {
      // 空输入时显示热门搜索和历史记录
      if (searchHistory.length > 0) {
        suggestions.push({
          id: 'history-header',
          text: '搜索历史',
          type: 'history',
          icon: <History className="w-4 h-4" />
        });
        searchHistory.slice(0, 5).forEach((item, index) => {
          suggestions.push({
            id: `history-${index}`,
            text: item,
            type: 'history',
            icon: <Clock className="w-4 h-4" />
          });
        });
      }
      
      // 热门搜索
      const trendingSearches = [
        '人工智能发展趋势',
        '机器学习算法',
        '深度学习框架',
        '自然语言处理',
        '计算机视觉技术',
        '数据科学工具',
        '云计算平台',
        '区块链应用'
      ];
      
      suggestions.push({
        id: 'trending-header',
        text: '热门搜索',
        type: 'trending',
        icon: <TrendingUp className="w-4 h-4" />
      });
      
      trendingSearches.slice(0, 5).forEach((item, index) => {
        suggestions.push({
          id: `trending-${index}`,
          text: item,
          type: 'trending',
          icon: <Zap className="w-4 h-4" />
        });
      });
      
      return suggestions;
    }

    // 有输入时生成相关建议
    const inputLower = input.toLowerCase();
    
    // 从历史记录中匹配
    const historyMatches = searchHistory
      .filter(item => item.toLowerCase().includes(inputLower))
      .slice(0, 3)
      .map((item, index) => ({
        id: `history-match-${index}`,
        text: item,
        type: 'history' as const,
        icon: <Clock className="w-4 h-4" />
      }));
    
    suggestions.push(...historyMatches);

    // 智能建议
    const smartSuggestions = generateSmartSuggestions(input);
    suggestions.push(...smartSuggestions);

    // 相关搜索
    const relatedSearches = generateRelatedSearches(input);
    suggestions.push(...relatedSearches);

    return suggestions.slice(0, 8); // 限制建议数量
  };

  /**
   * 生成智能搜索建议
   */
  const generateSmartSuggestions = (input: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    const inputLower = input.toLowerCase();
    
    // 基于输入内容生成智能建议
    if (inputLower.includes('ai') || inputLower.includes('人工智能')) {
      suggestions.push({
        id: 'smart-ai',
        text: `${input} 发展趋势`,
        type: 'smart',
        icon: <Sparkles className="w-4 h-4" />
      });
      suggestions.push({
        id: 'smart-ai-app',
        text: `${input} 应用场景`,
        type: 'smart',
        icon: <Sparkles className="w-4 h-4" />
      });
    }
    
    if (inputLower.includes('学习') || inputLower.includes('learn')) {
      suggestions.push({
        id: 'smart-learn',
        text: `${input} 教程`,
        type: 'smart',
        icon: <Sparkles className="w-4 h-4" />
      });
      suggestions.push({
        id: 'smart-learn-resource',
        text: `${input} 资源推荐`,
        type: 'smart',
        icon: <Sparkles className="w-4 h-4" />
      });
    }
    
    if (inputLower.includes('技术') || inputLower.includes('tech')) {
      suggestions.push({
        id: 'smart-tech',
        text: `${input} 最新进展`,
        type: 'smart',
        icon: <Sparkles className="w-4 h-4" />
      });
    }
    
    // 通用建议
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'smart-general',
        text: `${input} 是什么`,
        type: 'smart',
        icon: <Sparkles className="w-4 h-4" />
      });
      suggestions.push({
        id: 'smart-how',
        text: `如何${input}`,
        type: 'smart',
        icon: <Sparkles className="w-4 h-4" />
      });
    }
    
    return suggestions;
  };

  /**
   * 生成相关搜索
   */
  const generateRelatedSearches = (input: string): SearchSuggestion[] => {
    const relatedMap: Record<string, string[]> = {
      'ai': ['机器学习', '深度学习', '神经网络', '自然语言处理'],
      '机器学习': ['深度学习', '监督学习', '无监督学习', '强化学习'],
      '深度学习': ['神经网络', '卷积神经网络', '循环神经网络', 'Transformer'],
      'python': ['数据分析', '机器学习', 'Web开发', '自动化'],
      'javascript': ['前端开发', 'Node.js', 'React', 'Vue'],
      'react': ['前端框架', '组件化', '状态管理', 'Hooks'],
      '数据库': ['SQL', 'NoSQL', 'MongoDB', 'Redis'],
      '云计算': ['AWS', 'Azure', 'Google Cloud', 'Docker']
    };
    
    const inputLower = input.toLowerCase();
    const related: SearchSuggestion[] = [];
    
    for (const [key, values] of Object.entries(relatedMap)) {
      if (inputLower.includes(key)) {
        values.slice(0, 2).forEach((value, index) => {
          related.push({
            id: `related-${key}-${index}`,
            text: value,
            type: 'related',
            icon: <ArrowRight className="w-4 h-4" />
          });
        });
        break;
      }
    }
    
    return related;
  };

  /**
   * 更新搜索建议
   */
  useEffect(() => {
    if (isFocused) {
      const newSuggestions = generateSuggestions(query);
      setSuggestions(newSuggestions);
      // 重置选中索引
      setSelectedIndex(-1);
    }
  }, [query, isFocused, searchHistory]);

  /**
   * 处理键盘导航
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          if (suggestion.type !== 'history' && !suggestion.text.includes('搜索历史') && !suggestion.text.includes('热门搜索')) {
            handleSuggestionClick(suggestion);
          }
        } else if (query.trim()) {
          const formEvent = { preventDefault: () => {} } as React.FormEvent;
          handleSubmit(formEvent);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsFocused(false);
        setSelectedIndex(-1);
        break;
    }
  };

  /**
   * 处理搜索表单提交
   * @param e 表单提交事件
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 阻止默认表单提交行为
    
    // 只有当搜索词不为空且不在加载状态时才执行搜索
    if (query.trim() && !isLoading) {
      const searchTerm = query.trim();
      saveSearchHistory(searchTerm);
      onSearch(searchTerm);
    }
  };

  /**
   * 处理建议项点击
   */
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'history' || suggestion.type === 'trending' || 
        suggestion.type === 'related' || suggestion.type === 'smart') {
      setQuery(suggestion.text);
      saveSearchHistory(suggestion.text);
      onSearch(suggestion.text);
      setIsFocused(false);
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
    saveSearchHistory(query);
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

  /**
   * 点击外部区域关闭弹框
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFocused && suggestions.length > 0) {
        const target = event.target as Element;
        if (!target.closest('.search-container')) {
          setIsFocused(false);
          setSelectedIndex(-1);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFocused, suggestions.length]);

  /**
   * 清理图像识别状态当组件卸载时
   */
  useEffect(() => {
    return () => {
      if (showImageRecognition) {
        setShowImageRecognition(false);
      }
    };
  }, [showImageRecognition]);

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
        saveSearchHistory(transcript);
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
      <form onSubmit={handleSubmit} className="relative z-10 search-container">
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
            onBlur={() => {
              // 延迟清除焦点状态，让用户有时间点击建议
              setTimeout(() => setIsFocused(false), 200);
            }}
            onKeyDown={handleKeyDown}                  // 处理键盘导航
            placeholder={placeholder}
            className="flex-1 px-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent outline-none text-lg"
            disabled={isLoading} // 加载时禁用输入
          />
          
          {/* 右侧按钮组 */}
          <div className="flex items-center space-x-2 pr-4">
            {/* 语音搜索按钮 */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={!isSpeechSupported || isLoading}
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                isListening 
                  ? "bg-red-500 text-white shadow-lg animate-pulse" // 正在监听状态
                  : "text-gray-400 hover:text-primary-500 hover:bg-gray-100", // 默认状态
                !isSpeechSupported && "opacity-50 cursor-not-allowed" // 不支持状态
              )}
              title={isListening ? "停止语音识别" : "语音搜索"}
            >
              <Mic className="w-5 h-5" />
            </button>
            
            {/* 图片搜索按钮 */}
            <button
              type="button"
              onClick={handleImageSearch}
              disabled={isLoading}
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                showImageRecognition 
                  ? "bg-primary-500 text-white shadow-lg" // 激活状态
                  : "text-gray-400 hover:text-primary-500 hover:bg-gray-100" // 默认状态
              )}
              title="图片搜索"
            >
              <Camera className="w-5 h-5" />
            </button>
            
            {/* 搜索提交按钮 */}
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={cn(
                "p-2 rounded-full transition-all duration-200",
                query.trim() && !isLoading
                  ? "bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl" // 激活状态
                  : "text-gray-400 cursor-not-allowed" // 禁用状态
              )}
              title="搜索"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

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
                      <Volume2 className="w-4 h-4 text-white" />
                    </div>
                    {/* 成功动画 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-green-300/50 rounded-full animate-pulse" />
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
        <AnimatePresence mode="wait">
          {showImageRecognition && (
            <motion.div
              key="image-recognition"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mt-4"
            >
              <ImageRecognition
                key="image-recognition-component"
                onSearch={handleImageRecognitionSearch}
                className="w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

                {/* 智能搜索建议弹框 */}
        <AnimatePresence>
          {isFocused && suggestions.length > 0 && !isListening && !showImageRecognition && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200/50 backdrop-blur-sm overflow-hidden"
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* 弹框顶部小三角 */}
              <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-gray-200/50 transform rotate-45" />
              
              <div className="max-h-96 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id}>
                    {/* 分类标题 */}
                    {suggestion.text.includes('搜索历史') || suggestion.text.includes('热门搜索') ? (
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          {suggestion.icon}
                          <span className="text-sm font-semibold text-gray-700">{suggestion.text}</span>
                        </div>
                        {suggestion.text.includes('搜索历史') && searchHistory.length > 0 && (
                          <button
                            onClick={clearSearchHistory}
                            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                            title="清除历史"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      /* 建议项 */
                      <button
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 group",
                          suggestions.indexOf(suggestion) === selectedIndex
                            ? "bg-primary-50 border-r-2 border-primary-500"
                            : "hover:bg-gray-50"
                        )}
                      >
                        {/* 图标 */}
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full",
                          suggestion.type === 'history' && "bg-blue-100 text-blue-600",
                          suggestion.type === 'trending' && "bg-orange-100 text-orange-600",
                          suggestion.type === 'smart' && "bg-purple-100 text-purple-600",
                          suggestion.type === 'related' && "bg-green-100 text-green-600"
                        )}>
                          {suggestion.icon}
                        </div>
                        
                        {/* 文本内容 */}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {suggestion.text}
                          </div>
                          {suggestion.count && (
                            <div className="text-xs text-gray-500 mt-1">
                              {suggestion.count} 次搜索
                            </div>
                          )}
                        </div>
                        
                        {/* 箭头图标 */}
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 底部提示 */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <div className="text-xs text-gray-500 text-center">
                  使用 ↑↓ 键导航，Enter 键选择，Esc 键关闭
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
