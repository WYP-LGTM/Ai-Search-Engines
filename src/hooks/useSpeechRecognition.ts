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
export const SpeechRecognitionStatus = {
  IDLE: 'idle',
  LISTENING: 'listening',
  RECOGNIZING: 'recognizing',
  ERROR: 'error',
  NOT_SUPPORTED: 'not_supported'
} as const;

export type SpeechRecognitionStatusType = typeof SpeechRecognitionStatus[keyof typeof SpeechRecognitionStatus];

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
  status: SpeechRecognitionStatusType;
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

// 声明全局SpeechRecognition类型
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
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
  const [status, setStatus] = useState<SpeechRecognitionStatusType>(SpeechRecognitionStatus.IDLE);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<SpeechRecognitionError | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // 引用
  const recognitionRef = useRef<any>(null);
  const autoStopTimerRef = useRef<number | null>(null);

  /**
   * 检查浏览器是否支持语音识别
   */
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }, []);

  /**
   * 创建语音识别实例
   */
  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('浏览器不支持语音识别');
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = maxAlternatives;

    return recognition;
  }, [continuous, interimResults, language, maxAlternatives]);

  /**
   * 获取错误信息
   */
  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'no-speech': '没有检测到语音',
      'audio-capture': '音频捕获失败',
      'not-allowed': '麦克风权限被拒绝',
      'network': '网络错误',
      'service-not-allowed': '服务不可用',
      'bad-grammar': '语法错误',
      'language-not-supported': '不支持的语言',
      'aborted': '识别被中断',
      'audio-capture': '音频捕获失败',
      'network': '网络错误',
      'service-not-allowed': '服务不可用',
    };
    return errorMessages[error] || `未知错误: ${error}`;
  };

  /**
   * 开始语音识别
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError({ error: 'not_supported', message: '浏览器不支持语音识别' });
      return;
    }

    try {
      const recognition = createRecognition();
      recognitionRef.current = recognition;

      // 设置事件处理器
      recognition.onstart = () => {
        setStatus(SpeechRecognitionStatus.LISTENING);
        setError(null);
        console.log('开始语音识别');
      };

      recognition.onresult = (event: any) => {
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

        // 如果有最终结果，更新状态
        if (finalTranscript) {
          setStatus(SpeechRecognitionStatus.RECOGNIZING);
        }

        // 自动停止逻辑
        if (autoStop && finalTranscript) {
          if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current);
          }
          autoStopTimerRef.current = window.setTimeout(() => {
            stopListening();
          }, autoStopDelay);
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = getErrorMessage(event.error);
        setError({ error: event.error, message: errorMessage });
        setStatus(SpeechRecognitionStatus.ERROR);
        console.error('语音识别错误:', event.error, errorMessage);
      };

      recognition.onend = () => {
        setStatus(SpeechRecognitionStatus.IDLE);
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
          autoStopTimerRef.current = null;
        }
        console.log('语音识别结束');
      };

      // 开始识别
      recognition.start();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '语音识别初始化失败';
      setError({ error: 'initialization_error', message: errorMessage });
      setStatus(SpeechRecognitionStatus.ERROR);
    }
  }, [isSupported, createRecognition, autoStop, autoStopDelay]);

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
    setStatus(SpeechRecognitionStatus.IDLE);
  }, []);

  /**
   * 重置语音识别状态
   */
  const reset = useCallback(() => {
    stopListening();
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
    setStatus(SpeechRecognitionStatus.IDLE);
  }, [stopListening]);

  /**
   * 清除转录文本
   */
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  // 初始化时检查支持情况
  useEffect(() => {
    const supported = checkSupport();
    setIsSupported(supported);
    if (!supported) {
      setStatus(SpeechRecognitionStatus.NOT_SUPPORTED);
    }
  }, [checkSupport]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
    };
  }, []);

  return {
    status,
    isListening: status === SpeechRecognitionStatus.LISTENING || status === SpeechRecognitionStatus.RECOGNIZING,
    isSupported,
    transcript,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    reset,
    clearTranscript
  };
}
