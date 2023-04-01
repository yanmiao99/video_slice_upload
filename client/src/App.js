import './App.css';
import {useState} from "react";
import axios from "axios";
import md5 from 'js-md5';

function App() {
  const [progressValue, setProgressValue] = useState(0);
  const [progressMax, setProgressMax] = useState(0);
  const [info, setInfo] = useState('');
  const [file, setFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState(null)
  const [uploadDisabled, setUploadDisabled] = useState(false)

  const UPLOAD_INFO = {
    'UPLOADING': '上传中...',
    'SUCCESS': '上传成功',
    'ERROR': '上传失败',
    'FILE_NO': '请选择视频',
    'FILE_TYPE_ERROR': '不支持的视频格式',
  }

  const ALLOWED_TYPE = {
    'video/mp4': 'mp4', 'video/ogg': 'ogg',
  }

  const CHUNK_SIZE = 1024 * 64;

  const BASE_URL = 'http://127.0.0.1:9091'

  const handleUpload = async () => {
    if (!file) {
      setInfo(UPLOAD_INFO['FILE_NO']);
      return;
    }

    if (!ALLOWED_TYPE[file.type]) {
      setInfo(UPLOAD_INFO['FILE_TYPE_ERROR']);
      return;
    }

    const {size, name, type} = file;
    const fileName = md5(name);
    setProgressMax(size);
    setInfo('')
    let uploadedSize = 0;
    let uploadResUrl = null

    while (uploadedSize < size) {
      // 切片
      const fileChunk = file.slice(uploadedSize, uploadedSize + CHUNK_SIZE);
      const formData = createFormData({
        name, type, size, fileName, uploadedSize, file: fileChunk
      });

      // 进行上传操作
      try {
        const res = await axios.post(BASE_URL + '/upload_video', formData)
        if (res.data.code !== 200) {
          setInfo(`${UPLOAD_INFO['ERROR']} (${res.data.msg})`)
          return;
        }
        setUploadDisabled(true)
        setInfo(UPLOAD_INFO['UPLOADING'])
        uploadResUrl = res.data?.data?.video_url
      } catch (e) {
        console.log(e);
        setInfo(`${UPLOAD_INFO['ERROR']} (${e.message})`)
        return;
      }

      // 上传的大小
      uploadedSize += fileChunk.size;
      setProgressValue(uploadedSize)
    }

    // 上传完成
    setInfo(UPLOAD_INFO['SUCCESS']);
    uploadResUrl && setUploadUrl(uploadResUrl)
    setUploadDisabled(false)
  }

  const createFormData = ({name, type, size, fileName, uploadedSize, file}) => {
    const fd = new FormData();
    fd.append('name', name);
    fd.append('type', type);
    fd.append('size', size);
    fd.append('fileName', fileName);
    fd.append('uploadedSize', uploadedSize);
    fd.append('file', file);
    return fd;
  }

  const handleChange = (files) => {
    files[0] && setFile(files[0]);
  }

  return (<div className="App">
    <input type="file" onChange={e => handleChange(e.target.files)}/>
    <br/>
    <progress value={progressValue} max={progressMax}></progress>
    <br/>
    <button onClick={handleUpload} disabled={uploadDisabled}>上传视频</button>
    <p>{info}</p>
    {uploadUrl && <video src={uploadUrl} controls width='300' muted/>}
  </div>);
}

export default App;
