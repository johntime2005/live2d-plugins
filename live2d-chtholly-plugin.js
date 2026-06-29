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

  /** 注入自定义样式覆盖 */
  function injectCustomStyles() {
    const style = document.createElement('style')
    style.textContent = `
      #waifu {
        position: fixed !important;
        bottom: 0 !important;
        right: 0 !important;
        left: auto !important;
        z-index: 999;
        overflow: visible;
      }
      #waifu canvas#live2d {
        width: 200px;
        height: 400px;
      }
      #waifu-tool {
        position: absolute;
        bottom: 10px;
        right: 10px;
        display: flex;
        gap: 4px;
      }
      #waifu-tool span {
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      #waifu-tool span:hover {
        opacity: 1;
      }
    `
    document.head.appendChild(style)
  }

  /** 构建 DOM 结构（canvas + 关闭按钮） */
  function createWaifuDOM() {
    const waifu = document.createElement('div')
    waifu.id = 'waifu'
    waifu.innerHTML = `
      <canvas id="live2d" width="800" height="800"></canvas>
      <div id="waifu-tool">
        <span id="waifu-tool-quit" title="关闭">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="16" height="16">
            <path fill="currentColor" d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/>
          </svg>
        </span>
      </div>
    `
    document.body.appendChild(waifu)

    const quitBtn = document.getElementById('waifu-tool-quit')
    quitBtn.addEventListener('click', () => {
      waifu.style.display = 'none'
    })

    return waifu
  }

  /** 核心加载逻辑 */
  const loadLive2DWidget = async () => {
    if (screen.width < 768) return
    if (document.getElementById('waifu')) return

    try {
      // 加载 CSS + live2d.min.js（核心渲染引擎）
      await Promise.all([
        loadExternalResource(LIVE2D_CDN + 'waifu.css', 'css'),
        loadExternalResource(LIVE2D_CDN + 'live2d.min.js', 'js')
      ])

      // 注入自定义样式覆盖默认定位
      injectCustomStyles()

      // 创建 DOM
      createWaifuDOM()

      // 等一帧确保 DOM 渲染
      await new Promise(r => setTimeout(r, 200))

      // 直接调用 loadlive2d 加载珂朵莉模型
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
