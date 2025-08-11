/**
 * 搜索历史记录组件 - 显示和管理用户的搜索历史
 * 
 * 功能特性：
 * - 显示最近的搜索记录列表
 * - 支持点击重新执行搜索
 * - 支持删除单个搜索记录
 * - 支持清空所有历史记录
 * - 显示搜索时间和结果数量
 * - 动画效果和交互反馈
 * 
 * 技术实现：
 * - 使用Framer Motion实现列表动画
 * - 响应式设计和滚动处理
 * - 悬停效果和状态管理
 * - 可访问性和用户体验优化
 */
import { History, Clock, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SearchQuery } from '../types';
import { formatDate } from '../utils';

/**
 * 搜索历史记录组件的属性接口
 */
interface SearchHistoryProps {
  queries: SearchQuery[];                    // 搜索记录数组
  onQuerySelect: (query: SearchQuery) => void; // 选择搜索记录的回调
  onQueryDelete: (id: string) => void;      // 删除单个记录的回调
  onClearAll: () => void;                   // 清空所有记录的回调
  isVisible: boolean;                       // 控制组件显示/隐藏
}

export function SearchHistory({ 
  queries, 
  onQuerySelect, 
  onQueryDelete, 
  onClearAll,
  isVisible 
}: SearchHistoryProps) {
  // 如果不可见或没有搜索记录，不渲染任何内容
  if (!isVisible || queries.length === 0) return null;

  return (
    // 主容器：带动画效果的历史记录面板
    <motion.div
      initial={{ opacity: 0, y: -10 }}  // 初始状态：透明且向上偏移
      animate={{ opacity: 1, y: 0 }}    // 动画状态：显示且回到原位
      exit={{ opacity: 0, y: -10 }}     // 退出状态：透明且向上偏移
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4">
        {/* 标题栏：显示"搜索历史"和"清空历史"按钮 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">搜索历史</span>
          </div>
          {/* 清空所有历史记录按钮 */}
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors duration-200"
          >
            清空历史
          </button>
        </div>
        
        {/* 搜索记录列表容器 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {/* 使用AnimatePresence处理列表项的动画 */}
          <AnimatePresence>
            {/* 只显示最近10条记录，避免列表过长 */}
            {queries.slice(0, 10).map((query, index) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, x: -20 }}    // 初始状态：透明且向左偏移
                animate={{ opacity: 1, x: 0 }}      // 动画状态：显示且回到原位
                exit={{ opacity: 0, x: 20 }}        // 退出状态：透明且向右偏移
                transition={{ duration: 0.2, delay: index * 0.05 }} // 错开动画时间
                className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {/* 搜索记录内容按钮 - 点击重新执行搜索 */}
                <button
                  onClick={() => onQuerySelect(query)}
                  className="flex items-center space-x-3 flex-1 text-left"
                >
                  {/* 搜索图标 */}
                  <Search className="w-4 h-4 text-gray-400" />
                  
                  {/* 搜索记录详细信息 */}
                  <div className="flex-1 min-w-0">
                    {/* 搜索关键词 */}
                    <div className="text-sm text-gray-900 truncate">
                      {query.query}
                    </div>
                    
                    {/* 元信息：时间和结果数量 */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(query.timestamp)}</span>
                      {/* 显示搜索结果数量（如果有的话） */}
                      {query.results.length > 0 && (
                        <span className="text-primary-600">
                          {query.results.length} 个结果
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                
                {/* 删除按钮 - 悬停时显示 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡，避免触发搜索
                    onQueryDelete(query.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all duration-200"
                  title="删除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* 更多记录提示 - 当记录超过10条时显示 */}
        {queries.length > 10 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              还有 {queries.length - 10} 条历史记录
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
