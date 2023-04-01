const express = require('express')
const PORT = 9091
const uploader = require('express-fileupload') // 解析文件上传
const cors = require('cors') // 解决跨域
const {extname, resolve} = require('path')
const {existsSync, writeFileSync, appendFileSync} = require('fs')
const app = express()


app.use(express.json()) // 解析 json 数据
app.use(express.urlencoded({extended: false})) // 解析 x-www-form-urlencoded 数据
app.use(cors()) //  解决跨域
app.use(uploader()) // 解析文件上传
app.use('/', express.static(resolve(__dirname, 'upload_temp')))  // 静态资源

const UPLOAD_INFO = {
  'UPLOADING': '上传中...',
  'SUCCESS': '上传成功',
  'ERROR': '上传失败',
  'FILE_NO': '上传文件不能为空',
  'FILE_TYPE_ERROR': '不支持的视频格式',
  'NOT_FOUND': '文件不存在',
  'FILE_CREATEED': '文件已创建',
  'APPENDING_FILES': '正在追加文件'
}

const ALLOWED_TYPE = {
  'video/mp4': 'mp4',
  'video/ogg': 'ogg',
}

const BASE_URL = 'http://127.0.0.1:9091/'

app.post('/upload_video', (req, res) => {
  const {
    name,
    type,
    size,
    fileName,
    uploadedSize,
  } = req.body

  const {file} = req.files

  if (!req.files) {
    return res.send({
      code: 400,
      msg: UPLOAD_INFO['FILE_NO'],
      data: null
    })
  }
  if (!ALLOWED_TYPE[type]) {
    return res.send({
      code: 400,
      msg: UPLOAD_INFO['FILE_TYPE_ERROR'],
      data: null
    })
  }

  const newFileName = fileName + extname(name)
  const filePath = resolve(__dirname, 'upload_temp', newFileName)

  if (uploadedSize !== '0') {
    if (!existsSync(filePath)) {
      return res.send({
        code: 400,
        msg: UPLOAD_INFO['NOT_FOUND'],
        data: null
      })
    }
    appendFileSync(filePath, file.data)
    return res.send({
      code: 200,
      msg: UPLOAD_INFO['APPENDING_FILES'],
      data: {
        video_url: BASE_URL + newFileName // 返回视频地址
      }
    })
  }
  writeFileSync(filePath, file.data)

  res.send({
    code: 200,
    msg: UPLOAD_INFO['FILE_CREATEED'],
    data: null
  })

})

app.listen(PORT, () => {
  console.log(`端口启动在 ${PORT}`)
})
