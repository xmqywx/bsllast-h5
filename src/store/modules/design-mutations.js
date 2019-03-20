import { fabric } from 'fabric'
import 'fabric-customise-controls'
import $ from 'jquery'
import { SupportFontLists } from '@/fonts/supportFontList.js'
const mutations = {
  add,
  addText,
  copy,
  createCanvas,
  createMask,
  initialMouseDownEvent,
  loadJson,
  refreshCanvas,
  replay,
  saveJson,
  setXY,
  setDocumentFontFamily,
  zoomCanvas
}
const FONT_FORMAT = {
  eot: '',
  otf: 'opentype',
  svg: 'svg',
  ttf: 'truetype',
  woff: 'woff',
  woff2: 'woff2'
}
function add(state, { object, scaleW = state.pannelW / 4, tier }) {
  object.scaleToWidth(scaleW)
  object.initialScale = object.scaleX
  state.canvas.add(object)
  state.canvas.setActiveObject(object)
  tier && object.moveTo(tier)
  this.commit('initialMouseDownEvent', {
    activeObject: object,
    from: 'leftSide'
  })
  this.commit('createMask')
  state.canvas.trigger('object:modified')
  state.canvas.renderAll()
}
function addText(state, obj) {
  const textSample = new fabric.Textbox(obj.text, {
    fontSize: obj.size,
    left: setAddObjectPoint(state).left,
    top: setAddObjectPoint(state).top,
    fontFamily: 'SimHei',
    angle: 0,
    fill: '#000000',
    fontWeight: '',
    originX: 'left',
    width: 100,
    hasRotatingPoint: true,
    centerTransform: true
  })
  textSample.left -= textSample.width / 2
  textSample.top -= textSample.height / 2
  this.commit('add', { object: textSample })
}
function setAddObjectPoint(state, { activeObject } = {}) {
  const left = (state.arrX[0] + state.arrX[1]) / 2 - state.pannelW / 4 / 2
  const top = (state.arrY[0] + state.arrY[1]) / 2
  activeObject = activeObject || {}
  activeObject.left = left
  activeObject.top = top
  return { left, top }
}
function animate({ duration, draw, timing }) {
  const start = performance.now()

  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration
    if (timeFraction > 1) timeFraction = 1

    const progress = timing(timeFraction)

    draw(progress)

    if (timeFraction < 1) {
      requestAnimationFrame(animate)
    }
  })
}
function cloneClipInit(state, item) {
  const patternSourceCanvas = new fabric.StaticCanvas()

  fabric.util.enlivenObjects([item.info.clipClone], (objs) => {
    if (objs.length > 0) {
      item.info.clipClone = objs[0]
    }
  })
  fabric.util.enlivenObjects([item.info.clipMask], (objs) => {
    if (objs.length > 0) {
      item.info.clipMask = objs[0]
    }
  })
  fabric.util.enlivenObjects([item.info.clipImg], (objs) => {
    if (objs.length > 0) {
      item.info.clipImg = objs[0]
    }

    patternSourceCanvas.add(item.info.clipImg)

    item.fill.source = function() {
      patternSourceCanvas.setDimensions({
        width: item.info.clipImg.getScaledWidth(),
        height: item.info.clipImg.getScaledHeight()
      })
      patternSourceCanvas.renderAll()
      return patternSourceCanvas.getElement()
    }
    state.canvas.renderAll()
  })
}
function copy(state) {
  const activeObject = state.canvas.getActiveObject()
  if (!activeObject) {
    return
  }
  activeObject.clone((clonedObj) => {
    state.canvas.discardActiveObject()
    const params = {
      left: clonedObj.left + 10,
      top: clonedObj.top + 10,
      evented: true
    }
    activeObject.stype && (params.stype = clonedObj.stype)

    clonedObj.set(params)
    if (clonedObj.clipPath) {
      clonedObj.set('objectCaching', true)
    } else if (clonedObj._objects && clonedObj._objects.length > 0) {
      const obj = clonedObj._objects.find((c) => {
        return c.clipPath
      })
      if (obj) {
        clonedObj.set('objectCaching', true)
      }
    }
    if (clonedObj.type === 'activeSelection') {
      clonedObj.canvas = this.canvas
      clonedObj.forEachObject((obj) => {
        state.canvas.add(obj)
      })
    } else {
      state.canvas.add(clonedObj)
    }
    state.canvas.setActiveObject(clonedObj)
    state.activeObject = clonedObj
    state.canvas.trigger('object:modified')
    state.canvas.requestRenderAll()
  }, state.toJSONProperties)
}

function createCanvas(state, { type }) {
  const that = this
  state.oneMMToPx = $('#divMMHeight').height()
  state.oneCMToPx = $('#divCMHeight').height()
  state.canvas = new fabric.Canvas('canvas', {
    preserveObjectStacking: true,
    backgroundColor: type === 'text' ? 'rgba(0,0,0,0)' : '#ebeced'
  })
  fabric.Object.prototype.set({
    padding: state.controlPadding,
    // borderColor: '#766ef3',
    // cornerStrokeColor: 'rgb(255, 255, 255)',
    cornerColor: '#766ef3',
    cornerStyle: 'circle',
    selectionBackgroundColor: 'rgba(255, 255, 255, 0)',
    transparentCorners: false,
    // centeredScaling: true,
    allowTouchScrolling: true,
    centeredRotation: true,
    rotatingPointOffset: 30,
    objectCaching: false
  })

  // initAligningGuidelines(state.canvas)
  // this.commit('rotateCorner')
  fabric.Canvas.prototype.customiseControls({
    tl: {
      action: 'remove',
      cursor: 'pointer'
    }
  })
  fabric.Object.prototype.customiseCornerIcons({
    settings: {
      cornerSize: 10,
      cornerShape: 'circle',
      cornerStrokeColor: 'rgb(255, 255, 255)',
      cornerColor: '#766ef3',
      borderColor: '#7B8991'
    },
    br: {
      icon: 'https://bsl-files.oss-cn-shenzhen.aliyuncs.com/wxcanvas/adjust.png',
      settings: {
        cornerShape: 'circle',
        cornerBackgroundColor: 'rgba(0, 0, 0, 0)',
        cornerSize: 20
      }
    },
    tl: {
      icon: 'https://bsl-files.oss-cn-shenzhen.aliyuncs.com/wxcanvas/del.png',
      settings: {
        cornerShape: 'circle',
        cornerBackgroundColor: 'rgba(0, 0, 0, 0)',
        cornerSize: 20
      }
    },
    mtr: {
      icon: 'https://img.bslong.cn/can_rotate.png',
      settings: {
        cornerShape: 'circle',
        cornerBackgroundColor: '#ffffff',
        cornerSize: 20
      }
    }
  }, function() {
    state.canvas.renderAll()
  })
  state.canvas.on({
    'mouse:down': (e) => {
      const activeObject = state.canvas.getActiveObject()
      if (!activeObject) {
        state.mainTool = true
        return
      }
      console.log(activeObject)
      this.commit('initialMouseDownEvent', { activeObject: activeObject })
    },

    'mouse:out': (e) => {
      state.showHoverTip = false
      state.canvas.renderAll()
    },

    'selection:cleared': function() {
      state.mainTool = true
      state.showTool = false
    },
    'selection:created': function() {
      state.showHoverTip = false
      const activeObject = state.canvas.getActiveObject()
      state.activeObject = activeObject
      if (
        activeObject.type === 'activeSelection' ||
        activeObject.type === 'group'
      ) {
        state.groupTool = true
      }
    },
    'object:modified': () => {
      that.commit('saveJson')
    }
  })
}
function createMask(state) {
  const arrX = state.arrX
  const arrY = state.arrY
  const pathOption = {
    selectable: false,
    fill: state.activePage === 'text' ? '#fff' : '#ebeced',
    // fill: 'red',
    // opacity: 0.2,
    hoverCursor: 'default',
    evented: false,
    excludeFromExport: true,
    hasControls: false,
    perPixelTargetFind: false,
    strokeWidth: 0,
    stroke: null
  }

  const rect1 = new fabric.Rect({
    width: arrX[0] - arrX[2],
    height: arrY[3] - arrY[2]
  })
  const rect2 = new fabric.Rect({
    width: arrX[3] - arrX[0] + 2,
    height: arrY[0] - arrY[2]
  })
  const rect3 = new fabric.Rect({
    width: arrX[3] - arrX[1],
    height: arrY[1] - arrY[0] + 2
  })
  const rect4 = new fabric.Rect({
    width: arrX[3] - arrX[0],
    height: arrY[3] - arrY[1]
  })
  rect1.set({
    left: arrX[2],
    top: arrY[2],
    name: 'mask1',
    ...pathOption
  })
  rect2.set({
    left: arrX[0] - 1,
    top: arrY[2],
    name: 'mask2',
    ...pathOption
  })
  rect3.set({
    left: arrX[1],
    top: arrY[0] - 1,
    name: 'mask3',
    ...pathOption
  })
  rect4.set({
    left: arrX[0],
    top: arrY[1],
    name: 'mask4',
    ...pathOption
  })

  state.maskPath = new fabric.Group([rect1, rect2, rect3, rect4], {
    selectable: false,
    excludeFromExport: true,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    lockUniScaling: true,
    hoverCursor: 'auto',
    name: 'grid',
    left: arrX[2],
    top: arrY[2],
    type: 'sMask',
    evented: false
  })

  state.backgroundPanel = new fabric.Rect({
    left: arrX[0],
    top: arrY[0],
    selectable: false,
    evented: false,
    width: state.pannelW,
    height: state.pannelH,
    strokeWidth: 0,
    fill: !state.activePage ? '#ffffff' : 'rgba(0, 0, 0, 0)',
    objectCaching: false,
    hoverCursor: 'default',
    excludeFromExport: true,
    hasControls: false,
    type: 'sBg',
    perPixelTargetFind: false
  })
  state.canvas.remove(...state.canvas.getObjects('sMask'))
  state.canvas.remove(...state.canvas.getObjects('sBg'))
  state.canvas.add(state.maskPath)
  state.canvas.add(state.backgroundPanel)
  state.canvas.sendToBack(state.backgroundPanel)

  state.canvas.renderAll()
}
function loadJson(state, { json, isRedoUndo, type }) {
  if (!isRedoUndo) {
    state.canvas.clear()
    this.commit('createMask')
  }
  state.undoRedoState = json
  state.canvasTxtList = []
  const _homejson = JSON.parse(json) || JSON.parse(JSON.stringify(json))

  state.pannelW = _homejson.width
  state.pannelH = _homejson.height

  if (state.type && state.type.width) {
    state.svgScale = state.type.width / state.pannelW
  }

  if (_homejson.svgScale) {
    state.svgScale = _homejson.svgScale
  }

  if (!isRedoUndo) {
    this.commit('refreshCanvas')
  }

  state.documentColor = []
  state.documentFontFamily = []
  _homejson.objects.forEach((item) => {
    item.left += state.arrX[0]
    item.top += state.arrY[0]
    item.globalCompositeOperation = false

    if (item.type === 'image') {
      item.crossOrigin = item.crossOrigin || 'anonymous'
    }
    if (item.stype === 'imageMask') {
      item.fill.source = () => {}
    }

    if (item.fontFamily) {
      const fontFamilyName = loadFont(SupportFontLists, item.fontFamily)

      if (fontFamilyName && item.fontFamily !== fontFamilyName) {
        item.fontFamily = fontFamilyName
      }
    }
    if (item.styles) {
      $.map(item.styles, (value, key) => {
        $.map(value, (subVal, subkey) => {
          if (subVal.fontFamily) {
            const fontFamilyName = loadFont(SupportFontLists, subVal.fontFamily)

            if (fontFamilyName && subVal.fontFamily !== fontFamilyName) {
              subVal.fontFamily = fontFamilyName
            }
          }
        })
      })
    }

    if (item.type === 'textbox') {
      if (
        state.documentColor.indexOf(item.fill) === -1 &&
        item.fill !== '#ffffff' &&
        item.fill !== '#FFFFFF'
      ) {
        state.documentColor.push(item.fill)
      }
      this.commit('setDocumentFontFamily', item)
    }
    // 修复老模板遮罩图片解散bug
    item.type === 'group' &&
    item.objects &&
    item.objects.length === 2 &&
    (item.needDissolve = true)
  })

  state.canvas.setBackgroundColor('#fff')
  state.canvas.loadFromJSON(
    _homejson,
    () => {
      this.commit('refreshCanvas')
      if (!isRedoUndo) {
        this.commit('createMask')
        // this.commit('setShowCanvasLoading', false)
        // this.commit('selectDefaultTxtObject')
        state.zoomScale = state.zoom
      } else {
        state.canvas.setViewportTransform([...state.viewportTransformLast])
        this.commit('zoomCanvas', { scale: state.zoomScale })
      }
      if (type && type === 'firstLoad') {
        state.canvas.forEachObject((item) => {
          if (item) {
            // this.commit('clipPathSetObjectCaching', { activeObject: v })
            const startTime = new Date().getTime()
            const interval = setInterval(() => {
              if (new Date().getTime() - startTime > 3000) {
                clearInterval(interval)
                setTimeout(() => {
                  if (item.type === 'textbox' || item.type === 'image') {
                    item.backgroundColor = `rgba(0, 0, 0, 0)`
                    state.canvas.renderAll()
                  }
                }, 200)
                return
              }
              activeText(state, item)
            }, 600)
            item.setCoords()
          }
        }, state.canvas)
      }
    },
    (o, item) => {
      fabric.Object.prototype.set({
        borderDashArray: [2 / state.zoom, 3 / state.zoom]
      })
      if (item.stype === 'imageMask') {
        cloneClipInit(state, item)
      }
    }
  )
  state.canvas.renderAll()
}
function activeText(state, item) {
  const colorRga = 'rgba(255, 0, 0, '
  if (item.type === 'textbox' || item.type === 'image') {
    if (item.backgroundColor === `${colorRga}0.25)`) {
      animate({
        duration: 500,
        timing(timeFraction) {
          return timeFraction
        },
        draw(progress) {
          item.backgroundColor = `${colorRga}${0.25 - (progress / 4)})`
          state.canvas.renderAll()
        }
      })
    } else {
      animate({
        duration: 500,
        timing(timeFraction) {
          return timeFraction
        },
        draw(progress) {
          item.backgroundColor = `${colorRga}${progress / 4})`
          state.canvas.renderAll()
        }
      })
    }
  }
}

function refreshCanvas(state, obj) {
  state.currentWidth = $(window).width()
  state.currentHeight = $(window).height() - 86
  if (state.canvas) {
    const _oldX = state.arrX[0]
    const _oldY = state.arrY[0]
    //  state.canvas.setWidth 这个方法有问题，在1080以外分辨率无法准确设置 canvas width height，需手动设置
    if (obj) {
      state.canvas.setWidth(obj.currentWidth)
      state.canvas.setHeight(obj.currentHeight)
      state.canvas.calcOffset()
      this.commit('setXY', obj)
    } else {
      state.canvas.setWidth(state.currentWidth)
      state.canvas.setHeight(state.currentHeight)
      state.canvas.calcOffset()
      this.commit('setXY')
    }

    state.canvas.forEachObject((v) => {
      if (v) {
        v.left += state.arrX[0] - _oldX + state.pannelOffsetX
        v.top += state.arrY[0] - _oldY + state.pannelOffsetY
        // state.canvas.remove(state.maskPath)
        // state.canvas.remove(state.groupLines)
        v.setCoords()
      }
    }, state.canvas)

    this.commit('createMask')
    // this.commit('addGrid')

    state.canvas.renderAll()
  } else {
    $('#canvas')
      .attr('width', state.currentWidth)
      .attr('height', state.currentHeight)
  }

  if ($('.canvas-container').length > 0) {
    $('.canvas-container').css('height', this.currentHeight)
  }
}
function initialMouseDownEvent(state, { activeObject, from }) {
  state.shapeTool = state.mainTool = state.imageTool = state.tableTool = state.textTool = state.groupTool = false
  state.activeObject = activeObject
  state._angle = activeObject.angle
  state.colorBorder = activeObject.stroke || ''
  state.strokeWidth = activeObject.strokeWidth || 0
  state.colorFill = activeObject.fill || ''
  state.colorBg = activeObject.backgroundColor || ''
  handleObjtype({ state, activeObject, from })
}
function handleObjtype({ state, activeObject, from }) {
  if (
    activeObject.type === 'activeSelection' ||
    activeObject.type === 'group'
  ) {
    state.groupTool = true
  }
  if (
    (activeObject.type === 'rect' ||
      activeObject.type === 'circle' ||
      activeObject.type === 'path' ||
      activeObject.type === 'polygon') &&
    activeObject.stype !== 'imageMask'
  ) {
    state.shapeTool = true
    state.colorFill = activeObject.fill
  }

  // const isDesigner = getRoles() && getRoles().indexOf('designer') > -1

  if (activeObject.type === 'textbox') {
    state.textTool = true

    // from !== 'leftSide' &&
    //   !isDesigner &&
    //   state.isTabSelect &&
    //   (state.activeSide = 'Txt')
  }

  if (
    (activeObject.type === 'image' || activeObject.stype === 'imageMask') &&
    activeObject.stype !== 'imageTable'
  ) {
    state.imageTool = true
    // from !== 'leftSide' && !isDesigner && (state.activeSide = 'Material')
  }
  if (activeObject.stype === 'imageTable') {
    state.tableTool = true
  }
}

function loadFont(fontList, familyName) {
  // default font SimHei
  let fontFamilyName = 'SimHei'
  let fontItem = null

  for (const item of fontList) {
    if (
      item.fontName === familyName ||
      item.family === familyName ||
      item.name === familyName ||
      item.alias === familyName ||
      item.alias2 === familyName
    ) {
      fontFamilyName = item.fontName || item.family || item.name
      fontItem = item
      break
    }
  }

  if (fontItem) {
    renderFontCss(fontItem)
  } else {
    renderFontCss({
      id: '016',
      enable: 1,
      title: '黑体',
      name: 'SimHei',
      src: 'simhei.woff',
      preload: 1
    })
  }

  return fontFamilyName
}
function replay(state, type) {
  state.viewportTransformLast = state.canvas.viewportTransform
  if (type === 'redo') {
    if (state.redo.length < 1) {
      return
    }
    state.undo.push(state.undoRedoState)
    state.undoRedoState = state.redo.pop()
  } else {
    if (state.undo.length < 1) {
      return
    }
    state.redo.push(state.undoRedoState)

    state.undoRedoState = state.undo.pop()
  }
  this.commit('loadJson', {
    json: state.undoRedoState,
    isRedoUndo: true
  })
}
function renderFontCss(item) {
  const fontName = item.fontName || item.family || item.name
  const nodeList = document.querySelectorAll(`style#font${item.id}`)

  if (nodeList.length < 1) {
    const url = `https://static.bslong.cn/font/${item.src}`

    const sourceString = item.src || ''
    const fontSource = sourceString.split('?')[0]
    const fontType = fontSource.replace(/.+\./, '').toLowerCase()

    const fontFormat = FONT_FORMAT[fontType]
    const format = fontFormat ? `format('${fontFormat}')` : ''
    const fontStyleText = `@font-face {font-family: "${fontName}"; src: url("${url}") ${format}};`

    const fontStyle = document.createElement('style')

    fontStyle.setAttribute('id', `font${item.id}`)
    fontStyle.appendChild(document.createTextNode(fontStyleText))

    document.head.appendChild(fontStyle)
  }
}
function saveJson(state) {
  state.redo = []
  if (state.undoRedoState) {
    state.undo.push(state.undoRedoState)
  }

  const jsonStr = JSON.stringify(state.canvas.toJSON(state.toJSONProperties))
  const jsonObj = JSON.parse(jsonStr)

  jsonObj.width = state.pannelW
  jsonObj.height = state.pannelH
  jsonObj.svgScale = state.svgScale
  jsonObj.cropPoint = state.cropPoint
  jsonObj.objects.forEach((v) => {
    v.left = v.left - state.arrX[0]
    v.top = v.top - state.arrY[0]
    if (v.info && v.info.clipClone) {
      v.info.clipClone.left -= state.arrX[0]
      v.info.clipClone.top -= state.arrY[0]
      v.info.saved = true
    }
  })

  const json = JSON.stringify(jsonObj)
  state.undoRedoState = json
}
function setXY(state, obj = {}) {
  const w = obj.currentWidth || state.currentWidth
  const h = obj.currentHeight || state.currentHeight

  if (
    state.currentWidth / state.currentHeight >
    state.pannelW / state.pannelH
  ) {
    const height = h - state.padding
    state.zoom = height / state.pannelH
    this.commit('zoomCanvas')
    const x2 = 0
    const y2 = 0

    const y0 = state.padding / state.zoom / 2 + y2
    const y1 = state.pannelH + y0
    const x0 = w / state.zoom / 2 - state.pannelW / 2 + x2
    const x1 = state.pannelW + x0
    state.arrX = [x0, x1, x2, w / state.zoom + x2]
    state.arrY = [y0, y1, y2, h / state.zoom + y2]
  } else {
    const width = w - state.padding
    state.zoom = width / state.pannelW
    this.commit('zoomCanvas')
    const x2 = 0
    const y2 = 0

    const x0 = state.padding / state.zoom / 2 + x2
    const x1 = state.pannelW + x0
    const y0 = h / state.zoom / 2 - state.pannelH / 2 + y2
    const y1 = state.pannelH + y0
    state.arrX = [x0, x1, x2, w / state.zoom]
    state.arrY = [y0, y1, y2, h / state.zoom]
  }
  if (!obj.currentWidth) {
    state.originViewportTransform = state.canvas.viewportTransform
    // console.log(state.originViewportTransform)
  }
}
function setDocumentFontFamily(state, text) {
  if (state.documentFontFamily.indexOf(text.fontFamily) === -1) {
    state.documentFontFamily.push(text.fontFamily)
  }
}
function zoomCanvas(state) {
  state.canvas.zoomToPoint(
    {
      x: 0,
      y: 0
    },
    state.zoom
  )
  this.commit('createMask')
}

export default mutations
