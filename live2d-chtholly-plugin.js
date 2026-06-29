/**
 * 本插件使用项目：https://github.com/stevenjoezhang/live2d-widget
 * 珂朵莉模型来源：https://github.com/akikowork/chtholly_kanban
 * 另外：插件系统不推荐动态载入js、css，因此此插件并不符合规范！
 */

const LIVE2D_CDN = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/'
const CTHOLLY_MODEL_URL = 'https://cdn.jsdelivr.net/gh/akikowork/chtholly_kanban@master/chtholly/assets/chtholly.model.json'

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

const loadLive2DWidget = async () => {
  if (screen.width < 768) return
  if (document.getElementById('chtholly-wrapper')) return

  try {
    await loadExternalResource(LIVE2D_CDN + 'live2d.min.js', 'js')

    // wrapper: 固定右下角，固定显示大小，overflow裁剪
    // canvas: 800x800 高分辨率渲染，CSS缩到300x300，translateY下移露出头部
    const style = document.createElement('style')
    style.textContent = `
      #chtholly-wrapper {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 300px;
        height: 300px;
        overflow: hidden;
        z-index: 9999;
      }
      #chtholly-wrapper canvas {
        display: block;
        width: 300px;
        height: 300px;
        transform: translateY(30px);
      }
    `
    document.head.appendChild(style)

    const wrapper = document.createElement('div')
    wrapper.id = 'chtholly-wrapper'

    const canvas = document.createElement('canvas')
    canvas.id = 'live2d'
    canvas.width = 800
    canvas.height = 800
    wrapper.appendChild(canvas)

    document.body.appendChild(wrapper)

    await new Promise(r => setTimeout(r, 100))

    loadlive2d('live2d', CTHOLLY_MODEL_URL)

    console.log('[Live2D] 珂朵莉加载完成')
  } catch (err) {
    console.error('[Live2D] 加载失败:', err)
  }
}

const onRun = async () => {
  await loadLive2DWidget()
}

const onReady = () => {
  Plugin.AutoStart && loadLive2DWidget()
}
