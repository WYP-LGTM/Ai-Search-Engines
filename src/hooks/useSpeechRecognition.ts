/**
 * 语音识别Hook - 使用Web Speech API实现语音转文字功能
 * 
 * 功能特性：
 * - 实时语音识别
 * - 支持中文和英文
 * - 自动停止识别
 * - 错误处理和状态管理
 * - 浏览器兼容性检查
 * 
 * 技术实现：
 * - 使用Web Speech API的SpeechRecognition接口
 * - 支持连续识别和单次识别
 * - 提供完整的生命周期管理
 * - 类型安全的API设计
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 语音识别状态枚举
 */
export enum SpeechRecognitionStatus {
  IDLE = 'idle',           // 空闲状态
  LISTENING = 'listening', // 正在监听
  RECOGNIZING = 'recognizing', // 正在识别
  ERROR = 'error',         // 错误状态
  NOT_SUPPORTED = 'not_supported' // 不支持
}

/**
 * 语音识别错误类型
 */
export interface SpeechRecognitionError {
  error: string;
  message: string;
}

/**
 * 语音识别Hook返回值接口
 */
export interface UseSpeechRecognitionReturn {
  // 状态
  status: SpeechRecognitionStatus;
  isListening: boolean;
  isSupported: boolean;
  
  // 数据
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  error: SpeechRecognitionError | null;
  
  // 方法
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  clearTranscript: () => void;
}

/**
 * 语音识别配置选项
 */
export interface SpeechRecognitionOptions {
  language?: string;        // 识别语言，默认中文
  continuous?: boolean;     // 是否连续识别
  interimResults?: boolean; // 是否返回中间结果
  maxAlternatives?: number; // 最大候选结果数
  autoStop?: boolean;       // 是否自动停止
  autoStopDelay?: number;   // 自动停止延迟（毫秒）
}

/**
 * 语音识别Hook
 * @param options 配置选项
 * @returns 语音识别状态和方法
 */
export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    language = 'zh-CN',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    autoStop = true,
    autoStopDelay = 3000
  } = options;

  // 状态管理
  const [status, setStatus] = useState<SpeechRecognitionStatus>(SpeechRecognitionStatus.IDLE);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<SpeechRecognitionError | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // 引用
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 检查浏览器是否支持语音识别
   */
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;
    setIsSupported(isSupported);
    
    if (!isSupported) {
      setStatus(SpeechRecognitionStatus.NOT_SUPPORTED);
    }
    
    return isSupported;
  }, []);

  /**
   * 初始化语音识别实例
   */
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // 配置识别参数
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    // 事件处理
    recognition.onstart = () => {
      setStatus(SpeechRecognitionStatus.LISTENING);
      setError(null);
      console.log('语音识别开始');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimTranscript(interimTranscript);
      setFinalTranscript(finalTranscript);
      setTranscript(finalTranscript + interimTranscript);

      // 如果有最终结果，设置识别状态
      if (finalTranscript) {
        setStatus(SpeechRecognitionStatus.RECOGNIZING);
      }

      // 自动停止逻辑
      if (autoStop && finalTranscript) {
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
        }
        autoStopTimerRef.current = setTimeout(() => {
          stopListening();
        }, autoStopDelay);
      }
    };

    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      setStatus(SpeechRecognitionStatus.ERROR);
      setError({
        error: event.error,
        message: getErrorMessage(event.error)
      });
    };

    recognition.onend = () => {
      setStatus(SpeechRecognitionStatus.IDLE);
      console.log('语音识别结束');
    };

    return recognition;
  }, [isSupported, language, continuous, interimResults, maxAlternatives, autoStop, autoStopDelay]);

  /**
   * 获取错误信息
   */
  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'no-speech': '没有检测到语音，请说话',
      'audio-capture': '无法捕获音频，请检查麦克风权限',
      'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问',
      'network': '网络错误，请检查网络连接',
      'service-not-allowed': '语音识别服务不可用',
      'bad-grammar': '语法错误',
      'language-not-supported': '不支持当前语言',
      'aborted': '语音识别被中断',
      'audio-capture': '音频捕获失败',
      'network': '网络错误',
      'service-not-allowed': '服务不可用',
      'speech-timeout': '语音超时，请重新说话'
    };
    
    return errorMessages[error] || `未知错误: ${error}`;
  };

  /**
   * 开始语音识别
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError({
        error: 'not-supported',
        message: '当前浏览器不支持语音识别功能'
      });
      return;
    }

    try {
      // 重置状态
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      setFinalTranscript('');

      // 初始化识别实例
      const recognition = initializeRecognition();
      if (!recognition) return;

      recognitionRef.current = recognition;
      recognition.start();
      
      console.log('开始语音识别');
    } catch (err) {
      console.error('启动语音识别失败:', err);
      setError({
        error: 'start-failed',
        message: '启动语音识别失败，请重试'
      });
    }
  }, [isSupported, initializeRecognition]);

  /**
   * 停止语音识别
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    
    console.log('停止语音识别');
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    stopListening();
    setStatus(SpeechRecognitionStatus.IDLE);
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, [stopListening]);

  /**
   * 清除识别结果
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  // 初始化检查
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
    };
  }, []);

  return {
    // 状态
    status,
    isListening: status === SpeechRecognitionStatus.LISTENING,
    isSupported,
    
    // 数据
    transcript,
    interimTranscript,
    finalTranscript,
    error,
    
    // 方法
    startListening,
    stopListening,
    reset,
    clearTranscript
  };
}

// 扩展Window接口以支持Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
