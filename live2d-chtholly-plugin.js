/** @type {EsmPlugin} */
export default (Plugin) => {
  const CTHOLLY_MODEL_URL = 'https://cdn.jsdelivr.net/gh/akikowork/chtholly_kanban@master/chtholly/assets/chtholly.model.json'
  const LIVE2D_CDN = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/'
  const WIDTH = 250
  const HEIGHT = 500

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

  /** 注入所有样式 */
  function injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      #chtholly-live2d {
        position: fixed;
        bottom: 0;
        right: 10px;
        z-index: 9999;
        pointer-events: none;
      }
      #chtholly-live2d canvas {
        pointer-events: auto;
      }
      #chtholly-live2d .close-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 20px;
        height: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: auto;
        color: #fff;
        text-shadow: 0 0 4px rgba(0,0,0,0.5);
        font-size: 18px;
        line-height: 20px;
        text-align: center;
      }
      #chtholly-live2d:hover .close-btn {
        opacity: 0.7;
      }
      #chtholly-live2d .close-btn:hover {
        opacity: 1;
      }
    `
    document.head.appendChild(style)
  }

  /** 创建 DOM */
  function createDOM() {
    const wrapper = document.createElement('div')
    wrapper.id = 'chtholly-live2d'
    wrapper.innerHTML = `
      <canvas id="live2d" width="${WIDTH}" height="${HEIGHT}"></canvas>
      <div class="close-btn" title="关闭">&times;</div>
    `
    document.body.appendChild(wrapper)

    wrapper.querySelector('.close-btn').addEventListener('click', () => {
      wrapper.style.display = 'none'
    })

    return wrapper
  }

  /** 核心加载逻辑 */
  const loadLive2DWidget = async () => {
    if (screen.width < 768) return
    if (document.getElementById('chtholly-live2d')) return

    try {
      // 只加载 live2d.min.js（渲染引擎），不加载 waifu.css
      await loadExternalResource(LIVE2D_CDN + 'live2d.min.js', 'js')

      // 注入自定义样式
      injectStyles()

      // 创建 DOM
      createDOM()

      // 等 DOM 渲染
      await new Promise(r => setTimeout(r, 200))

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
