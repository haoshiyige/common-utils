import { WatermarkOptions, CreateCanvasOptions, CreateWatermarkWrapOptions } from '../../types/index.d'

const createForeignObjectSVG = (
  width: number,
  height: number,
  x = 1,
  y = 1,
  node: Node
): SVGForeignObjectElement => {
  const xmlns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(xmlns, 'svg')
  const foreignObject = document.createElementNS(xmlns, 'foreignObject')
  svg.setAttributeNS(null, 'width', width.toString())
  svg.setAttributeNS(null, 'height', height.toString())

  foreignObject.setAttributeNS(null, 'width', '100%')
  foreignObject.setAttributeNS(null, 'height', '100%')
  foreignObject.setAttributeNS(null, 'x', x.toString())
  foreignObject.setAttributeNS(null, 'y', y.toString())
  foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true')
  svg.appendChild(foreignObject)

  foreignObject.appendChild(node)

  return svg
}

const loadSerializedSVG = (svg: Node): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject

    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`
  })
}
// 创建水印
async function createCanvas({
  text,
  canvasWidth = 300,
  canvasHeight = 150,
  font = '14px normal',
  color = 'rgba(180, 180, 180, 0.3)',
  rotate = -20
}: CreateCanvasOptions): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const fontEl = document.createElement('div')
  fontEl.style.setProperty('width', canvasWidth + 'px')
  fontEl.style.setProperty('height', canvasHeight + 'px')
  fontEl.style.setProperty('color', color)
  fontEl.style.setProperty('font', font)
  fontEl.style.setProperty('display', 'flex')
  fontEl.style.setProperty('text-align', 'center')
  fontEl.style.setProperty('justify-content', 'center')
  fontEl.style.setProperty('align-items', 'center')
  fontEl.style.setProperty('transform', `rotate(${rotate}deg)`)
  fontEl.style.setProperty('transform-origin', 'center center')

  if (Array.isArray(text)) {
    fontEl.innerHTML = text.join('<br>')
  } else {
    fontEl.innerHTML = text
  }
  const svg = createForeignObjectSVG(
    canvasWidth,
    canvasHeight,
    1,
    1,
    fontEl
  )
  const img = await loadSerializedSVG(svg)
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D
  ctx.drawImage(img, 0, 0)

  return canvas.toDataURL('image/png')
}

// 创建和设置水印容器
function createWatermarkWrap({ zIndex = '9999', imageUrl }: CreateWatermarkWrapOptions): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'
  wrapper.style.width = '100%'
  wrapper.style.height = '100%'
  wrapper.style.left = '0'
  wrapper.style.top = '0'
  wrapper.style.zIndex = zIndex
  wrapper.style.pointerEvents = 'none'
  wrapper.style.setProperty('background-image', `url(${imageUrl})`)
  wrapper.style.setProperty('background-repeat', 'repeat')

  return wrapper
}

/**
 * @description 指定元素添加水印
 * @param options 配置参数
 * @returns 返回重载和删除方法 const [reload, remove] = useWatermark({ text: '水印文案' })
 */
const useWatermark = async ({
  text,
  el = document.body,
  canvasWidth,
  canvasHeight,
  font,
  color,
  rotate,
  zIndex,
  imageUrl
}: WatermarkOptions) => {

  if (!imageUrl) {
    imageUrl = await createCanvas({
      canvasWidth,
      canvasHeight,
      font,
      rotate,
      color,
      text
    })
  }

  const wrapper = createWatermarkWrap({ imageUrl, zIndex })
  el.appendChild(wrapper)

  return [
    (options: WatermarkOptions) => {
      el.removeChild(wrapper)
      options.el = options.el || el
      useWatermark(options)
    },
    () => {
      el.removeChild(wrapper)
    }
  ]
}

export default useWatermark
