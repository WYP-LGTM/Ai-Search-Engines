/**
 * 工具函数集合 - 提供项目中常用的辅助功能
 * 
 * 包含功能：
 * - CSS类名合并和冲突解决
 * - ID生成和时间格式化
 * - 文本处理和防抖函数
 * - 模拟搜索API调用
 * 
 * 技术实现：
 * - 使用clsx和tailwind-merge处理CSS类名
 * - 提供类型安全的工具函数
 * - 模拟真实的API调用延迟
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * CSS类名合并工具函数
 * 合并多个CSS类名，自动解决Tailwind CSS的冲突
 * 
 * @param inputs 要合并的CSS类名数组
 * @returns 合并后的CSS类名字符串
 * 
 * 使用示例：
 * cn('text-red-500', 'text-blue-500') // 返回 'text-blue-500'
 * cn('px-2 py-1', 'px-4') // 返回 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 生成唯一ID
 * 结合随机数和时间戳创建唯一的标识符
 * 
 * @returns 唯一的ID字符串
 * 
 * 使用场景：
 * - 为搜索查询生成唯一标识
 * - 为搜索结果生成唯一ID
 * - 其他需要唯一标识的场景
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 格式化日期显示
 * 将日期转换为相对时间或本地化格式
 * 
 * @param date 要格式化的日期（字符串或Date对象）
 * @returns 格式化后的日期字符串
 * 
 * 格式化规则：
 * - 1小时内：显示"刚刚"
 * - 24小时内：显示"X小时前"
 * - 7天内：显示"X天前"
 * - 超过7天：显示本地化日期格式
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return '刚刚';
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}天前`;
  } else {
    return d.toLocaleDateString('zh-CN');
  }
}

/**
 * 文本截断函数
 * 将过长的文本截断并添加省略号
 * 
 * @param text 要截断的文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 * 
 * 使用场景：
 * - 搜索结果内容预览
 * - 标题过长时的显示
 * - 其他需要限制文本长度的场景
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 防抖函数
 * 延迟执行函数，避免频繁调用
 * 
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 * 
 * 使用场景：
 * - 搜索输入框的实时搜索
 * - 窗口大小调整事件
 * - 其他需要防抖的场景
 * 
 * 使用示例：
 * const debouncedSearch = debounce(searchFunction, 300);
 * debouncedSearch('search term');
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 模拟搜索API调用
 * 生成模拟的搜索结果数据
 * 
 * @param query 搜索关键词
 * @returns Promise<SearchResult[]> 模拟的搜索结果数组
 * 
 * 功能特性：
 * - 根据搜索关键词生成相关结果
 * - 包含不同类型的内容（网页、新闻、图片）
 * - 模拟真实的API延迟（1-3秒）
 * - 提供相关性评分和时间戳
 * 
 * 模拟数据包括：
 * - 网页类型结果
 * - 新闻类型结果
 * - 图片类型结果
 * - 不同的相关性评分
 * - 不同的时间戳
 */
export function mockSearchResults(query: string) {
  // 模拟搜索结果数据
  const mockResults = [
    {
      id: generateId(),
      title: `关于"${query}"的最新信息`,
      content: `这是关于"${query}"的详细搜索结果。包含了相关的信息和数据，帮助用户更好地理解这个主题。`,
      url: 'https://example.com/result1',
      source: 'Example News',
      timestamp: new Date().toISOString(),
      type: 'web' as const,
      relevance: 0.95, // 高相关性
    },
    {
      id: generateId(),
      title: `${query} - 深度分析`,
      content: `深入分析"${query}"的各个方面，包括历史背景、现状和未来发展趋势。`,
      url: 'https://example.com/result2',
      source: 'Tech Blog',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1天前
      type: 'news' as const,
      relevance: 0.88, // 中等相关性
    },
    {
      id: generateId(),
      title: `${query} 相关图片`,
      content: `展示与"${query}"相关的图片和视觉内容。`,
      url: 'https://example.com/images',
      source: 'Image Gallery',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2天前
      type: 'image' as const,
      relevance: 0.82, // 较低相关性
    },
  ];
  
  // 返回Promise以模拟异步API调用
  return new Promise((resolve) => {
    // 随机延迟1-3秒，模拟真实的网络请求
    setTimeout(() => resolve(mockResults), 1000 + Math.random() * 2000);
  });
}
