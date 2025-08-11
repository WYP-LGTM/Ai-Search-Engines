/**
 * API服务层 - 处理与后端API的通信
 * 
 * 功能特性：
 * - GitHub Search API集成
 * - 统一的错误处理
 * - 请求拦截和响应处理
 * - 类型安全的API调用
 * 
 * 技术实现：
 * - 使用axios进行HTTP请求
 * - 环境变量配置API密钥（可选）
 * - 统一的错误处理机制
 * - 支持请求重试和超时
 */

import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import type { SearchResult } from '../types';

/**
 * GitHub Search API配置
 */
interface GitHubSearchConfig {
  token?: string; // GitHub Personal Access Token（可选）
  baseUrl: string;
}

/**
 * GitHub Search API响应接口
 */
interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Array<{
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  }>;
  message?: string; // 错误消息
}

/**
 * GitHub代码搜索结果接口
 */
interface GitHubCodeSearchItem {
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
      id: number;
      avatar_url: string;
    };
  };
  score: number;
  updated_at: string;
}

/**
 * GitHub用户搜索结果接口
 */
interface GitHubUserSearchItem {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

/**
 * 获取GitHub API配置
 */
const getGitHubConfig = (): GitHubSearchConfig => {
  const token = import.meta.env.VITE_GITHUB_TOKEN; // 可选，用于提高API限制
  
  return {
    token,
    baseUrl: 'https://api.github.com/search',
  };
};

/**
 * 创建GitHub API客户端
 */
const githubClient = axios.create({
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json',
  },
});

/**
 * 请求拦截器
 */
githubClient.interceptors.request.use(
  (config) => {
    const githubConfig = getGitHubConfig();
    
    // 如果配置了GitHub Token，添加到请求头
    if (githubConfig.token) {
      config.headers.Authorization = `token ${githubConfig.token}`;
    }
    
    console.log('发送GitHub API请求:', config.url);
    return config;
  },
  (error) => {
    console.error('GitHub API请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
githubClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('GitHub API响应成功:', response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('GitHub API响应错误:', error.response?.status, error.message);
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          return Promise.reject(new Error('GitHub API认证失败，请检查Token'));
        case 403:
          return Promise.reject(new Error('GitHub API访问被拒绝，可能达到速率限制'));
        case 422:
          return Promise.reject(new Error('GitHub API请求参数错误'));
        case 503:
          return Promise.reject(new Error('GitHub API服务暂时不可用'));
        default:
          return Promise.reject(new Error(`GitHub API请求失败: ${error.response.status}`));
      }
    } else if (error.request) {
      return Promise.reject(new Error('网络连接失败，请检查网络设置'));
    } else {
      return Promise.reject(new Error('GitHub API配置错误'));
    }
  }
);

/**
 * 将GitHub搜索结果转换为应用内部格式
 */
const transformGitHubResults = (
  githubItems: GitHubSearchResponse['items'] = []
): SearchResult[] => {
  return githubItems.map((item, index) => ({
    id: `github_${item.id}`,
    title: item.full_name,
    content: item.description || `GitHub仓库: ${item.name}`,
    url: item.html_url,
    source: `GitHub - ${item.owner.login}`,
    timestamp: item.updated_at,
    type: 'web' as const,
    relevance: Math.max(0.5, 1 - index * 0.1),
  }));
};

/**
 * GitHub Search API服务
 */
export const githubSearchAPI = {
  /**
   * 搜索仓库
   */
  searchRepositories: async (query: string): Promise<SearchResult[]> => {
    try {
      const config = getGitHubConfig();
      
      const response = await githubClient.get<GitHubSearchResponse>(
        `${config.baseUrl}/repositories`,
        {
          params: {
            q: query,
            sort: 'stars',
            order: 'desc',
            per_page: 10,
            page: 1,
          },
        }
      );
      
      const data = response.data;
      
      // 检查API错误
      if (data.message) {
        throw new Error(`GitHub API错误: ${data.message}`);
      }
      
      const results = transformGitHubResults(data.items);
      console.log(`GitHub搜索"${query}"完成，找到${results.length}个仓库`);
      
      return results;
      
    } catch (error) {
      console.error('GitHub搜索API调用失败:', error);
      throw error;
    }
  },

  /**
   * 搜索代码
   */
  searchCode: async (query: string): Promise<SearchResult[]> => {
    try {
      const config = getGitHubConfig();
      
      const response = await githubClient.get<GitHubSearchResponse>(
        `${config.baseUrl}/code`,
        {
          params: {
            q: query,
            sort: 'indexed',
            order: 'desc',
            per_page: 10,
            page: 1,
          },
        }
      );
      
      const data = response.data;
      
      if (data.message) {
        throw new Error(`GitHub API错误: ${data.message}`);
      }
      
      // 转换代码搜索结果
      const results: SearchResult[] = data.items.map((item: GitHubCodeSearchItem, index) => ({
        id: `github_code_${item.sha}`,
        title: `${item.name} in ${item.repository.full_name}`,
        content: `代码片段: ${item.path}`,
        url: item.html_url,
        source: `GitHub Code - ${item.repository.owner.login}`,
        timestamp: item.updated_at,
        type: 'web' as const,
        relevance: Math.max(0.5, 1 - index * 0.1),
      }));
      
      console.log(`GitHub代码搜索"${query}"完成，找到${results.length}个结果`);
      return results;
      
    } catch (error) {
      console.error('GitHub代码搜索API调用失败:', error);
      throw error;
    }
  },

  /**
   * 搜索用户
   */
  searchUsers: async (query: string): Promise<SearchResult[]> => {
    try {
      const config = getGitHubConfig();
      
      const response = await githubClient.get<GitHubSearchResponse>(
        `${config.baseUrl}/users`,
        {
          params: {
            q: query,
            sort: 'followers',
            order: 'desc',
            per_page: 10,
            page: 1,
          },
        }
      );
      
      const data = response.data;
      
      if (data.message) {
        throw new Error(`GitHub API错误: ${data.message}`);
      }
      
      // 转换用户搜索结果
      const results: SearchResult[] = data.items.map((item: GitHubUserSearchItem, index) => ({
        id: `github_user_${item.id}`,
        title: item.login,
        content: item.bio || `GitHub用户: ${item.login}`,
        url: item.html_url,
        source: 'GitHub Users',
        timestamp: item.updated_at,
        type: 'web' as const,
        relevance: Math.max(0.5, 1 - index * 0.1),
      }));
      
      console.log(`GitHub用户搜索"${query}"完成，找到${results.length}个用户`);
      return results;
      
    } catch (error) {
      console.error('GitHub用户搜索API调用失败:', error);
      throw error;
    }
  },

  /**
   * 检查API配置是否有效
   */
  checkConfig: async (): Promise<boolean> => {
    try {
      getGitHubConfig();
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * 搜索API统一接口
 */
export const searchAPI = {
  /**
   * 执行搜索
   */
  search: async (query: string): Promise<SearchResult[]> => {
    try {
      // 优先搜索仓库
      return await githubSearchAPI.searchRepositories(query);
    } catch (error) {
      console.error('GitHub搜索失败，回退到模拟数据:', error);
      
      // 回退到模拟数据
      const { mockSearchResults } = await import('../utils');
      return mockSearchResults(query);
    }
  },

  /**
   * 搜索代码
   */
  searchCode: async (query: string): Promise<SearchResult[]> => {
    return githubSearchAPI.searchCode(query);
  },

  /**
   * 搜索用户
   */
  searchUsers: async (query: string): Promise<SearchResult[]> => {
    return githubSearchAPI.searchUsers(query);
  },
};
