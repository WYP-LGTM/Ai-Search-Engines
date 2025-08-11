/**
 * 首页组件 - AI搜索引擎的主页面
 * 
 * 功能特性：
 * - 展示品牌Logo和标题
 * - 提供搜索输入框
 * - 显示搜索历史记录
 * - 展示产品功能特性
 * - 响应式设计和动画效果
 * 
 * 技术实现：
 * - 使用Framer Motion实现页面动画
 * - 集成SearchContext进行状态管理
 * - 响应式布局适配不同屏幕尺寸
 * - 毛玻璃效果和渐变背景
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { SearchHistory } from './SearchHistory';
import { useSearch } from '../contexts/SearchContext';
import type { SearchQuery } from '../types';

export function HomePage() {
  // 从SearchContext获取搜索相关的状态和方法
  const { queries, addQuery, clearQueries } = useSearch();
  
  // 控制搜索历史记录的显示/隐藏状态
  const [showHistory, setShowHistory] = useState(false);

  /**
   * 处理搜索提交事件
   * @param query 用户输入的搜索关键词
   */
  const handleSearch = (query: string) => {
    addQuery(query); // 将搜索词添加到历史记录
    setShowHistory(false); // 隐藏搜索历史
  };

  /**
   * 处理从历史记录中选择搜索词
   * @param query 选中的历史搜索记录
   */
  const handleQuerySelect = (query: SearchQuery) => {
    // 重新执行搜索
    addQuery(query.query);
    setShowHistory(false);
  };

  /**
   * 处理删除单个搜索历史记录
   * @param id 要删除的搜索记录ID
   */
  const handleQueryDelete = (id: string) => {
    // 这里可以添加删除单个查询的逻辑
    console.log('Delete query:', id);
  };

  /**
   * 处理清空所有搜索历史记录
   */
  const handleClearAll = () => {
    clearQueries();
    setShowHistory(false);
  };

  return (
    // 主容器：全屏高度，渐变背景从蓝色到紫色
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 背景装饰元素 - 创建动态视觉效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 右上角装饰圆环 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" />
        {/* 左下角装饰圆环 - 延迟动画 */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* 主要内容区域 - 相对定位确保在装饰元素之上 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo 和标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }} // 初始状态：透明且向上偏移
          animate={{ opacity: 1, y: 0 }}   // 动画状态：显示且回到原位
          transition={{ duration: 0.8 }}   // 动画持续0.8秒
          className="text-center mb-12"
        >
          {/* Logo容器 */}
          <div className="flex items-center justify-center mb-6">
            {/* Logo背景：渐变色彩，圆角矩形 */}
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              {/* 搜索图标 */}
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* 主标题：渐变文字效果 */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            AI 智能搜索
          </h1>
          
          {/* 副标题：描述文字 */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            基于人工智能的智能搜索引擎，为您提供精准、快速的搜索结果
          </p>
        </motion.div>

        {/* 搜索栏区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}  // 初始状态：透明且向下偏移
          animate={{ opacity: 1, y: 0 }}   // 动画状态：显示且回到原位
          transition={{ duration: 0.8, delay: 0.2 }} // 延迟0.2秒开始动画
          className="w-full max-w-4xl relative"
        >
          {/* 搜索输入框组件 */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="输入您想搜索的内容..."
            className="mb-8"
          />
          
          {/* 搜索历史记录组件 */}
          <SearchHistory
            queries={queries}
            onQuerySelect={handleQuerySelect}
            onQueryDelete={handleQueryDelete}
            onClearAll={handleClearAll}
            isVisible={showHistory}
          />
        </motion.div>

        {/* 功能特性展示区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl w-full"
        >
          {/* 功能特性数据 */}
          {[
            {
              icon: '🤖',
              title: 'AI 智能分析',
              description: '基于深度学习的智能分析，提供精准的搜索结果和相关性评分'
            },
            {
              icon: '⚡',
              title: '快速响应',
              description: '优化的搜索算法，毫秒级响应，让您快速找到所需信息'
            },
            {
              icon: '🎯',
              title: '多类型搜索',
              description: '支持网页、新闻、图片、视频等多种内容类型的智能搜索'
            }
          ].map((feature, index) => (
            // 每个功能特性卡片
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }} // 错开动画时间
              className="text-center p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
            >
              {/* 功能图标 */}
              <div className="text-4xl mb-4">{feature.icon}</div>
              {/* 功能标题 */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              {/* 功能描述 */}
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 底部版权信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>© 2024 AI 智能搜索引擎. 基于 React + TypeScript + Vite 构建</p>
        </motion.div>
      </div>
    </div>
  );
}
