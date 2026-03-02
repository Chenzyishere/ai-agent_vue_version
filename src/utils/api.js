//api函数执行流程
//开始请求->await暂停代码执行，等待网络响应->服务器处理请求并返回相应
//->response变量获得Response对象->继续执行后续代码


//依赖导入
//1.使用Pinia状态管理获取用户设置
//2.从@/stores/setting 导入设置存储
import { useSettingStore } from "@/stores/setting";
//常量定义：这个是硅基流动的API地址
const API_BASE_URL = 'https://api.siliconflow.cn/v1'
//核心函数createChatCompletion
export const createChatCompletion = async (messages) => {
  const settingStore = useSettingStore()
  //这个是请求载荷构建，准备发送给服务器的数据内容和过程
  //要看具体的后端需要什么，然后整个发送过去
  const payload = {
    model: settingStore.settings.model,//选择哪个AI模型
    messages,//对话历史和当前消息
    stream: settingStore.settings.stream,//是否实时流式传输
    max_tokens: settingStore.settings.maxTokens,//回复最大长度限制
    temperature: settingStore.settings.temperature,//AI创造性程度
    top_p: settingStore.settings.topP,//回复多样性控制
    top_k: settingStore.settings.topK,//候选词数量限制
  }
  //这个是请求的配置，
  const options = {
    method: 'POST',//请求方式
    headers: {//请求头
      Authorization: `Bearer ${settingStore.settings.apiKey}`,//API密钥
      'Content-Type': 'application/json',//请求的类型
    },
    body: JSON.stringify(payload),//将整个payload打包成JSON传送参数
  }

    try {
    const startTime = Date.now() // 记录开始时间 本地计时，避免服务器时间不准确
    //使用Fetch API向AI聊天接口发送HTTP请求
    //fetch()是浏览器内置的HTTP客户端
    //用于发送网络请求并获取相应
    //返回一个Promise，所以可以用await等待结果
    const response = await fetch(`${API_BASE_URL}/chat/completions`, options)

    if (!response.ok) {
      //这个是请求失败，在这里被捕获
      throw new Error(`HTTP error! status: ${response.status}`)
      //返回response的状态
    }
    //此处为返回成功的两种方式
    //如果是流式传输
    //适用于实时显示AI回复，AI一个一个字地实时显示
    //返回原始Response对象，需要调用方处理数据流
    if (settingStore.settings.stream) {
      return response // 直接返回响应对象以支持流式读取
    } else {
      //Stream=false
      //非流式传输
      //等待完整响应后返回JSON数据
      //计算生成速度：基于完成
      const data = await response.json()
      const duration = (Date.now() - startTime) / 1000 // 使用本地计时
      data.speed = (data.usage.completion_tokens / duration).toFixed(2)
      //计算生成速度=生成的token数/耗时
      //toFixed(2)保留两位小数，45.67tokens/秒
      return data
    }
  } catch (error) {
    //截取错误信息
    console.error('Chat API Error:', error)
    throw error
  }

}
export default {
  name: 'api'
}