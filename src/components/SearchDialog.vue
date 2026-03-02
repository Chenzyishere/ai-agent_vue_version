<script setup>
import {ref,watch} from 'vue'
import ChatMessage from './ChatMessage.vue'
import {messageHandler} from '@/utils/messageHandler'
import {createChatCompletion} from '@/utils/api'
import {useSettingStore} from '@/stores/setting'

const searchText = ref('')
const messages = ref([])
const isLoading=ref(false)
const settingStore=useSettingStore()

//模拟一个初始的AI消息
const aiMessage='Hi'
//模拟建议的提示词
const suggestedPrompts=[
  'Text123',
  'Text456'
]
//获取消息容器
</script>
<template>
  <div class="search-dialog">
    <div class="search-header">
      <div class="search-input">
        <input
          type="text"
          v-model="searchText"
          placeholder="提问"
          autofocus
          @keydown.enter.prevent="handleSend"
        />
        <button class="action-btn" @click="handleSend" :disabled="isLoading">
          <img src="@/assets/photo/回车.png" alt="enter" />
        </button>
      </div>
    </div>

    <!-- 对话内容部分 -->
    <div class="dialog-content" ref="messagesContainer">
      <template v-if="messages.length === 0">
        <!-- 初始 AI 消息 -->
        <div class="initial-message">
          {{ aiMessage }}
        </div>

        <!-- 建议提示词 -->
        <div class="suggested-prompts">
          <div class="prompt-title">建议提示词</div>
          <div class="prompt-list">
            <button
              v-for="prompt in suggestedPrompts"
              :key="prompt"
              class="prompt-item"
              @click="searchText = prompt"
            >
              {{ prompt }}
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <!-- 对话消息列表 -->
        <ChatMessage
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :is-last-assistant-message="index === messages.length - 1 && message.role === 'assistant'"
          @regenerate="handleRegenerate"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-dialog {
  max-width: 640px; // 设置最大宽度
  min-width: 320px; // 设置最小宽度
  max-height: 600px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex; // 使用弹性布局
  flex-direction: column; // 垂直排列

  .search-header {
    flex-shrink: 0; // 防止头部压缩
    padding: 12px;
    border-bottom: 1px solid #eaeaea;

    .search-input {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      position: relative;

      input {
        flex: 1; // 输入框占据剩余空间
        height: 100%;
        border: none;
        outline: none;
        background: none;
        font-size: 1rem;
        color: #000;
        padding-right: 40px;

        &::placeholder {
          color: #999;
        }
      }

      .action-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 28px;
        height: 28px;
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s;

        img {
          width: 16px;
          height: 16px;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  .dialog-content {
    flex: 1; // 对话内容区域占据剩余空间
    padding: 12px;
    overflow-y: auto; // 允许垂直滚动
    display: flex;
    flex-direction: column;
    gap: 16px;

    .initial-message {
      padding: 12px 12px;
      color: #000;
      font-size: 14px;
      line-height: 1.5;
      display: flex;
      align-items: center;
    }

    .suggested-prompts {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .prompt-title {
        padding-left: 12px;
        font-size: 12px;
        color: #666;
      }

      .prompt-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .prompt-item {
          text-align: left;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          color: #000;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;

          &:hover {
            background-color: #f5f5f5;
          }
        }
      }
    }
  }
}
</style>