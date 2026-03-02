//智能状态管理，自动切换，防空保护，焦点保持
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore(
  'llm-chat', () => {
    const conversations = ref([
      {
        id: '1',
        title: '日常问候',
        messages: [],//消息数组
        createdAt: Date.now(),//创建时间
      },
    ])

    //当前选中的对话ID
    const currentConversationId = ref('1')
    //加载状态
    const isLoading = ref(false)
    //获取当前对话，当前的对话信息
    const currentConversation = computed(() => {
      return conversations.value.find((conv) => conv.id === currentConversationId.value)
    })
    //获取当前对话信息
    const currentMessages = computed(() => currentConversation.value?.messages || [])
    // 1.对话管理
    //创建新对话
    const createConversation = () => {
      const newConversation = {
        id: Date.now().toString(),//使用时间戳作为唯一的id
        title: '日常问候',
        messages: [],
        createdAt: Date.now(),
      }
      conversations.value.unshift(newConversation)//添加到开头
      currentConversationId.value = newConversation.id//自动切换到新对话
    }

    //切换对话
    const switchConversation = (conversationId) => {
      currentConversationId.value = conversationId
    }
    //2.消息管理
    //添加消息到当前对话
    const addMessage = (message) => {
      if (currentConversation.value) {
        currentConversation.value.messages.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...message,//包含role,content等等属性
        })
      }
    }
  
    const setIsLoading = (value) => {
      isLoading.value = value
    }
    //更新最后一条消息（用于流式相应） 
    const updateLastMessage = (content, reasoning_content, completion_tokens, speed) => {
      if (currentConversation.value?.messages.length > 0) {
        const lastMessage =
        currentConversation.value.messages[currentConversation.value.messages.length - 1]
        lastMessage.content = content
        lastMessage.reasoning_content = reasoning_content
        lastMessage.completion_tokens = completion_tokens
        lastMessage.speed = speed
      }
    }
    //获取最后一条消息
    const getLastMessage = () => {
      if (currentConversation.value?.messages.length > 0) {
        return currentConversation.value.messages[currentConversation.value.messages.length - 1]
      }
      return null
    }
    // 3.对话维护
    //更新对话标题
    const updateConversationTitle = (conversationId, newTitle) => {
      const conversation = conversations.value.find((c) => c.id === conversationId)
      if (conversation) {
        conversation.title = newTitle
      }
    }
    //删除对话
    const deleteConversation = (conversationId) => {
      const index = conversations.value.findIndex((c) => c.id === conversationId)
      if (index !== -1) {
        conversations.value.splice(index, 1)
        //如果删除后没有对话，创建一个新对话
        if (conversations.value.length === 0) {
          createConversation()
        }
        //如果删除的是当前对话，，切换到第一个对话
        else if (conversationId === currentConversationId.value) {
          currentConversationId.value = conversations.value[0].id
        }
      }
    }

    return {
      conversations,
      currentConversationId,
      currentConversation,
      currentMessages,
      isLoading,
      addMessage,
      setIsLoading,
      updateLastMessage,
      getLastMessage,
      createConversation,
      switchConversation,
      updateConversationTitle,
      deleteConversation,
    }

  }, {
    //持久化配置
  persist: true//自动将状态保存到localStorage
})