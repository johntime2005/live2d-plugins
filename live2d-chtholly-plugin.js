/** @type {EsmPlugin} */
export default (Plugin) => {
  const CTHOLLY_MODEL_URL = 'https://cdn.jsdelivr.net/gh/akikowork/chtholly_kanban@master/chtholly/assets/chtholly.model.json'
  const LIVE2D_CDN = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/'

  /** 动态加载外部资源 */
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
        tag.onerror = () => reject(new Error(`Failed to load: ${url}`))
        document.head.appendChild(tag)
      }
    })
  }

  /**
   * 加载珂朵莉 Live2D 模型
   *
   * 原理：
   * - live2d.min.js 暴露全局函数 loadlive2d(canvasId, modelJsonUrl)
   * - 渲染用 canvas 的 width/height 属性做 WebGL viewport
   * - 所以 canvas 属性的宽高比必须和 CSS 显示一致，否则变形
   * - 原版 widget 用 800x800 正方形 canvas，我们保持正方形但缩小
   */
  const loadLive2DWidget = async () => {
    if (screen.width < 768) return
    if (document.getElementById('live2d')) return

    try {
      // 只加载渲染引擎，不加载 waifu.css 和 waifu-tips.js
      await loadExternalResource(LIVE2D_CDN + 'live2d.min.js', 'js')

      // 注入样式
      const style = document.createElement('style')
      style.textContent = `
        #live2d {
          position: fixed;
          bottom: 0;
          right: 0;
          z-index: 9999;
        }
      `
      document.head.appendChild(style)

      // 创建 canvas（正方形，和原版 widget 一致的宽高比）
      const canvas = document.createElement('canvas')
      canvas.id = 'live2d'
      canvas.width = 300
      canvas.height = 300
      document.body.appendChild(canvas)

      // 等 DOM 渲染
      await new Promise(r => setTimeout(r, 100))

      // 加载珂朵莉模型
      loadlive2d('live2d', CTHOLLY_MODEL_URL)

      console.log('[Live2D] 珂朵莉加载完成')
    } catch (err) {
      console.error('[Live2D] 加载失败:', err)
    }
  }

  /* 触发器 手动触发 */
  const onRun = async () => {
    await loadLive2DWidget()
  }

  /* 触发器 APP就绪后 */
  const onReady = () => {
    Plugin.AutoStart && loadLive2DWidget()
  }

  return {
    onRun,
    onReady
  }
}
