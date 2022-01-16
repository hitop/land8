/* 一些关于字符操作的基础函数
** Author: http://t.me/elecV2
**/

function sType(obj) {
  if (typeof obj !== 'object') {
    return typeof obj
  }
  return Object.prototype.toString.call(obj).slice(8, -1).toLocaleLowerCase()
}

/**
 * JSON 化输入值，成功返回 JSON 化后的值，不可转化则返回 false
 * @param     {String}     str      需要转化的变量
 * @param     {Boolean}    force    强制转化为 JSON 返回。结果为 { 0: str }
 * @return    {Object}     返回 JSON object 或者 false
 */
function sJson(str, force=false) {
  if (!str) {
    return force ? Object.create(null) : false
  }
  let type = sType(str)
  switch (type) {
  case 'array':
  case 'object':
    return str
  case 'set':
    return Array.from(str)
  case 'map':
    return Array.from(str).reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {})
  }
  try {
    let jobj = JSON.parse(str)
    if (typeof(jobj) === 'object') {
      return jobj
    }
  } catch(e) {
    try {
      let obj = (new Function("return " + str))();
      if (/^(object|array)$/.test(sType(obj))) {
        return obj
      }
    } catch(e) {}
  }
  if (force) {
    return { 0: str }
  }
  return false
}

function sString(obj) {
  if (obj === undefined || obj === null) {
    return ''
  }
  let type = sType(obj)
  switch (type) {
  case 'string':
    return obj.trim()
  case 'map':
  case 'set':
    return JSON.stringify({
      dataType: type,
      value: Array.from(obj)
    })
  case 'array':
  case 'object':
    try {
      if (obj[Symbol.toPrimitive]) {
        return String(obj[Symbol.toPrimitive]())
      }
      return JSON.stringify(obj)
    } catch(e) {
      return e.message
    }
  default:
    return String(obj).trim()
  }
}

function sBool(val) {
  if (!val) {
    return false
  }
  if (typeof val === 'boolean') {
    return val
  }
  if (typeof val !== 'string') {
    return true
  }
  val = val.trim()
  switch(val) {
  case '':
  case '0':
  case 'false':
  case 'null':
  case 'undefined':
  case 'NaN':
    return false
  default:
    return true
  }
}

function bEmpty(obj) {
  if (sString(obj).trim() === '' || (/^(object|array)$/.test(sType(obj)) && Object.keys(obj).length === 0)) {
    return true
  }
  return false
}

function sUrl(url){
  try {
    return new URL(url)
  } catch(e) {
    return false
  }
}

function euid(len = 8) {
  // 获取一个随机字符，默认长度为 8, 可自定义
  let b62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let str = b62[Math.floor(Math.random()*52)]
  len--
  while(len--){
    str += b62[Math.floor(Math.random()*62)]
  }
  return str
}

function UUID(){
  let dt = new Date().getTime()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (dt + Math.random()*16)%16 | 0
    dt = Math.floor(dt/16)
    return (c=='x' ? r :(r&0x3|0x8)).toString(16)
  })
}

function iRandom(min, max) {
  if (max === undefined) {
    max = min
    min = 0
  }
  return Math.floor(Math.random()*(max - min + 1)) + min
}

function sTime(time, ms=false){
  const tzoffset = (new Date()).getTimezoneOffset() * 60000
  time = time ? (Number(time) || Date.parse(time)) : Date.now()
  return new Date(time - tzoffset).toISOString().slice(0, ms ? -1 : -5).replace('T', ' ')
}

function logHead(head, alignHeadlen=16) {
  if (head.length === alignHeadlen) return head
  if (head.length < alignHeadlen) {
    let nstr = head.split(' ')
    let space = alignHeadlen - head.length
    while(space--){
      nstr[0] += ' '
    }
    return nstr.join(' ')
  }
  if (head.length > alignHeadlen) {
    const sp = head.split(/\/|\\/)
    if (sp.length > 1) head = sp[0].slice(0,1) + '/' + sp.pop()
    const nstr = head.split(' ').pop()
    return head.slice(0, alignHeadlen-6-nstr.length) + '...' + head.slice(-nstr.length-3)
  }
}

function surlName(url) {
  if (!url) {
    return ''
  }
  let name = ''
  let sdurl = url.split(/\/|\\|\?|#/)
  while (name === '' && sdurl.length) {
    name = sdurl.pop()
  }
  return name
}

const byteToHex = []

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, "0")
  byteToHex.push(hexOctet);
}

function bufferToHex(arrayBuffer, sep = ' ') {
  const buff = new Uint8Array(arrayBuffer)
  const hexOctets = new Array(buff.length)

  for (let i = 0; i < buff.length; ++i) {
    hexOctets[i] = byteToHex[buff[i]]
  }

  return hexOctets.join(sep)
}

function hexToBuffer(hexstr, sep = ' ') {
  let arr = []
  if (sep) {
    arr = hexstr.split(sep)
  } else {
    arr = hexstr.match(/[\dA-F]{2}/gi)
  }
  return new Uint8Array(arr.map(s=>parseInt(s, 16)))
}

function randomColor({ style = 'hex', max = 255 } = {}) {
  switch(style){
  default:
    return '#' + iRandom(max).toString(16).padStart(2, '0') + iRandom(max).toString(16).padStart(2, '0') + iRandom(max).toString(16).padStart(2, '0')
  }
}

export { euid, UUID, iRandom, sJson, sString, sBool, bEmpty, sUrl, sType, sTime, logHead, surlName, bufferToHex, hexToBuffer, randomColor }