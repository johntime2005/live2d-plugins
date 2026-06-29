/** @type {EsmPlugin} */
export default (Plugin) => {
  const appStore = Plugins.useAppStore()

  /* 触发器 手动触发 */
  const onRun = () => {
    loadLive2D()
  }

  /* 触发器 APP就绪后 */
  const onReady = () => {
    if (Plugin.AutoStart) {
      loadLive2D()
    }
  }

  const loadLive2D = () => {
    // 检查是否已加载
    if (document.getElementById('waifu')) return

    // 珂朵莉模型配置
    const modelJson = 'https://cdn.jsdelivr.net/gh/akikowork/chtholly_kanban@master/chtholly/assets/chtholly.model.json'

    // 加载 CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/waifu.css'
    document.head.appendChild(link)

    // 加载 JS
    const loadScript = (src) => new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = src
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })

    Promise.all([
      loadScript('https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js'),
      loadScript('https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/waifu-tips.js'),
    ]).then(() => {
      initWidget({
        model: {
          jsonPath: modelJson
        },
        display: {
          position: 'right',
          width: 200,
          height: 400,
        },
        mobile: {
          show: false,
        },
        tools: ['switch-model', 'switch-texture', 'quit']
      })
    }).catch(err => {
      console.error('Live2D 加载失败:', err)
    })
  }
}
