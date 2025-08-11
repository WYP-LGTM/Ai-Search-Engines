/**
 * 搜索栏组件 - 提供搜索输入和交互功能
 * 
 * 功能特性：
 * - 搜索输入框和提交功能
 * - 语音搜索和图片搜索按钮（模拟）
 * - 搜索状态指示和加载动画
 * - 搜索建议显示
 * - 响应式设计和动画效果
 * 
 * 技术实现：
 * - 使用Framer Motion实现动画效果
 * - 集成useRef管理输入框焦点
 * - 支持键盘和按钮提交
 * - 实时状态反馈和视觉提示
 */
import { useState, useRef, useEffect } from 'react';
import { Search, Mic, Camera, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils';

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
   * 目前是模拟功能，实际项目中可以集成Web Speech API
   */
  const handleVoiceSearch = () => {
    // 语音搜索功能（模拟）
    alert('语音搜索功能开发中...');
  };

  /**
   * 处理图片搜索按钮点击
   * 目前是模拟功能，实际项目中可以集成文件上传和图像识别
   */
  const handleImageSearch = () => {
    // 图片搜索功能（模拟）
    alert('图片搜索功能开发中...');
  };

  /**
   * 当焦点状态改变时，程序化控制输入框焦点
   */
  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

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
            value={query}
            onChange={(e) => setQuery(e.target.value)} // 更新搜索关键词
            onFocus={() => setIsFocused(true)}         // 设置焦点状态
            onBlur={() => setIsFocused(false)}        // 清除焦点状态
            placeholder={placeholder}
            disabled={isLoading} // 加载时禁用输入
            className="flex-1 px-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent outline-none text-lg"
          />
          
          {/* 右侧功能按钮组 */}
          <div className="flex items-center pr-2 space-x-1">
            {/* 语音搜索按钮 */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className="p-2 text-gray-400 hover:text-primary-500 transition-colors duration-200 rounded-full hover:bg-gray-100"
              title="语音搜索"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            {/* 图片搜索按钮 */}
            <button
              type="button"
              onClick={handleImageSearch}
              className="p-2 text-gray-400 hover:text-primary-500 transition-colors duration-200 rounded-full hover:bg-gray-100"
              title="图片搜索"
            >
              <Camera className="w-5 h-5" />
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
      
      {/* 搜索建议面板 - 仅在焦点且有输入时显示 */}
      {isFocused && query && (
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
