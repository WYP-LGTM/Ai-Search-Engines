/**
 * 图像识别组件 - 提供图像上传和识别功能
 * 
 * 功能特性：
 * - 图像文件上传
 * - 多种识别类型选择
 * - 实时识别结果显示
 * - 识别结果搜索
 * - 拖拽上传支持
 * 
 * 技术实现：
 * - 使用百度AI图像识别API
 * - 支持多种图像格式
 * - 文件大小和格式验证
 * - 优雅的错误处理
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Search, Eye, Info } from 'lucide-react';
import { imageRecognitionAPI, ImageRecognitionType, type ImageRecognitionItem } from '../services/imageRecognition';
import { cn } from '../utils';

/**
 * 图像识别组件属性接口
 */
interface ImageRecognitionProps {
  onSearch?: (query: string) => void; // 搜索回调函数
  className?: string;                 // 自定义CSS类名
}

export function ImageRecognition({ onSearch, className }: ImageRecognitionProps) {
  // 状态管理
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionType, setRecognitionType] = useState<ImageRecognitionTypeType>(ImageRecognitionType.GENERAL);
  const [recognitionResults, setRecognitionResults] = useState<ImageRecognitionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConfigValid, setIsConfigValid] = useState<boolean | null>(null);

  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  /**
   * 检查API配置
   */
  const checkAPIConfig = useCallback(async () => {
    try {
      const isValid = await imageRecognitionAPI.checkConfig();
      setIsConfigValid(isValid);
      return isValid;
    } catch {
      setIsConfigValid(false);
      return false;
    }
  }, []);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback((file: File) => {
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setError('请选择有效的图像文件 (JPEG, PNG, GIF, BMP)');
      return;
    }

    // 验证文件大小 (最大10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('图像文件大小不能超过10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setRecognitionResults([]);

    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  /**
   * 处理文件输入变化
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * 处理拖拽事件
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  /**
   * 执行图像识别
   */
  const performRecognition = useCallback(async () => {
    if (!selectedFile) return;

    setIsRecognizing(true);
    setError(null);

    try {
      const results = await imageRecognitionAPI.recognize(selectedFile, recognitionType);
      setRecognitionResults(results);
      console.log('图像识别完成:', results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '图像识别失败';
      setError(errorMessage);
      console.error('图像识别错误:', err);
    } finally {
      setIsRecognizing(false);
    }
  }, [selectedFile, recognitionType]);

  /**
   * 清除当前图像
   */
  const clearImage = useCallback(() => {
    // 先清除预览URL，避免内存泄漏
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // 使用setTimeout确保DOM操作完成后再更新状态
    setTimeout(() => {
      setSelectedFile(null);
      setPreviewUrl('');
      setRecognitionResults([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 0);
  }, [previewUrl]);

  /**
   * 搜索识别结果
   */
  const searchResult = useCallback((keyword: string) => {
    if (onSearch) {
      onSearch(keyword);
    }
  }, [onSearch]);

  // 初始化时检查API配置
  useEffect(() => {
    checkAPIConfig();
  }, [checkAPIConfig]);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* 配置检查提示 */}
      <AnimatePresence>
        {isConfigValid === false && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                百度AI配置未设置，请在.env.local中配置VITE_BAIDU_ACCESS_TOKEN
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 图像上传区域 */}
      <div className="mb-6">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : selectedFile
                ? "border-green-400 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          )}
        >
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  上传图像进行识别
                </h3>
                <p className="text-gray-600 mb-4">
                  支持 JPEG, PNG, GIF, BMP 格式，最大 10MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  选择图像文件
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="max-w-full max-h-64 rounded-lg shadow-lg"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                文件名: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          )}

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 识别类型选择 */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">选择识别类型</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {imageRecognitionAPI.getSupportedTypes().map((type) => (
              <button
                key={type.value}
                onClick={() => setRecognitionType(type.value)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                  recognitionType === type.value
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium text-gray-900">{type.label}</div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 识别按钮 */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <button
            onClick={performRecognition}
            disabled={isRecognizing || !isConfigValid}
            className={cn(
              "px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl",
              isRecognizing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            )}
          >
            {isRecognizing ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>识别中...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>开始识别</span>
              </div>
            )}
          </button>
        </motion.div>
      )}

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 识别结果 */}
      <AnimatePresence>
        {recognitionResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              识别结果 ({recognitionResults.length} 项)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recognitionResults.map((result, index) => (
                                 <motion.div
                   key={index}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: index * 0.1 }}
                   className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
                 >
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="font-semibold text-gray-900">
                       {result.name || result.keyword || '未知对象'}
                     </h4>
                     <span className="text-sm text-gray-500">
                       {(result.score * 100).toFixed(1)}%
                     </span>
                   </div>
                   
                   {/* 显示年份信息（车辆识别） */}
                   {result.year && (
                     <div className="mb-2">
                       <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                         年份: {result.year}
                       </span>
                     </div>
                   )}
                   
                   {result.baike_info && (
                     <div className="mb-3">
                       <p className="text-sm text-gray-600 line-clamp-2">
                         {result.baike_info.description}
                       </p>
                     </div>
                   )}
                   
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => searchResult(result.name || result.keyword || '')}
                       className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200"
                     >
                       <Search className="w-4 h-4 mr-1" />
                       搜索
                     </button>
                     {result.baike_info?.baike_url && (
                       <a
                         href={result.baike_info.baike_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200"
                       >
                         百科
                       </a>
                     )}
                   </div>
                 </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
