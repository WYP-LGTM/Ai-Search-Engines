# 百度AI图像识别API配置指南

## 📋 配置步骤

### 1. 注册百度AI开放平台
1. 访问 [百度AI开放平台](https://ai.baidu.com/)
2. 注册并登录账号
3. 完成实名认证

### 2. 创建应用
1. 进入控制台
2. 点击"创建应用"
3. 选择"图像识别"产品
4. 填写应用名称和描述
5. 创建完成后获取API Key和Secret Key

### 3. 获取Access Token
1. 使用API Key和Secret Key调用百度AI的token接口
2. 获取Access Token（有效期30天）
<!-- {
	"refresh_token": "25.0e72b93e8b9431ece6d6468b2e964ac0.315360000.2070277413.282335-119747291",
	"expires_in": 2592000,
	"session_key": "9mzdAvIQQMkqP6VsoCd/PboA3X1BnCExbAsKpJiFZ4DQ0YruINl80AZiT/j7+JwMZq5PCaflbwWLHUQeIkemi4pCxJv2kV0=",
	"access_token": "24.90170d8087e172f77ae2299f47001dd3.2592000.1757509413.282335-119747291",
	"scope": "public vis-classify_dishes vis-classify_car brain_all_scope vis-classify_animal vis-classify_plant brain_object_detect brain_realtime_logo brain_dish_detect brain_car_detect brain_animal_classify brain_plant_classify brain_ingredient brain_poi_recognize brain_advanced_general_classify brain_vehicle_detect brain_multi_ object_detect ai_custom_pro_apple ai_custom_testface1 ai_custom_kouzhaorenlianshibie ai_custom_chongwugou brain_image_understanding brain_image_understanding_get wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test权限 vis-classify_flower lpq_开放 cop_helloScope ApsMis_fangdi_permission smartapp_snsapi_base smartapp_mapp_dev_manage iop_autocar oauth_tp_app smartapp_smart_game_openapi oauth_sessionkey smartapp_swanid_verify smartapp_opensource_openapi smartapp_opensource_recapi fake_face_detect_开放Scope vis-ocr_虚拟人物助理 idl-video_虚拟人物助理 smartapp_component smartapp_search_plugin avatar_video_test b2b_tp_openapi b2b_tp_openapi_online smartapp_gov_aladin_to_xcx",
	"session_secret": "fcee7df5e4553f064b90b1423a84497c"
} -->
### 4. 配置环境变量
在项目根目录创建 `.env.local` 文件：

```bash
# 百度AI图像识别API配置
VITE_BAIDU_ACCESS_TOKEN=your_access_token_here
```

## 🔧 获取Access Token的方法

### 方法1: 使用curl命令
```bash
curl -i -k 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=YOUR_API_KEY&client_secret=YOUR_SECRET_KEY'
```

### 方法2: 使用在线工具
1. 访问 [百度AI Token获取工具](https://ai.baidu.com/ai-doc/REFERENCE/Ck3dwjhhu)
2. 输入API Key和Secret Key
3. 获取Access Token

### 方法3: 使用Python脚本
```python
import requests

def get_access_token(api_key, secret_key):
    url = "https://aip.baidubce.com/oauth/2.0/token"
    params = {
        "grant_type": "client_credentials",
        "client_id": api_key,
        "client_secret": secret_key
    }
    
    response = requests.post(url, params=params)
    return response.json()["access_token"]

# 使用示例
api_key = "YOUR_API_KEY"
secret_key = "YOUR_SECRET_KEY"
access_token = get_access_token(api_key, secret_key)
print(f"Access Token: {access_token}")
```

## 🎯 支持的图像识别类型

- **通用物体识别**: 识别图像中的常见物体
- **动物识别**: 识别各种动物种类
- **植物识别**: 识别植物和花卉
- **菜品识别**: 识别各种美食菜品
- **车辆识别**: 识别汽车品牌和型号
- **地标识别**: 识别著名建筑和地标

## 📁 支持的文件格式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)

## 📏 文件大小限制

- 最大文件大小: 10MB
- 建议分辨率: 不低于256x256像素

## 🚀 使用方法

1. 配置好Access Token后重启开发服务器
2. 点击搜索栏中的相机图标
3. 上传图像文件
4. 选择识别类型
5. 点击"开始识别"
6. 查看识别结果并搜索相关信息

## ⚠️ 注意事项

1. Access Token有效期为30天，需要定期更新
2. 每个应用有API调用次数限制
3. 图像文件大小不能超过10MB
4. 建议使用清晰的图像以获得更好的识别效果

## 🔗 相关链接

- [百度AI开放平台](https://ai.baidu.com/)
- [图像识别API文档](https://ai.baidu.com/ai-doc/IMAGERECOGNITION/)
- [Token获取文档](https://ai.baidu.com/ai-doc/REFERENCE/Ck3dwjhhu)
