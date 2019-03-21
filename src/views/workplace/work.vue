<template>
  <div>
    <div class="bslc-header">
      <div
        :class="undo.length > 0 ?'':'disabled'"
        class="tool-btn undo"
        @click="replay('undo')">
        <img src="https://img.bslong.cn/wxcanvas/undo.png">
        <span>撤销</span>
      </div>
      <div :class="redo.length > 0 ?'':'disabled'" class="tool-btn redo" @click="replay('redo')">
        <img src="https://img.bslong.cn/wxcanvas/redo.png">
        <span>重做</span>
      </div>
      <div :class="activeObject ? '' : 'disabled'" class="tool-btn copy" @click="copy()">
        <img src="https://img.bslong.cn/wxcanvas/copy.png">
        <span>复制</span>
      </div>
      <div class="save" @click="save()">保存</div>
    </div>
    <div
      :style="`width: ${currentWidth}px; height: ${currentHeight}px;`"
      class="bsl-canvas animated fadeIn delay-2s"
      tabindex="1000"
    >
      <canvas
        id="canvas"
        width="1800"
        height="1600"
      />
    </div>
    <div class="bslc-footer">
      <div v-if="mainTool">
        <div class="tool-btn" @click="addText">
          <img src="https://img.bslong.cn/wxcanvas/add_text.png">
          添加文字
          <i class="el-icon-arrow-down"/>
        </div>
        <div class="centerLine"/>
        <div class="tool-btn">
          <img src="https://img.bslong.cn/wxcanvas/add_image.png">
          添加图片
          <i class="el-icon-arrow-down"/>
          <input type="file" placeholder="" accept="image/*" @change="readURL($event)">
        </div>
      </div>
      <div v-if="textTool">
        <div class="tool-btn" @click="showColorPop">
          <img src="https://img.bslong.cn/wxcanvas/color_font.png">
          字体颜色
          <i class="el-icon-arrow-down"/>
        </div>
        <div class="centerLine"/>
        <div class="tool-btn" @click="showTextPop">
          <img src="https://img.bslong.cn/wxcanvas/text_style.png">
          字样式
          <i class="el-icon-arrow-down"/>
        </div>
      </div>
      <div v-if="imageTool">
        <div class="tool-btn" @click="imgVisible = true">
          <img src="https://img.bslong.cn/wxcanvas/transparency.png">
          透明度
          <i class="el-icon-arrow-down"/>
        </div>
        <div class="centerLine"/>
        <div class="tool-btn" @click="showTextPop">
          <img src="https://img.bslong.cn/wxcanvas/cut.png">
          裁剪图片
          <i class="el-icon-arrow-down"/>
        </div>
      </div>

    </div>
    <mt-popup
      v-model="imgVisible"
      class="mint-popup-4"
      position="bottom">
      <div class="tab-box">
        <div class="tab-header">
          <div class="item">
            <img src="https://img.bslong.cn/wxcanvas/transparency.png" width="20px">
            透明度
          </div>
          <div class="confirm-btn" @click="imgVisible = false">
            确定
          </div>
        </div>
        <div class="tab-body">
          <div class="opacityBox">
            <div class="opacity0">透明</div>
            <mt-range :bar-height="3" :min="0" v-model="opacity" @change="setActiveProp('opacity', opacity / 100)"/>
            <div class="opacity1">不透明</div>
          </div>

        </div>
      </div>
    </mt-popup>
    <mt-popup
      v-model="popupVisible"
      class="mint-popup-4"
      position="bottom">
      <div class="tab-box">
        <div class="tab-header">
          <div class="item active">
            常用颜色
          </div>
          <div class="item">
            自定义颜色
          </div>
          <div class="confirm-btn" @click="popupVisible = false">
            确定
          </div>
        </div>
        <div class="tab-body">
          <div class="line1">
            <div
              v-for="(item, index) in line1"
              :key="index"
              :style="`background: ${item};`"
              :class="{'active': activeObject && activeObject.fill == item}"
              class="colorItem"
              @click="setFontColor(item)">
              <div class="confirmImg"/>
            </div>
          </div>
          <div class="line2">
            <div
              v-for="(item, index) in line2"
              :key="index"
              :style="`background: ${item};`"
              :class="{'active': activeObject && activeObject.fill == item}"
              class="colorItem"
              @click="setFontColor(item)">
              <div class="confirmImg"/>
            </div>
          </div>
        </div>

      </div>
    </mt-popup>
    <mt-popup
      v-model="textVisible"
      class="mint-popup-4"
      position="bottom">
      <div class="tab-box">
        <div class="tab-header">
          <div :class="tabText === 'fam' ? 'active' : ''" class="item" @click="changeTab('fam')">
            字体
          </div>
          <div :class="tabText === 'letter' ? 'active' : ''" class="item" @click="changeTab('letter')">
            字行间距
          </div>
          <div :class="tabText === 'align' ? 'active' : ''" class="item" @click="changeTab('align')">
            对齐方式
          </div>
          <div class="confirm-btn" @click="textVisible = false">
            确定
          </div>
        </div>
        <div class="tab-body">
          <div v-if="tabText === 'fam'" style="height:100%;">
            <mt-swipe :auto="0">
              <mt-swipe-item v-for="(swipe, index) in arrList" :key="index">
                <div class="fontBox">
                  <div
                    v-for="(item, id) in swipe"
                    :key="id * 100"
                    :class="item.name === currentFontFamilySvg ? 'active' : ''"
                    class="item"
                    @click="setFontFamily(item)"
                  >
                    {{ item.svg }}
                  </div>
                </div>
              </mt-swipe-item>
            </mt-swipe>
          </div>
          <div v-if="tabText === 'letter'" style="height:100%;">
            <div class="letBox">
              <div class="label">字间距</div>
              <mt-range :bar-height="3" :min="1" v-model="textSpace" @change="setActiveProp('charSpacing', textSpace*textSpace)"/>
            </div>
            <div class="letBox">
              <div class="label">行间距</div>
              <mt-range :bar-height="3" :min="1" v-model="lineSpace" @change="setActiveProp('lineHeight', lineSpace / 10)"/>
            </div>
          </div>
          <div v-if="tabText === 'align'" style="height:100%;">
            <div class="alignBox">
              <div
                :class="{'active': activeObject.textAlign == 'justify-left' }"
                class="item"
                @click="setActiveProp('textAlign', 'justify-left')"
              >
                <div class="icon alignLeft"/>
                <div class="label">
                  左对齐
                </div>
              </div>
              <div
                :class="{'active': activeObject.textAlign == 'justify-center' }"
                class="item"
                @click="setActiveProp('textAlign', 'justify-center')"
              >
                <div class="icon alignCenter"/>
                <div class="label">
                  居中对齐
                </div>
              </div>
              <div
                :class="{'active': activeObject.textAlign == 'justify-right' }"
                class="item"
                @click="setActiveProp('textAlign', 'justify-right')"
              >
                <div class="icon alignRight"/>
                <div class="label">
                  右对齐
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </mt-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex'
const jsonTest = require('./test.json')
import { SelectFontLists } from '@/fonts/mobileFont.js'
import FontFaceObserver from 'fontfaceobserver'
import mixin from './mixin.js'
import EXIF from 'exif-js'
const wx = window.wx
const FONT_FORMAT = {
  eot: '',
  otf: 'opentype',
  svg: 'svg',
  ttf: 'truetype',
  woff: 'woff',
  woff2: 'woff2'
}

export default {
  mixins: [mixin],
  data() {
    return {
      test: 1,
      popupVisible: false,
      textVisible: false,
      imgVisible: false,
      textSpace: 0,
      lineSpace: 0,
      tabText: 'fam',
      opacity: 100,
      currentFontFamilySvg: '黑体',
      arrList: [],
      line1: [
        'rgb(255, 255, 255)', 'rgb(217, 217, 217)', 'rgb(168, 168, 168)',
        'rgb(126, 126, 126)', 'rgb(108, 108, 108)', 'rgb(42, 42, 42)',
        'rgb(0, 0, 0)', 'rgb(106, 57, 6)', 'rgb(149, 97, 52)',
        'rgb(178, 130, 71)', 'rgb(201, 160, 99)', 'rgb(82, 113, 255)'
      ],
      line2: [
        'rgb(46, 178, 255)', 'rgb(135, 135, 244)', 'rgb(183, 96, 230)',
        'rgb(255, 99, 177)', 'rgb(68, 217, 230)', 'rgb(53, 183, 41)',
        'rgb(102, 221, 153)', 'rgb(153, 226, 101)', 'rgb(255, 249, 82)',
        'rgb(247, 158, 97)', 'rgb(252, 93, 96)'
      ]
    }
  },
  computed: {
    ...mapState({
      canvas: state => state.design.canvas,
      activeObject: state => state.design.activeObject,
      undo: (state) => state.design.undo,
      redo: (state) => state.design.redo,
      mainTool: (state) => state.design.mainTool,
      textTool: (state) => state.design.textTool,
      imageTool: (state) => state.design.imageTool,
      currentWidth: state => state.design.currentWidth,
      currentHeight: state => state.design.currentHeight
    })
  },
  watch: {
    activeObject(activeObject) {
      if (activeObject) {
        this.init(activeObject)
      }
    }
  },
  mounted: function() {
    const that = this
    this.loadJson()
    const allfont = SelectFontLists[0].list
    let count = 0
    function pushArr() {
      const itemArr = []
      for (let i = 0; i < 6; i++) {
        if (count * 6 + i < allfont.length) {
          itemArr.push(allfont[count * 6 + i])
        }
      }
      that.arrList.push(itemArr)
      count++
      if ((count - 1) * 6 + 6 < allfont.length) {
        pushArr()
      }
    }
    pushArr()

    fetch('https://svg2png.bslong.cn/rsx/1', {
      // fetch('http://localhost:3009/rsx/1', {
      method: 'POST',
      headers: {
        Accept: 'application/json;charset=utf-8',
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ url: window.location.href })
    })
      .then(response => {
        // console.log(response.json())
        return response.json()
      })
      .then(data => {
        // console.log(data);
        wx.config({
          debug: false,
          appId: data.appid,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: [
            'chooseImage'
          ]
        })
      })
  },
  methods: {
    init(activeObject) {
      this.textSpace = parseInt(Math.sqrt(activeObject.charSpacing), 10)
      this.lineSpace = activeObject.lineHeight * 10
      this.currentFontFamilySvg = activeObject.fontFamily
      this.opacity = (activeObject.opacity || 1) * 100
    },
    async loadJson() {
      const jsonUrl = this.$route.query.jsonUrl
      const uri = `https://svgfiles.bslong.cn/${jsonUrl}.json`
      this.$store.commit('createCanvas', {
        type: this.$route.name
      })
      this.$store.commit('refreshCanvas')

      // const json1 = JSON.stringify(jsonTest)
      const json = await fetch(uri, { cors: 'no-cors' })
      let content = await json.text() || JSON.stringify(jsonTest)

      const contendData = JSON.parse(content)
      const contentObjects = contendData.objects || []

      if (contentObjects.length > 0) {
        const visibleObjects = contentObjects.filter((item) => {
          return item.visible !== false
        })

        if (visibleObjects.length < contentObjects.length) {
          contendData.objects = visibleObjects
          content = JSON.stringify(contendData)
        }
      }
      this.$store.commit('loadJson', {
        json: content,
        type: 'firstLoad'
      })
    },
    addText({ size = 20, text = '双击编辑文字' }) {
      this.$store.commit('addText', {
        size: size,
        text: text
      })
    },
    changeTab(type) {
      this.tabText = type
    },
    copy() {
      this.$store.commit('copy')
    },
    replay(type) {
      this.$store.commit('replay', type)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    readURL(e) {
      const input = e.target
      const that = this
      let Orientation = null
      if (input.files && input.files[0]) {
        EXIF.getData(input.files[0], function() {
          // alert(EXIF.pretty(this));
          EXIF.getAllTags(this)
          Orientation = EXIF.getTag(input.files[0], 'Orientation')
        })

        const reader = new FileReader()
        reader.onload = function(e) {
          const url = e.target.result
          const img = new Image()
          console.log(url)
          img.src = url
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          img.onload = function() {
            const imgInfo = {
              w: img.width / that.svgSc,
              h: img.height / that.svgSc
            }
            canvas.width = img.width
            canvas.height = img.height
            if (img.width < img.height && img.width > 800) {
              canvas.width = 800
              canvas.height = (800 * img.height) / img.width
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            let base64 = null
            if (navigator.userAgent.match(/iphone/i)) {
              if (Orientation !== '' && Orientation !== 1) {
                switch (Orientation) {
                  case 6:
                    that.rotateImg(img, 'left', canvas, imgInfo)
                    break
                  case 8:
                    that.rotateImg(img, 'right', canvas, imgInfo)
                    break
                  case 3:
                    that.rotateImg(img, 'right', canvas, imgInfo)
                    that.rotateImg(img, 'right', canvas, imgInfo)
                    break
                }
              }

              base64 = canvas.toDataURL('image/png', 0.5)
            } else {
              if (Orientation !== '' && Orientation !== 1) {
                switch (Orientation) {
                  case 6:
                    that.rotateImg(img, 'left', canvas, imgInfo)
                    break
                  case 8:
                    that.rotateImg(img, 'right', canvas, imgInfo)
                    break
                  case 3:
                    that.rotateImg(img, 'right', canvas, imgInfo)
                    that.rotateImg(img, 'right', canvas, imgInfo)
                    break
                }
              }

              base64 = canvas.toDataURL('image/png', 0.8)
            }
            that.$store.commit('addImage', {
              url: base64
            })
          }
        }
        reader.readAsDataURL(input.files[0])
      }
    },
    rotateImg(img, direction, canvas, imgInfo) {
      var min_step = 0
      var max_step = 3
      if (img == null) return
      var width = img.width
      var height = img.height
      //
      if (img.width < img.height && img.width > 800) {
        width = 800
        height = (800 * img.height) / img.width
      } else if (img.height > 800) {
        height = 800
        width = (800 * img.width) / img.height
      }

      var step = 2
      if (step == null) {
        step = min_step
      }
      if (direction === 'right') {
        step++
        step > max_step && (step = min_step)
      } else {
        step--
        step < min_step && (step = max_step)
      }

      var degree = (step * 90 * Math.PI) / 180
      var ctx = canvas.getContext('2d')
      switch (step) {
        case 0:
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0)
          break
        case 1:
        {
          ctx.drawImage(img, 0, 0, width, height)
          canvas.width = height
          canvas.height = width
          const _w = imgInfo.w
          imgInfo.w = imgInfo.h
          imgInfo.h = _w

          ctx.rotate(degree)
          ctx.drawImage(img, 0, -height, width, height)
          break
        }
        case 2:
          canvas.width = width
          canvas.height = height
          ctx.rotate(degree)
          ctx.drawImage(img, -width, -height, width, height)
          break
        case 3:
        {
          canvas.width = height
          canvas.height = width
          const _w1 = imgInfo.w
          imgInfo.w = imgInfo.h
          imgInfo.h = _w1
          ctx.rotate(degree)
          ctx.drawImage(img, -width, 0, width, height)
          break
        }
      }
    },
    save() {
      this.$store.dispatch('uploadOSS').then((key) => {
        wx.miniProgram.navigateTo({
          url: `./savePage?img=https://svgfiles.bslong.cn/${key}.png`
        });
      })
    },
    showColorPop() {
      this.popupVisible = true
    },
    showTextPop() {
      this.textVisible = true
    },
    setFontColor(color) {
      this.setActiveStyle({
        styleName: 'fill',
        value: color
      })
      this.canvas.renderAll()
    },
    setFontFamily(item) {
      const fontName = item.name
      const that = this

      let font = null
      let fontStyleText = ''
      this.currentFontFamilySvg = item.name

      if (document.querySelectorAll('style#' + item.id).length < 1) {
        const url = `https://static.bslong.cn/font/${item.src}`

        const sourceString = item.src || ''
        const fontSource = sourceString.split('?')[0]
        const fontType = fontSource.replace(/.+\./, '').toLowerCase()

        const fontFormat = FONT_FORMAT[fontType]
        const format = fontFormat ? `format('${fontFormat}')` : ''

        fontStyleText = `@font-face {font-family: "${fontName}"; src: url("${url}") ${format};}`
      }

      // console.log(fontName, 'is is loading.', new Date().valueOf())
      font = new FontFaceObserver(item.name)
      const fontStyle = document.createElement('style')
      fontStyle.setAttribute('id', item.id)

      fontStyle.appendChild(document.createTextNode(fontStyleText))

      document.head.appendChild(fontStyle)
      font.load('ABC123').then(
        function() {
          setTimeout(() => {
            that.setActiveStyle({
              styleName: 'fontFamily',
              value: item.name,
              noModified: false
            })
            that.canvas.requestRenderAll()
          }, 100)
        },
        function() {
          console.log(fontName, 'has been loaded failure.')
          setTimeout(() => {
            that.setActiveStyle({
              styleName: 'fontFamily',
              value: item.name,
              noModified: false
            })
            that.canvas.requestRenderAll()
          }, 100)
        }
      )
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
  .bslc-header{
    height:40px;
  }
  .bslc-header{
    height: 40px;
    background: #F7F7F7;
    padding: 0 19px;
    color:#525C62;
    font-size: 12px;

    .tool-btn{
      display: inline-block;
      line-height: 40px;
      margin-right: 27px;
      position: relative;
      img{
        width:15px;
        margin-right: 5px;
        float:left;
        margin-top: 12px;
      }
      span{
        float:left;
      }
    }
    .tool-btn.disabled{
      opacity: 0.5;
    }
    .save{
      float: right;
      width:61px;
      height:25px;
      color: #ffffff;
      border-radius: 30px;
      background: #6757F3;
      text-align: center;
      line-height: 25px;
      margin-top: 7px;
    }
  }
  .bslc-footer{
    height:46px;
    line-height: 46px;
    position: fixed;
    width: 100%;
    left:0px;
    bottom: 0px;
    font-size: 14px;
    .centerLine{
      height:19px;
      width:1px;
      border-right: 1px solid #ddd;
      position: absolute;
      left:50%;
      top:14px;
    }
    .tool-btn{
      width:50%;
      float:left;
      text-align: center;
      position: relative;
      img{
        vertical-align: middle;
        height: 16px;
      }
      input{
        position: absolute;
        opacity: 0;
        width: 100%;
        left: 0px;
        height: 100%;
      }
    }
  }
  .tab-box{
    height: 141px;
    background: #ffffff;
    font-size: 12px;
    .tab-header{
      height:46px;
      .item{
        float: left;
        line-height: 38px;
        padding: 0 20px;
        margin-left: 18px;
        margin-right: -18px;
        margin-top: 4px;
        img{
          width: 14px;
          float: left;
          margin-top: 12px;
          margin-right: 8px;
        }
      }
      .item.active{
        color:#6757F3;
        border-bottom: 4px solid #6757F3;
      }
    }
    .tab-body{
      background: #EBEEF5;
      width: 100%;
      height: 95px;
      padding: 12px 19px;
      padding-bottom: 0px;
      overflow-y: hidden;
      overflow-x: scroll;
      white-space: nowrap;
      .line2{
        padding-left: 23px;
      }
      .colorItem{
        width:30px;
        height:30px;
        border-radius: 50%;
        background: #409EFF;
        margin-right: 10px;
        margin-bottom: 10px;
        display: inline-block;
        position:relative;
        .confirmImg{
          display: none;
          width: 100%;
          height: 100%;
          background: url("https://img.bslong.cn/wxcanvas/onclick2.png");
          background-size:contain;
        }
      }
      .colorItem.active{
        .confirmImg{
          display: block;
        }
      }
      .blankItem{
        width: 23px;
        height: 10px;
        float: left;
      }
    }
    .confirm-btn{
      float: right;
      background: #6757F3;
      color: #fff;
      padding: 5px 15px;
      margin-top: 11px;
      margin-right: 12px;
      border-radius: 20px;
    }
  }
  .mint-popup-4{
    width:100%;
  }
  .v-modal {
    opacity: 0;
  }
  .fontBox{
    width:100%;
    height:71px;
    background: #EBEEF5;
    .item{
      font-size: 12px;
      width:30%;
      text-align: center;
      border-radius: 3px;
      padding: 8px 0px;
      float: left;
      margin-left: 3%;
      margin-bottom: 10px;
    }
    .item.active{
      color: #6757F3;
      background: #ddd;
    }
  }
  .mint-swipe-indicators{
    bottom:3px;
  }
  .mint-swipe-indicator.is-active {
    background: #6757F3;
    opacity: 1;
  }
  .opacityBox{
    margin-top: 10px;
    .opacity0{
      float:left;
      width:10%;
      margin-top: 20px;
    }
    .opacity1{
      float:left;
      width:10%;
      margin-top: 20px;
    }
    .mt-range{
      float:left;
      margin-top: 10px;
      width:80%;
    }
  }
  .letBox{
    width: 49%;
    float:left;
    .label{
      color: #525C62;
      padding: 10px 0px;
    }
    .mt-range{
      width:80%;
    }
  }
  .mt-range-progress{
    background: #6757F3;
  }
  .mt-range-thumb{
    border: 2px solid #6757f3;
    width: 25px;
    height: 25px;
    top: 3px;
  }
  .mt-range-runway{
    right: -20px;
  }
  .alignBox{
    width:230px;
    display: flex;
    color:#8896A2;
    font-size: 10px;
    margin: auto;
    margin-top: 10px;
    .item{
      flex:1;
      .icon{
        width:35px;
        height:35px;
        border-radius: 4px;
        background-size: 70%;
        background-position: center;
        background-repeat: no-repeat;
        margin: auto;
      }
      .alignLeft{
        background-image: url("https://img.bslong.cn/wxcanvas/left.png");
      }
      .alignCenter{
        background-image: url("https://img.bslong.cn/wxcanvas/middle.png");
      }
      .alignRight{
        background-image: url("https://img.bslong.cn/wxcanvas/right.png");
      }
      .label{
        margin-top: 10px;
        text-align: center;
      }
    }
    .item.active{
      color: #6757F3;
      .icon{
        color: #d0d4dc;
      }
      .alignLeft{
        background-image: url("https://img.bslong.cn/wxcanvas/left_on.png");
      }
      .alignCenter{
        background-image: url("https://img.bslong.cn/wxcanvas/middle_on.png");
      }
      .alignRight{
        background-image: url("https://img.bslong.cn/wxcanvas/right_on.png");
      }
    }
  }
  textarea{
    background: #DEE2E6;
    border: 0;
    padding: 8px;
  }

</style>

