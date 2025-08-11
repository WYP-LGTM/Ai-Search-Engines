/**
 * 类型定义文件 - 定义项目中使用的所有TypeScript接口和类型
 * 
 * 包含内容：
 * - 搜索结果数据结构
 * - 搜索查询数据结构
 * - 上下文类型定义
 * - 组件属性接口
 * - 筛选选项类型
 * 
 * 设计原则：
 * - 类型安全：确保编译时类型检查
 * - 可扩展性：支持未来功能扩展
 * - 可读性：清晰的字段命名和注释
 */

/**
 * 搜索结果接口
 * 定义单个搜索结果的完整数据结构
 */
export interface SearchResult {
  id: string;                                    // 唯一标识符
  title: string;                                 // 搜索结果标题
  content: string;                               // 搜索结果内容摘要
  url?: string;                                  // 原始链接地址（可选）
  source?: string;                               // 来源网站或平台（可选）
  timestamp: string;                             // 创建或更新时间戳
  type: 'web' | 'news' | 'image' | 'video';     // 内容类型：网页、新闻、图片、视频
  relevance: number;                             // 相关性评分（0-1之间）
}

/**
 * 搜索查询接口
 * 定义用户搜索请求的完整数据结构
 */
export interface SearchQuery {
  id: string;                    // 查询的唯一标识符
  query: string;                 // 用户输入的搜索关键词
  timestamp: string;             // 搜索执行的时间戳
  results: SearchResult[];       // 搜索结果数组
  isLoading: boolean;            // 是否正在加载搜索结果
  error?: string;                // 错误信息（可选）
}

/**
 * 搜索上下文类型
 * 定义SearchContext提供的状态和方法
 */
export interface SearchContextType {
  queries: SearchQuery[];        // 搜索历史记录数组
  currentQuery: SearchQuery | null; // 当前正在执行的搜索查询
  addQuery: (query: string) => void; // 添加新搜索查询的方法
  updateQuery: (id: string, updates: Partial<SearchQuery>) => void; // 更新查询的方法
  clearQueries: () => void;      // 清空所有查询的方法
  isLoading: boolean;            // 全局加载状态
}

/**
 * 搜索栏组件属性接口
 * 定义SearchBar组件接收的属性
 */
export interface SearchBarProps {
  onSearch: (query: string) => void; // 搜索提交回调函数
  isLoading?: boolean;                // 是否显示加载状态（可选）
  placeholder?: string;               // 输入框占位符文本（可选）
  className?: string;                 // 自定义CSS类名（可选）
}

/**
 * 搜索结果卡片组件属性接口
 * 定义SearchResultCard组件接收的属性
 */
export interface SearchResultCardProps {
  result: SearchResult;                                    // 要显示的搜索结果
  onResultClick?: (result: SearchResult) => void;         // 点击回调函数（可选）
  index: number;                                          // 在列表中的索引位置
}

/**
 * 搜索历史组件属性接口
 * 定义SearchHistory组件接收的属性
 */
export interface SearchHistoryProps {
  queries: SearchQuery[];                    // 搜索历史记录数组
  onQuerySelect: (query: SearchQuery) => void; // 选择历史记录的回调
  onQueryDelete: (id: string) => void;      // 删除历史记录的回调
  onClearAll: () => void;                   // 清空所有历史的回调
  isVisible: boolean;                       // 控制组件显示/隐藏
}

/**
 * 筛选选项接口
 * 定义搜索结果筛选和排序的选项
 */
export interface FilterOptions {
  type: 'all' | 'web' | 'news' | 'image' | 'video';     // 内容类型筛选
  timeRange: 'all' | 'day' | 'week' | 'month' | 'year'; // 时间范围筛选
  sortBy: 'relevance' | 'date' | 'title';               // 排序方式
}

/**
 * API错误接口
 * 定义API调用过程中可能出现的错误信息
 */
export interface ApiError {
  message: string;        // 错误消息
  code?: number;          // 错误代码（可选）
  details?: string;       // 详细错误信息（可选）
}

/**
 * 搜索API响应接口
 * 定义搜索API的统一响应格式
 */
export interface SearchApiResponse {
  results: SearchResult[];    // 搜索结果数组
  totalResults?: number;      // 总结果数量（可选）
  searchTime?: number;        // 搜索耗时（可选）
  error?: ApiError;           // 错误信息（可选）
}