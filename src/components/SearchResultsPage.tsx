/**
 * 搜索结果页面组件 - 显示搜索结果的详细页面
 * 
 * 功能特性：
 * - 显示搜索结果列表/网格视图
 * - 提供筛选和排序功能
 * - 支持列表/网格视图切换
 * - 显示搜索状态和错误信息
 * - 响应式设计和动画效果
 * 
 * 技术实现：
 * - 使用Framer Motion实现筛选面板动画
 * - 集成SearchContext获取搜索结果
 * - 实现结果筛选和排序逻辑
 * - 支持多种视图模式切换
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, Grid, List } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { SearchResultCard } from './SearchResultCard';
import { useSearch } from '../contexts/SearchContext';
import type { FilterOptions } from '../types';
import { cn } from '../utils';

export function SearchResultsPage() {
  // 从SearchContext获取当前搜索查询
  const { currentQuery, addQuery } = useSearch();
  
  // 视图模式状态：列表或网格
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // 控制筛选面板的显示/隐藏
  const [showFilters, setShowFilters] = useState(false);
  
  // 筛选选项状态
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',        // 内容类型筛选
    timeRange: 'all',   // 时间范围筛选
    sortBy: 'relevance' // 排序方式
  });

  // 如果没有当前查询，不渲染任何内容
  if (!currentQuery) {
    return null;
  }

  /**
   * 处理返回首页事件
   * 目前使用页面刷新，实际项目中应该使用路由导航
   */
  const handleBackToHome = () => {
    // 这里可以添加返回首页的逻辑
    window.location.reload();
  };

  /**
   * 处理新的搜索请求
   * @param query 新的搜索关键词
   */
  const handleNewSearch = (query: string) => {
    addQuery(query);
  };

  /**
   * 根据筛选条件过滤搜索结果
   * 目前只实现了内容类型筛选，可以扩展其他筛选条件
   */
  const filteredResults = currentQuery.results.filter(result => {
    // 如果筛选类型不是"全部"且结果类型不匹配，则过滤掉
    if (filters.type !== 'all' && result.type !== filters.type) {
      return false;
    }
    return true;
  });

  /**
   * 对过滤后的结果进行排序
   * 支持按相关性、时间、标题排序
   */
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (filters.sortBy) {
      case 'relevance':
        // 按相关性分数降序排列（分数高的在前）
        return b.relevance - a.relevance;
      case 'date':
        // 按时间戳降序排列（最新的在前）
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'title':
        // 按标题字母顺序排列
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    // 主容器：全屏高度，浅灰色背景
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 固定定位，包含搜索栏和操作按钮 */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮和搜索栏 */}
            <div className="flex items-center space-x-4">
              {/* 返回首页按钮 */}
              <button
                onClick={handleBackToHome}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="返回首页"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {/* 搜索栏 - 显示当前搜索词 */}
              <div className="flex-1 max-w-2xl">
                <SearchBar
                  onSearch={handleNewSearch}
                  placeholder={currentQuery.query}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* 右侧：筛选和视图切换按钮 */}
            <div className="flex items-center space-x-3">
              {/* 筛选按钮 - 切换筛选面板显示 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "relative group px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105",
                  showFilters 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "bg-white/70 hover:bg-white text-gray-700 border border-white/50 hover:border-blue-200/50"
                )}
                title="筛选选项"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">筛选</span>
                  {showFilters && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </div>
                {/* 悬停效果 */}
                <div className={cn(
                  "absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  showFilters && "opacity-100"
                )} />
              </button>
              
              {/* 视图切换按钮 - 在列表和网格视图间切换 */}
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="relative group px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-gray-700 border border-white/50 hover:border-blue-200/50 transition-all duration-300 transform hover:scale-105"
                title={`切换到${viewMode === 'list' ? '网格' : '列表'}视图`}
              >
                <div className="flex items-center space-x-2">
                  {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  <span className="text-sm font-medium">{viewMode === 'list' ? '网格' : '列表'}</span>
                </div>
                {/* 悬停效果 */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索信息显示区域 */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-6 border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              {/* 搜索标题 - 显示搜索关键词 */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                🔍 搜索结果: "{currentQuery.query}"
              </h1>
              {/* 结果统计信息 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-gray-700 font-medium">
                    找到 <span className="text-blue-600 font-bold">{sortedResults.length}</span> 个结果
                  </p>
                </div>
                {currentQuery.isLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-600 text-sm font-medium">搜索中...</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 错误信息显示 */}
            {currentQuery.error && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-600 text-sm font-medium">{currentQuery.error}</span>
              </div>
            )}
          </div>
        </div>

        {/* 筛选面板 - 使用AnimatePresence实现平滑动画 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl shadow-lg border border-white/50 p-6 backdrop-blur-sm"
            >
              {/* 筛选标题 */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  筛选与排序
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">智能筛选</span>
                </div>
              </div>

              {/* 内容类型筛选 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📂 内容类型
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'all', label: '全部类型', icon: '🌐', color: 'from-blue-500 to-cyan-500' },
                    { value: 'web', label: '网页', icon: '🌍', color: 'from-green-500 to-emerald-500' },
                    { value: 'news', label: '新闻', icon: '📰', color: 'from-orange-500 to-red-500' },
                    { value: 'image', label: '图片', icon: '🖼️', color: 'from-purple-500 to-pink-500' },
                    { value: 'video', label: '视频', icon: '🎥', color: 'from-indigo-500 to-blue-500' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, type: option.value as any })}
                      className={cn(
                        "relative group p-3 rounded-xl transition-all duration-300 transform hover:scale-105",
                        filters.type === option.value
                          ? `bg-gradient-to-r ${option.color} text-white shadow-lg` // 选中状态
                          : "bg-white/70 hover:bg-white text-gray-700 border border-white/50 hover:border-blue-200/50" // 未选中状态
                      )}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div className="text-xs font-medium">{option.label}</div>
                      </div>
                      {/* 悬停效果 */}
                      <div className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        filters.type === option.value && "opacity-100"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 时间范围筛选 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ⏰ 时间范围
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'all', label: '全部时间', icon: '∞', color: 'from-gray-500 to-gray-600' },
                    { value: 'day', label: '24小时内', icon: '🌅', color: 'from-yellow-500 to-orange-500' },
                    { value: 'week', label: '一周内', icon: '📅', color: 'from-blue-500 to-indigo-500' },
                    { value: 'month', label: '一个月内', icon: '📆', color: 'from-green-500 to-teal-500' },
                    { value: 'year', label: '一年内', icon: '🎆', color: 'from-purple-500 to-pink-500' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, timeRange: option.value as any })}
                      className={cn(
                        "relative group p-3 rounded-xl transition-all duration-300 transform hover:scale-105",
                        filters.timeRange === option.value
                          ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                          : "bg-white/70 hover:bg-white text-gray-700 border border-white/50 hover:border-blue-200/50"
                      )}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div className="text-xs font-medium">{option.label}</div>
                      </div>
                      <div className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        filters.timeRange === option.value && "opacity-100"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 排序方式选择 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔄 排序方式
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'relevance', label: '相关性', icon: '🎯', color: 'from-red-500 to-pink-500' },
                    { value: 'date', label: '时间', icon: '📅', color: 'from-blue-500 to-indigo-500' },
                    { value: 'title', label: '标题', icon: '📝', color: 'from-green-500 to-emerald-500' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters({ ...filters, sortBy: option.value as any })}
                      className={cn(
                        "relative group p-4 rounded-xl transition-all duration-300 transform hover:scale-105",
                        filters.sortBy === option.value
                          ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                          : "bg-white/70 hover:bg-white text-gray-700 border border-white/50 hover:border-blue-200/50"
                      )}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <div className="text-xl">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </div>
                      <div className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        filters.sortBy === option.value && "opacity-100"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 筛选操作按钮 */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/30">
                <button
                  onClick={() => setFilters({ type: 'all', timeRange: 'all', sortBy: 'relevance' })}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  🔄 重置筛选
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">筛选已应用</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 搜索结果展示区域 */}
        <div className={cn(
          "space-y-4",
          viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        )}>
          {/* 使用AnimatePresence处理结果列表的动画 */}
          <AnimatePresence>
            {currentQuery.isLoading ? (
              // 加载状态显示
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  {/* 加载动画 */}
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">正在搜索中...</p>
                </div>
              </div>
            ) : sortedResults.length > 0 ? (
              // 有搜索结果时显示结果卡片
              sortedResults.map((result, index) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  index={index}
                />
              ))
            ) : (
              // 无搜索结果时显示空状态
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  {/* 空状态图标 */}
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关结果</h3>
                <p className="text-gray-600">尝试使用不同的关键词或调整筛选条件</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
