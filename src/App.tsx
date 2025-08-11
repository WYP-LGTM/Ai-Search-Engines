
/**
 * 主应用组件 - AI搜索引擎的根组件
 * 
 * 应用架构：
 * - 使用React Context进行全局状态管理
 * - 基于当前搜索状态进行页面路由
 * - 组件化设计，职责分离清晰
 * 
 * 页面路由逻辑：
 * - 当有当前搜索查询时，显示搜索结果页面
 * - 当没有搜索查询时，显示首页
 * - 通过SearchContext的currentQuery状态控制页面切换
 * 
 * 技术实现：
 * - 使用Provider模式包装应用
 * - 条件渲染实现简单路由
 * - 组件分离提高可维护性
 */
import { SearchProvider } from './contexts/SearchContext';
import { HomePage } from './components/HomePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { useSearch } from './contexts/SearchContext';

/**
 * 应用内容组件 - 负责页面路由逻辑
 * 
 * 功能：
 * - 从SearchContext获取当前搜索状态
 * - 根据currentQuery状态决定显示哪个页面
 * - 实现简单的客户端路由功能
 */
function AppContent() {
  // 从SearchContext获取当前搜索查询状态
  const { currentQuery } = useSearch();

  return (
    <div className="App">
      {/* 条件渲染：根据当前搜索状态显示不同页面 */}
      {currentQuery ? <SearchResultsPage /> : <HomePage />}
    </div>
  );
}

/**
 * 主应用组件 - 应用的入口点
 * 
 * 功能：
 * - 使用SearchProvider包装整个应用
 * - 提供全局状态管理
 * - 确保所有子组件都能访问搜索相关的状态和方法
 */
function App() {
  return (
    // 使用SearchProvider包装应用，提供全局状态管理
    <SearchProvider>
      <AppContent />
    </SearchProvider>
  );
}

export default App;
