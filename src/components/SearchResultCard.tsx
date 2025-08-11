/**
 * 搜索结果卡片组件 - 显示单个搜索结果的详细信息
 * 
 * 功能特性：
 * - 显示搜索结果标题、内容和元信息
 * - 根据内容类型显示不同图标和颜色
 * - 显示相关性评分和发布时间
 * - 支持点击跳转到原始链接
 * - 动画效果和悬停交互
 * 
 * 技术实现：
 * - 使用Framer Motion实现入场动画
 * - 类型映射系统处理不同内容类型
 * - 响应式设计和文本截断
 * - 可访问性和用户体验优化
 */
import { ExternalLink, Clock, Globe, Image, Video, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SearchResult } from '../types';
import { cn, formatDate, truncateText } from '../utils';

/**
 * 搜索结果卡片组件的属性接口
 */
interface SearchResultCardProps {
  result: SearchResult;                                    // 搜索结果数据
  onResultClick?: (result: SearchResult) => void;         // 点击回调函数（可选）
  index: number;                                          // 在列表中的索引，用于动画延迟
}

/**
 * 内容类型图标映射
 * 根据搜索结果类型显示对应的图标
 */
const typeIcons = {
  web: Globe,     // 网页类型：地球图标
  news: FileText, // 新闻类型：文档图标
  image: Image,   // 图片类型：图片图标
  video: Video,   // 视频类型：视频图标
};

/**
 * 内容类型颜色映射
 * 为不同类型的内容提供视觉区分
 */
const typeColors = {
  web: 'text-blue-600 bg-blue-50',     // 网页：蓝色系
  news: 'text-green-600 bg-green-50',  // 新闻：绿色系
  image: 'text-purple-600 bg-purple-50', // 图片：紫色系
  video: 'text-red-600 bg-red-50',     // 视频：红色系
};

export function SearchResultCard({ result, onResultClick, index }: SearchResultCardProps) {
  // 根据结果类型获取对应的图标组件
  const TypeIcon = typeIcons[result.type];
  
  // 根据结果类型获取对应的颜色样式
  const typeColor = typeColors[result.type];

  /**
   * 处理卡片点击事件
   * 优先使用自定义点击处理函数，否则打开原始链接
   */
  const handleClick = () => {
    if (onResultClick) {
      // 如果有自定义点击处理函数，使用它
      onResultClick(result);
    } else if (result.url) {
      // 否则在新标签页中打开原始链接
      window.open(result.url, '_blank');
    }
  };

  return (
    // 主容器：带动画效果的搜索结果卡片
    <motion.div
      initial={{ opacity: 0, y: 20 }}                    // 初始状态：透明且向下偏移
      animate={{ opacity: 1, y: 0 }}                     // 动画状态：显示且回到原位
      transition={{ duration: 0.3, delay: index * 0.1 }} // 根据索引错开动画时间
      className="group cursor-pointer"                   // 群组样式和鼠标指针
      onClick={handleClick}
    >
      {/* 卡片内容容器 */}
      <div className="card hover:shadow-md transition-all duration-200 hover:border-primary-200">
        <div className="flex items-start space-x-4">
          {/* 类型图标区域 */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            typeColor // 应用类型对应的颜色样式
          )}>
            <TypeIcon className="w-5 h-5" />
          </div>
          
          {/* 主要内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 标题和外部链接图标 */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                {result.title}
              </h3>
              {/* 外部链接图标 - 悬停时变色 */}
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors duration-200 flex-shrink-0 ml-2" />
            </div>
            
            {/* 内容摘要 */}
            <p className="text-gray-600 mb-3 line-clamp-3">
              {truncateText(result.content, 200)} {/* 截断过长的内容 */}
            </p>
            
            {/* 元信息区域 */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              {/* 左侧：来源和时间信息 */}
              <div className="flex items-center space-x-4">
                {/* 来源信息 */}
                {result.source && (
                  <span className="flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    {result.source}
                  </span>
                )}
                {/* 发布时间 */}
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(result.timestamp)}
                </span>
              </div>
              
              {/* 右侧：相关性评分 */}
              <div className="flex items-center space-x-1">
                {/* 星级评分显示 */}
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        star <= Math.round(result.relevance * 5)
                          ? "bg-yellow-400"  // 高相关性：黄色
                          : "bg-gray-200"    // 低相关性：灰色
                      )}
                    />
                  ))}
                </div>
                {/* 百分比评分 */}
                <span className="text-xs">
                  {Math.round(result.relevance * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
