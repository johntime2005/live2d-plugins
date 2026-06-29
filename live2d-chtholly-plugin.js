/**
 * Live2D 珂朵莉看板娘插件
 * 版本: 1.0.1
 * 作者: johntime
 * 仓库: https://github.com/akikowork/chtholly_kanban
 * 描述: 在网页上显示珂朵莉 Live2D 看板娘，支持鼠标互动和模型切换
 */

// ============ 插件配置 ============
const Plugin = {
  Name: 'Live2D 珂朵莉看板娘',
  Version: '1.0.1',
  Author: 'johntime',
  Description: '在网页上显示珂朵莉 Live2D 看板娘',
  AutoStart: true,
  DisableMessage: false,
}

// ============ 模型列表 ============
// 每个模型需要 modelJson 字段指向 .model.json 文件
const MODEL_LIST = [
  {
    name: '珂朵莉',
    modelJson: 'https://cdn.jsdelivr.net/gh/akikowork/chtholly_kanban@master/chtholly/assets/chtholly.model.json',
    color: 'rgb(100,149,237)',
  },
  {
    name: 'Pio',
    modelJson: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api@master/model/Potion-Maker/Pio/model.json',
    color: 'rgb(166,131,216)',
  },
  {
    name: 'Tia',
    modelJson: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api@master/model/Potion-Maker/Tia/model.json',
    color: 'rgb(212,224,236)',
  },
  {
    name: 'Shizuku',
    modelJson: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api@master/model/ShizukuTalk/shizuku-48/model.json',
    color: 'rgb(93,147,219)',
  },
  {
    name: '22',
    modelJson: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api@master/model/bilibili-live/22/model.json',
    color: 'rgb(255,105,180)',
  },
]

// 当前模型索引（默认珂朵莉）
let currentModelIndex = 0

// ============ 插件主体 ============
const loadLive2DWidget = async () => {
  const model = MODEL_LIST[currentModelIndex]
  if (!model) {
    console.error('Live2D 插件: 模型索引越界', currentModelIndex)
    return
  }

  // 清除旧的 waifu 元素
  const oldWaifu = document.getElementById('waifu')
  if (oldWaifu) oldWaifu.remove()

  const script = document.createElement('script')
  script.innerHTML = /* javascript */ `
  const live2d_path = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/'

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

  if (screen.width >= 768) {
    Promise.all([
      loadExternalResource(live2d_path + 'waifu.css', 'css'),
      loadExternalResource(live2d_path + 'live2d.min.js', 'js'),
      loadExternalResource(live2d_path + 'waifu-tips.js', 'js')
    ]).then(() => {
      initWidget({
        model: {
          jsonPath: '${model.modelJson}'
        },
        display: {
          position: 'right',
          width: 200,
          height: 400,
        },
        mobile: {
          show: false,
        },
        ${Plugin.DisableMessage ? '' : `waifuPath: live2d_path + 'waifu-tips.json',`}
        tools: ['switch-model', 'switch-texture', 'quit']
      })

      // 设置主题颜色
      document.documentElement.style.setProperty('--primary-color', '${model.color}')
      document.documentElement.style.setProperty('--secondary-color', '${model.color}')
    })
  }
  `

  document.body.appendChild(script)

  // 等待加载完成后绑定切换按钮
  let changeModelBtn = null
  let tryCount = 0
  while (!changeModelBtn && tryCount < 15) {
    changeModelBtn = document.getElementById('waifu-tool-switch-model')
    if (changeModelBtn) break
    tryCount += 1
    await Plugins.sleep(1000)
  }

  if (changeModelBtn) {
    changeModelBtn.onclick = () => {
      currentModelIndex = (currentModelIndex + 1) % MODEL_LIST.length
      console.log('切换到模型:', MODEL_LIST[currentModelIndex].name)
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
