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
  if (document.getElementById('live2d')) return

  try {
    await loadExternalResource(LIVE2D_CDN + 'live2d.min.js', 'js')

    const style = document.createElement('style')
    style.textContent = `
      #live2d {
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 9999;
        /* 不缩放不裁剪，直接显示原始尺寸 */
      }
    `
    document.head.appendChild(style)

    const canvas = document.createElement('canvas')
    canvas.id = 'live2d'
    canvas.width = 300
    canvas.height = 300
    document.body.appendChild(canvas)

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
