/**
 * 搜索上下文 - 全局状态管理
 * 
 * 功能特性：
 * - 管理搜索查询历史记录
 * - 管理当前搜索状态和结果
 * - 提供搜索相关的操作方法
 * - 处理异步搜索操作和错误状态
 * 
 * 技术实现：
 * - 使用React Context API进行状态管理
 * - 使用useReducer管理复杂状态逻辑
 * - 支持异步操作和错误处理
 * - 提供类型安全的API接口
 */
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { SearchQuery, SearchContextType } from '../types';
import { generateId } from '../utils';
import { searchAPI } from '../services/api';

/**
 * 搜索状态接口定义
 */
interface SearchState {
  queries: SearchQuery[];        // 搜索查询历史记录数组
  currentQuery: SearchQuery | null; // 当前正在执行的搜索查询
  isLoading: boolean;            // 全局加载状态
}

/**
 * 搜索操作类型定义
 * 使用联合类型定义所有可能的操作
 */
type SearchAction =
  | { type: 'ADD_QUERY'; payload: { query: string; id: string } }            // 添加新搜索查询
  | { type: 'UPDATE_QUERY'; payload: { id: string; updates: Partial<SearchQuery> } } // 更新搜索查询
  | { type: 'SET_CURRENT_QUERY'; payload: SearchQuery | null }               // 设置当前查询
  | { type: 'CLEAR_QUERIES' }                                                 // 清空所有查询
  | { type: 'SET_LOADING'; payload: boolean };                               // 设置加载状态

/**
 * 初始状态定义
 */
const initialState: SearchState = {
  queries: [],
  currentQuery: null,
  isLoading: false,
};

/**
 * 搜索状态Reducer函数
 * 处理所有搜索相关的状态更新逻辑
 * 
 * @param state 当前状态
 * @param action 要执行的操作
 * @returns 新的状态
 */
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'ADD_QUERY': {
      // 创建新的搜索查询对象
      const newQuery: SearchQuery = {
        id: action.payload.id,                // 使用传入的ID
        query: action.payload.query,          // 搜索关键词
        timestamp: new Date().toISOString(), // 当前时间戳
        results: [],                         // 初始化为空结果数组
        isLoading: true,                     // 设置为加载状态
      };
      
      return {
        ...state,
        queries: [newQuery, ...state.queries], // 将新查询添加到历史记录开头
        currentQuery: newQuery,                 // 设置为当前查询
        isLoading: true,                        // 设置全局加载状态
      };
    }

    case 'UPDATE_QUERY':
      // 更新指定ID的查询记录
      return {
        ...state,
        // 更新历史记录中的查询
        queries: state.queries.map(q =>
          q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
        ),
        // 如果当前查询是要更新的查询，同时更新当前查询
        currentQuery: state.currentQuery?.id === action.payload.id
          ? { ...state.currentQuery, ...action.payload.updates }
          : state.currentQuery,
      };

    case 'SET_CURRENT_QUERY':
      // 设置当前查询
      return {
        ...state,
        currentQuery: action.payload,
      };

    case 'CLEAR_QUERIES':
      // 清空所有查询历史
      return {
        ...state,
        queries: [],
        currentQuery: null,
      };

    case 'SET_LOADING':
      // 设置全局加载状态
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

/**
 * 创建搜索上下文
 */
const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * 搜索提供者组件
 * 包装应用并提供搜索相关的状态和方法
 * 
 * @param children 子组件
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  // 使用useReducer管理状态
  const [state, dispatch] = useReducer(searchReducer, initialState);

  /**
   * 添加新的搜索查询
   * 异步执行搜索操作并更新结果
   * 
   * @param query 搜索关键词
   */
  const addQuery = async (query: string) => {
    // 生成查询ID
    const queryId = generateId();
    
    // 首先添加查询到状态中
    dispatch({ type: 'ADD_QUERY', payload: { query, id: queryId } });
    
    try {
      // 使用真实API进行搜索
      const results = await searchAPI.search(query);
      
      // 更新查询结果
      dispatch({
        type: 'UPDATE_QUERY',
        payload: {
          id: queryId,
          updates: { results, isLoading: false },
        },
      });
    } catch (error) {
      // 处理搜索失败的情况
      const errorMessage = error instanceof Error ? error.message : '搜索失败，请重试';
      dispatch({
        type: 'UPDATE_QUERY',
        payload: {
          id: queryId,
          updates: { error: errorMessage, isLoading: false },
        },
      });
    } finally {
      // 无论成功失败都要清除全局加载状态
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * 更新指定查询的信息
   * 
   * @param id 查询ID
   * @param updates 要更新的字段
   */
  const updateQuery = (id: string, updates: Partial<SearchQuery>) => {
    dispatch({ type: 'UPDATE_QUERY', payload: { id, updates } });
  };

  /**
   * 清空所有搜索历史
   */
  const clearQueries = () => {
    dispatch({ type: 'CLEAR_QUERIES' });
  };

  // 构建上下文值对象
  const value: SearchContextType = {
    queries: state.queries,
    currentQuery: state.currentQuery,
    addQuery,
    updateQuery,
    clearQueries,
    isLoading: state.isLoading,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

/**
 * 搜索上下文Hook
 * 提供类型安全的上下文访问
 * 
 * @returns 搜索上下文值
 * @throws 如果在Provider外部使用会抛出错误
 */
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
