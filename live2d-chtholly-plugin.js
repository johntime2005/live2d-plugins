/**
 * Live2D 珂朵莉看板娘插件
 * 版本: 1.0.0
 * 作者: johntime
 * 仓库: https://github.com/akikowork/chtholly_kanban
 * 描述: 在网页上显示珂朵莉 Live2D 看板娘，支持鼠标互动和模型切换
 */

// ============ 插件配置 ============
const Plugin = {
  Name: 'Live2D 珂朵莉看板娘',
  Version: '1.0.0',
  Author: 'johntime',
  Description: '在网页上显示珂朵莉 Live2D 看板娘',
  AutoStart: true,
  DisableMessage: false,
}

// ============ 模型配置 ============
const MODEL_CONFIG = {
  // 珂朵莉模型（Cubism 2.0）
  chtholly: {
    name: '珂朵莉',
    cdn: 'https://cdn.jsdelivr.net/gh/akikowork/chtholly_kanban/',
    modelJson: 'https://cdn.jsdelivr.net/gh/akikowork/chtholly_kanban/chtholly/assets/chtholly.model.json',
    color: 'rgb(100,149,237)',  // 珂朵莉蓝色
  },
  // 其他可选模型
  pio: {
    name: 'Pio',
    cdn: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
    modelPath: 'Potion-Maker/Pio',
    color: 'rgb(166,131,216)',
  },
  tia: {
    name: 'Tia',
    cdn: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
    modelPath: 'Potion-Maker/Tia',
    color: 'rgb(212,224,236)',
  },
  shizuku: {
    name: 'Shizuku',
    cdn: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
    modelPath: 'ShizukuTalk/shizuku-48',
    color: 'rgb(93,147,219)',
  },
}

// 当前使用的模型
const CURRENT_MODEL = 'chtholly'

// ============ 插件主体 ============
const loadLive2DWidget = async () => {
  const model = MODEL_CONFIG[CURRENT_MODEL]
  if (!model) {
    console.error('Live2D 插件: 未找到模型配置', CURRENT_MODEL)
    return
  }

  const script = document.createElement('script')
  script.innerHTML = /* javascript */ `
  // Live2D Widget CDN 路径
  const live2d_path = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/'

  // 封装异步加载资源的方法
  function loadExternalResource(url, type) {
    return new Promise((resolve, reject) => {
      let tag
      if (type === 'css') {
        tag = document.createElement('link')
        tag.rel = 'stylesheet'
        tag.href = url
      } else if (type === 'js') {
        tag = document.createElement('script')
        tag.src = url
      }
      if (tag) {
        tag.onload = () => resolve(url)
        tag.onerror = () => reject(url)
        document.head.appendChild(tag)
      }
    })
  }

  // 加载资源并初始化
  if (screen.width >= 768) {
    Promise.all([
      loadExternalResource(live2d_path + 'waifu.css', 'css'),
      loadExternalResource(live2d_path + 'live2d.min.js', 'js'),
      loadExternalResource(live2d_path + 'waifu-tips.js', 'js')
    ]).then(() => {
      const options = {
        cdnPath: '${model.cdn}',
        tools: ['switch-model', 'switch-texture', 'quit']
      }

      // 珂朵莉使用自定义模型路径
      ${model.modelJson ? `
      options.model = {
        jsonPath: '${model.modelJson}'
      }
      ` : ''}

      // 是否显示提示消息
      ${Plugin.DisableMessage ? 'false' : 'true'} && (options.waifuPath = live2d_path + 'waifu-tips.json')

      // 初始化 Live2D Widget
      initWidget(options)

      // 设置主题颜色
      document.documentElement.style.setProperty('--primary-color', '${model.color}')
      document.documentElement.style.setProperty('--secondary-color', '${model.color}')
    })
  }
  `

  // 清除旧的 waifu 元素（如果存在）
  const oldWaifu = document.getElementById('waifu')
  if (oldWaifu) oldWaifu.remove()

  document.body.appendChild(script)

  // 等待模型加载完成后设置切换按钮
  let changeModelBtn = null
  let tryCount = 0
  while (!changeModelBtn && tryCount < 15) {
    changeModelBtn = document.getElementById('waifu-tool-switch-model')
    if (changeModelBtn) break
    tryCount += 1
    await Plugins.sleep(1000)
  }

  // 切换模型按钮点击事件
  if (changeModelBtn) {
    changeModelBtn.onclick = () => {
      // 切换到下一个模型
      const modelKeys = Object.keys(MODEL_CONFIG)
      const currentIndex = modelKeys.indexOf(CURRENT_MODEL)
      const nextIndex = (currentIndex + 1) % modelKeys.length
      const nextModelKey = modelKeys[nextIndex]

      // 更新主题颜色
      const color = MODEL_CONFIG[nextModelKey].color
      document.documentElement.style.setProperty('--primary-color', color)
      document.documentElement.style.setProperty('--secondary-color', color)

      // 重新加载模型
      loadLive2DWidget()
    }
  }
}

// ============ 插件生命周期 ============
const onRun = async () => {
  await loadLive2DWidget()
}

const onReady = () => {
  Plugin.AutoStart && loadLive2DWidget()
}
