/**
 * 百度图像识别API服务
 * 
 * 功能特性：
 * - 通用物体识别
 * - 动物识别
 * - 植物识别
 * - 菜品识别
 * - 车辆识别
 * - 地标识别
 * - 图像标签识别
 * 
 * 技术实现：
 * - 使用百度AI开放平台API
 * - 支持多种图像识别类型
 * - 统一的错误处理
 * - 类型安全的API调用
 */

import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

/**
 * 百度AI配置接口
 */
interface BaiduAIConfig {
  accessToken: string;
  baseUrl: string;
}

/**
 * 图像识别结果项接口
 */
export interface ImageRecognitionItem {
  keyword?: string;       // 识别出的关键词（通用识别）
  name?: string;          // 识别出的名称（车辆识别等）
  score: number;          // 置信度分数
  root?: string;          // 根分类
  year?: string;          // 年份（车辆识别）
  baike_info?: {          // 百科信息（可选）
    baike_url: string;
    image_url: string;
    description: string;
  };
}

/**
 * 图像识别响应接口
 */
export interface ImageRecognitionResponse {
  log_id: number;         // 日志ID
  result_num: number;     // 结果数量
  result: ImageRecognitionItem[];
  error_code?: number;    // 错误代码
  error_msg?: string;     // 错误信息
}

/**
 * 图像识别类型枚举
 */
export const ImageRecognitionType = {
  GENERAL: 'general',        // 通用物体识别
  ANIMAL: 'animal',          // 动物识别
  PLANT: 'plant',            // 植物识别
  DISH: 'dish',              // 菜品识别
  CAR: 'car',                // 车辆识别
  LANDMARK: 'landmark',      // 地标识别
  INGREDIENT: 'ingredient',  // 果蔬识别
  FLOWER: 'flower',          // 花卉识别
  LOGO: 'logo',              // LOGO识别
  PRODUCT: 'product'         // 商品识别
} as const;

export type ImageRecognitionTypeType = typeof ImageRecognitionType[keyof typeof ImageRecognitionType];

/**
 * 获取百度AI配置
 */
const getBaiduAIConfig = (): BaiduAIConfig => {
  // 使用Vite代理，不需要Access Token，因为代理会自动添加
  return {
    accessToken: '', // 代理会自动添加
    baseUrl: '/api/baidu' // 使用Vite代理路径
  };
};

/**
 * 创建百度AI客户端
 */
const baiduAIClient = axios.create({
  timeout: 15000, // 15秒超时
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  },
});

/**
 * 请求拦截器
 */
baiduAIClient.interceptors.request.use(
  (config) => {
    console.log('发送百度AI请求:', config.url);
    return config;
  },
  (error) => {
    console.error('百度AI请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
baiduAIClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('百度AI响应成功:', response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('百度AI响应错误:', error.response?.status, error.message);

    if (error.response) {
      const errorData = error.response.data as any;
      const errorMessage = errorData?.error_msg || `百度AI请求失败: ${error.response.status}`;
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      return Promise.reject(new Error('网络连接失败，请检查网络设置'));
    } else {
      return Promise.reject(new Error('百度AI配置错误'));
    }
  }
);

/**
 * 将图像文件转换为Base64编码
 */
const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除data:image/xxx;base64,前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('图像文件读取失败'));
    reader.readAsDataURL(file);
  });
};

/**
 * 通用物体识别
 */
export const recognizeGeneral = async (imageFile: File): Promise<ImageRecognitionItem[]> => {
  try {
    const base64 = await imageToBase64(imageFile);
    const config = getBaiduAIConfig();

    // 构建请求数据
    const formData = new URLSearchParams();
    formData.append('image', base64);

    const response = await baiduAIClient.post<ImageRecognitionResponse>(
      `${config.baseUrl}/general_basic`,
      formData.toString()
    );

    const data = response.data;

    if (data.error_code) {
      throw new Error(`百度AI错误: ${data.error_msg}`);
    }

    console.log(`通用物体识别完成，识别出${data.result_num}个物体`);
    return data.result;

  } catch (error) {
    console.error('通用物体识别失败:', error);
    throw error;
  }
};

/**
 * 动物识别
 */
export const recognizeAnimal = async (imageFile: File): Promise<ImageRecognitionItem[]> => {
  try {
    const base64 = await imageToBase64(imageFile);
    const config = getBaiduAIConfig();

    // 构建请求数据
    const formData = new URLSearchParams();
    formData.append('image', base64);

    const response = await baiduAIClient.post<ImageRecognitionResponse>(
      `${config.baseUrl}/animal_detect`,
      formData.toString()
    );

    const data = response.data;

    if (data.error_code) {
      throw new Error(`百度AI错误: ${data.error_msg}`);
    }

    console.log(`动物识别完成，识别出${data.result_num}个动物`);
    return data.result;

  } catch (error) {
    console.error('动物识别失败:', error);
    throw error;
  }
};

/**
 * 植物识别
 */
export const recognizePlant = async (imageFile: File): Promise<ImageRecognitionItem[]> => {
  try {
    const base64 = await imageToBase64(imageFile);
    const config = getBaiduAIConfig();

    // 构建请求数据
    const formData = new URLSearchParams();
    formData.append('image', base64);

    const response = await baiduAIClient.post<ImageRecognitionResponse>(
      `${config.baseUrl}/plant`,
      formData.toString()
    );

    const data = response.data;

    if (data.error_code) {
      throw new Error(`百度AI错误: ${data.error_msg}`);
    }

    console.log(`植物识别完成，识别出${data.result_num}个植物`);
    return data.result;

  } catch (error) {
    console.error('植物识别失败:', error);
    throw error;
  }
};

/**
 * 菜品识别
 */
export const recognizeDish = async (imageFile: File): Promise<ImageRecognitionItem[]> => {
  try {
    const base64 = await imageToBase64(imageFile);
    const config = getBaiduAIConfig();

    // 构建请求数据
    const formData = new URLSearchParams();
    formData.append('image', base64);

    const response = await baiduAIClient.post<ImageRecognitionResponse>(
      `${config.baseUrl}/dish_detect`,
      formData.toString()
    );

    const data = response.data;

    if (data.error_code) {
      throw new Error(`百度AI错误: ${data.error_msg}`);
    }

    console.log(`菜品识别完成，识别出${data.result_num}个菜品`);
    return data.result;

  } catch (error) {
    console.error('菜品识别失败:', error);
    throw error;
  }
};

/**
 * 车辆识别
 */
export const recognizeCar = async (imageFile: File): Promise<ImageRecognitionItem[]> => {
  try {
    const base64 = await imageToBase64(imageFile);
    const config = getBaiduAIConfig();

    // 构建请求数据
    const formData = new URLSearchParams();
    formData.append('image', base64);

    const response = await baiduAIClient.post<ImageRecognitionResponse>(
      `${config.baseUrl}/car`,
      formData.toString()
    );

    const data = response.data;

    if (data.error_code) {
      throw new Error(`百度AI错误: ${data.error_msg}`);
    }

    console.log(`车辆识别完成，识别出${data.result_num}个车辆`);
    return data.result;

  } catch (error) {
    console.error('车辆识别失败:', error);
    throw error;
  }
};

/**
 * 地标识别
 */
export const recognizeLandmark = async (imageFile: File): Promise<ImageRecognitionItem[]> => {
  try {
    const base64 = await imageToBase64(imageFile);
    const config = getBaiduAIConfig();

    // 构建请求数据
    const formData = new URLSearchParams();
    formData.append('image', base64);

    const response = await baiduAIClient.post<ImageRecognitionResponse>(
      `${config.baseUrl}/landmark`,
      formData.toString()
    );

    const data = response.data;

    if (data.error_code) {
      throw new Error(`百度AI错误: ${data.error_msg}`);
    }

    console.log(`地标识别完成，识别出${data.result_num}个地标`);
    return data.result;

  } catch (error) {
    console.error('地标识别失败:', error);
    throw error;
  }
};

/**
 * 图像识别统一接口
 */
export const imageRecognitionAPI = {
  /**
   * 根据类型进行图像识别
   */
  recognize: async (imageFile: File, type: ImageRecognitionTypeType = ImageRecognitionType.GENERAL): Promise<ImageRecognitionItem[]> => {
    switch (type) {
      case ImageRecognitionType.GENERAL:
        return recognizeGeneral(imageFile);
      case ImageRecognitionType.ANIMAL:
        return recognizeAnimal(imageFile);
      case ImageRecognitionType.PLANT:
        return recognizePlant(imageFile);
      case ImageRecognitionType.DISH:
        return recognizeDish(imageFile);
      case ImageRecognitionType.CAR:
        return recognizeCar(imageFile);
      case ImageRecognitionType.LANDMARK:
        return recognizeLandmark(imageFile);
      default:
        return recognizeGeneral(imageFile);
    }
  },

  /**
   * 检查API配置是否有效
   */
  checkConfig: async (): Promise<boolean> => {
    try {
      getBaiduAIConfig();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 获取支持的类型列表
   */
  getSupportedTypes: (): Array<{ value: ImageRecognitionTypeType; label: string; icon: string }> => {
    return [
      { value: ImageRecognitionType.GENERAL, label: '通用物体', icon: '🔍' },
      { value: ImageRecognitionType.ANIMAL, label: '动物识别', icon: '🐾' },
      { value: ImageRecognitionType.PLANT, label: '植物识别', icon: '🌿' },
      { value: ImageRecognitionType.DISH, label: '菜品识别', icon: '🍽️' },
      { value: ImageRecognitionType.CAR, label: '车辆识别', icon: '🚗' },
      { value: ImageRecognitionType.LANDMARK, label: '地标识别', icon: '🏛️' },
    ];
  }
};
