import axios from 'axios';
import { Sequelize, Op } from 'sequelize';
import GardenDesign from '../models/GardenDesign';
import { downloadAndUploadToCloudinary } from './imageService';

// API配置
const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY = 1000; // 重试延迟（毫秒）
const TIMEOUT = 10000; // 请求超时（毫秒）
const MAX_RUNNING_TIME = 60 * 60 * 1000; // 任务最长运行时间（1小时）

// 新API配置
const BRIDGE_API_BASE_URL = 'https://bridge.liblib.art/gateway/sd-api/generate/progress/msg/v3';
const BRIDGE_TOKEN = '77436bc86ee54798a36ebfc48f59a0f578462281277';
const BRIDGE_WEBID = '1747364397292soukxtpq';

/**
 * 带重试机制的发送请求
 * @param url 请求URL
 * @param headers 请求头
 * @param data 请求数据
 * @param method 请求方法
 * @param retries 剩余重试次数
 * @returns 响应数据或null
 */
async function sendRequestWithRetry(
  url: string, 
  headers: any, 
  data: any = null, 
  method: 'GET' | 'POST' = 'GET', 
  retries = MAX_RETRIES
): Promise<any> {
  try {
    const options = {
      method,
      url,
      headers,
      timeout: TIMEOUT,
      data: method === 'POST' ? data : undefined
    };
    
    const response = await axios(options);
    return response.data;
  } catch (error: any) {
    // 如果是请求超时或网络错误，且还有重试机会，则进行重试
    if ((axios.isAxiosError(error) && 
        (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || !error.response)) && 
        retries > 0) {
      console.log(`请求失败，将在 ${RETRY_DELAY}ms 后重试，剩余重试次数: ${retries-1}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendRequestWithRetry(url, headers, data, method, retries - 1);
    }
    
    // 如果是服务器错误（5xx），也进行重试
    if (axios.isAxiosError(error) && error.response && error.response.status >= 500 && retries > 0) {
      console.log(`服务器错误 ${error.response.status}，将在 ${RETRY_DELAY}ms 后重试，剩余重试次数: ${retries-1}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendRequestWithRetry(url, headers, data, method, retries - 1);
    }
    
    // 打印详细错误信息
    console.error('请求失败:');
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`状态码: ${error.response.status}`);
        console.error('响应数据:', error.response.data);
      } else if (error.request) {
        console.error('请求已发送但未收到响应');
        console.error(error.request);
      } else {
        console.error('请求配置错误:', error.message);
      }
      console.error('请求配置:', error.config);
    } else {
      console.error('未知错误:', error);
    }
    
    return null;
  }
}

/**
 * 从新接口获取任务结果
 * @param generateId 生成ID
 * @returns 任务结果或null
 */
async function getTaskResultFromBridge(generateId: number) {
  try {
    // 获取当前时间戳，精确到毫秒
    const timestamp = Date.now();
    const url = `${BRIDGE_API_BASE_URL}/${generateId}?timestamp=${timestamp}`;
    
    const headers = {
      'token': BRIDGE_TOKEN,
      'webid': BRIDGE_WEBID,
      'Content-Type': 'application/json'
    };
    
    const data = { flag: 0 };
    
    console.log(`正在请求任务状态: ${generateId}`);
    const result = await sendRequestWithRetry(url, headers, data, 'POST');
    
    if (!result) {
      console.error(`获取任务结果失败: ${generateId}`);
      return null;
    }
    
    // 检查返回码
    if (result.code !== 0) {
      console.error(`任务状态请求返回错误码: ${result.code}, 消息: ${result.msg || '无错误信息'}`);
      return null;
    }
    
    // 检查任务状态
    const taskData = result.data;
    console.log(`任务状态: generateId=${generateId}, subStatus=${taskData.subStatus}, 进度=${taskData.percentCompleted}%, subTypeName=${taskData.subTypeName || '未知'}`);
    
    // 如果有错误信息
    if (taskData.errorMsg) {
      console.error(`任务失败: ${generateId}, 错误信息: ${taskData.errorMsg}`);
      return 'FAILED';
    }
    
    // 检查任务是否异常
    if (taskData.subStatus === 3) {
      console.error(`任务异常: ${generateId}, 状态码: ${taskData.subStatus}`);
      return 'FAILED';
    }
    
    // 首先检查子状态和完成百分比
    if (taskData.subStatus === 2 && taskData.percentCompleted === 100) {
      console.log(`任务已完成 (generateId=${generateId}, subStatus=2, percentCompleted=100)，检查图片URL`);
      
      // 检查是否有图片信息
      if (!taskData.images || taskData.images.length === 0) {
        console.log(`任务已完成但没有images数组, generateId=${generateId}`);
        return 'FAILED';
      }
      
      // 检查是否有图片URL (previewPath)
      if (taskData.images[0].previewPath) {
        const imgUrl = taskData.images[0].previewPath;
        console.log(`获取到图片URL: ${imgUrl}, generateId=${generateId}`);
        
        // 返回一个对象，包含图片URL和完整的任务数据，以便保存更多信息
        return {
          imageUrl: imgUrl,
          taskData: taskData
        };
      } else {
        console.log(`任务已完成但未找到图片URL (previewPath为空), generateId=${generateId}`);
        return 'FAILED'; // 任务完成但没有图片URL，可能是失败
      }
    } else {
      // 任务尚未完成
      console.log(`任务 ${generateId} 尚未完成 (subStatus=${taskData.subStatus}, percentCompleted=${taskData.percentCompleted}%)`);
      return null;
    }
  } catch (error) {
    console.error(`获取任务结果时发生异常: ${error}`);
    return null;
  }
}

/**
 * 检查任务是否已经运行太长时间
 * @param design GardenDesign记录
 * @returns 是否运行太长时间
 */
function isTaskRunningTooLong(design: any): boolean {
  if (!design.ctime) return false;
  
  const creationTime = design.ctime * 1000; // 转换为毫秒
  const currentTime = Date.now();
  const runningTime = currentTime - creationTime;
  
  if (runningTime > MAX_RUNNING_TIME) {
    console.log(`任务 ${design.id} 运行时间过长: ${Math.round(runningTime / 60000)} 分钟`);
    return true;
  }
  
  return false;
}

/**
 * 检查并更新未完成的garden_design记录
 */
async function checkPendingTasks() {
  try {
    console.log('开始检查未完成的garden_design任务...');
    console.log('当前时间：', new Date().toISOString());
    console.log('imageService是否已导入：', typeof downloadAndUploadToCloudinary === 'function' ? '是' : '否');
    
    // 查找状态为"生成中"，未删除，且有第三方生成ID的记录
    const pendingDesigns = await GardenDesign.findAll({
      where: {
        status: 1, // 1代表生成中
        is_del: 0, // 未删除
        third_generate_id: {
          [Op.not]: null // third_generate_id不为空
        }
      },
      order: [
        ['ctime', 'ASC'] // 按创建时间升序排序，先处理早的任务
      ],
      limit: 10 // 每次只处理10条记录，避免处理太多
    });
    
    console.log(`找到 ${pendingDesigns.length} 个待处理任务`);
    
    // 遍历每个任务并检查状态
    for (const design of pendingDesigns) {
      const generateId = design.third_generate_id;
      
      if (!generateId) {
        console.log(`生成ID为空，跳过: ${design.id}`);
        continue;
      }
      
      console.log(`处理生成ID: ${generateId}, 设计ID: ${design.id}`);
      
      // 检查任务是否运行时间过长
      if (isTaskRunningTooLong(design)) {
        console.log(`任务 ${design.id} 运行时间过长，标记为失败`);
        await design.update({
          status: 3, // 3代表生成失败
          utime: Math.floor(Date.now() / 1000)
        });
        continue;
      }
      
      // 获取任务结果
      const result = await getTaskResultFromBridge(generateId);
      
      // 处理不同的结果
      if (result === 'FAILED') {
        // 任务失败
        console.log(`设计ID ${design.id} 的任务已失败，更新状态`);
        await design.update({
          status: 3, // 3代表生成失败
          utime: Math.floor(Date.now() / 1000)
        });
      } else if (result && typeof result === 'object' && result.imageUrl) {
        // 任务成功，获取到了图片URL
        const originalImageUrl = result.imageUrl;
        console.log(`获取到设计ID ${design.id} 的原始图片URL: ${originalImageUrl}`);
        console.log(`原始图片URL类型: ${typeof originalImageUrl}, 长度: ${originalImageUrl.length}`);
        
        try {
          // 下载图片并上传到Cloudinary
          console.log(`开始下载和上传图片到Cloudinary...`);
          const userId = design.user_id || 0;
          console.log(`用户ID: ${userId}`);
          
          console.time(`设计ID ${design.id} 的图片处理时间`);
          const cloudinaryUrl = await downloadAndUploadToCloudinary(originalImageUrl, userId);
          console.timeEnd(`设计ID ${design.id} 的图片处理时间`);
          
          console.log(`图片处理完成，Cloudinary URL: ${cloudinaryUrl}`);
          
          if (!cloudinaryUrl || cloudinaryUrl === originalImageUrl) {
            console.error(`Cloudinary处理失败，使用原始URL: ${originalImageUrl}`);
            // 使用原始URL更新记录
            await design.update({
              status: 2,                        // 2代表生成成功
              pic_result: originalImageUrl,     // 保存原始图片URL作为结果
              pic_third_orginial: originalImageUrl, // 保存第三方接口返回的原始图片URL
              utime: Math.floor(Date.now() / 1000)  // 更新10位时间戳
            });
          } else {
            // 更新记录使用Cloudinary URL
            await design.update({
              status: 2,                        // 2代表生成成功
              pic_result: cloudinaryUrl,        // 保存Cloudinary图片URL
              pic_third_orginial: originalImageUrl, // 保存第三方接口返回的原始图片URL
              utime: Math.floor(Date.now() / 1000)  // 更新10位时间戳
            });
          }
        } catch (imageError) {
          console.error(`处理图片时出错: ${imageError}`);
          console.error(`错误详情: ${JSON.stringify(imageError)}`);
          console.error(`错误堆栈: ${imageError instanceof Error ? imageError.stack : '无堆栈信息'}`);
          // 发生错误时，仍使用原始URL更新记录，确保流程不中断
          await design.update({
            status: 2,                        // 2代表生成成功
            pic_result: originalImageUrl,     // 保存原始图片URL
            pic_third_orginial: originalImageUrl, // 保存第三方接口返回的原始图片URL
            utime: Math.floor(Date.now() / 1000)  // 更新10位时间戳
          });
        }
        
        console.log(`设计ID ${design.id} 更新完成`);
      } else {
        // 任务仍在处理中
        console.log(`设计ID ${design.id} 的任务尚未完成，等待下次检查`);
      }
    }
    
    console.log('完成本轮任务检查');
  } catch (error) {
    console.error(`检查任务时出错: ${error}`);
    console.error(`错误详情: ${JSON.stringify(error)}`);
    console.error(`错误堆栈: ${error instanceof Error ? error.stack : '无堆栈信息'}`);
    // 出错时不会中断服务，等待下一次定时调用
  }
}

/**
 * 启动任务检查器服务
 */
export function startTaskChecker() {
  console.log('启动garden_design任务状态检查服务');
  
  // 立即执行一次
  checkPendingTasks().catch(err => {
    console.error('首次执行任务检查时出错:', err);
  });
  
  // 设置每10秒执行一次
  const intervalId = setInterval(() => {
    checkPendingTasks().catch(err => {
      console.error('执行任务检查时出错:', err);
    });
  }, 10000);
  
  // 返回停止函数，以便需要时可以停止服务
  return function stopTaskChecker() {
    clearInterval(intervalId);
    console.log('garden_design任务状态检查服务已停止');
  };
}

// 导出服务启动函数
export default startTaskChecker; 