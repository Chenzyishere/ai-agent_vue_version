export const messageHandler = {
  formatMessage(role, content, reasoning_content = '', files = []) {
    return {
      id: Date.now(),
      role,
      content,
      reasoning_content,
      files,
      completion_tokens: 0,
      speed: 0,
      loading: false,
    }
  },

  // 处理流式响应
  async handleStreamResponse(response, updateCallback) {
    if (!response || !response.body) {
      console.log('handleStreamResponse,Response or response.body is undefined', response);
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let accumulatedContent = ''
    let accumulatedReasoning = ''
    let startTime = Date.now()

    while (true) {
      //这里是调用流式响应的核心，持续监听reader.read,然后如果返回done就停止
      //使用await确保按照顺序处理每个数据块
      const { done, value } = await reader.read()
      if (done) break

      //这里是SSE协议的解析，正确处理SSE格式(data:前缀)
      //
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((line) => line.trim() !== '')

      for (const line of lines) {//使用||''是防御性编程的一种
        if (line === 'data: [DONE]') continue//如果识别到[DONE]的信号但是也不做特殊的处理
        if (line.startsWith('data: ')) {//在data：后提取JSON数据
          const data = JSON.parse(line.slice(5))//JSON的解析与数据切片，从字符串的第六个字符开始截取，移除SSE协议的data前缀
          const content = data.choices[0].delta.content || ''//获取回复的文本，访问Choices[0].delta获取本次数据块的增量内容
          const reasoning = data.choices[0].delta.reasoning_content || ''//获取深度思考的内容
          //内容的累积，用字符串的拼接逐步构建完整的响应
          accumulatedContent += content
          accumulatedReasoning += reasoning

          // 通过回调更新消息
          updateCallback(
            accumulatedContent,
            accumulatedReasoning,
            data.usage?.completion_tokens || 0,//在这里计算并传递tokens的使用量和生成速度
            ((data.usage?.completion_tokens || 0) / ((Date.now() - startTime) / 1000)).toFixed(2),
          )
        }
      }
    }
  },

  // 处理非流式响应
  handleNormalResponse(response, updateCallback) {
    updateCallback(
      response.choices[0].message.content,//如果是处理非流式响应，那就直接回调
      response.choices[0].message.reasoning_content || '',
      response.usage.completion_tokens,
      response.speed,
    )
  },

  // 统一的响应处理函数
  async handleResponse(response, isStream, updateCallback) {
    if (!response || !response.body) {
      console.log('handleResponse,Response or response.body is undefined', response);
    }
    if (isStream) {
      await this.handleStreamResponse(response, updateCallback)
    } else {
      this.handleNormalResponse(response, updateCallback)
    }
  },
}
