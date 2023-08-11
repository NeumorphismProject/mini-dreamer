// 把 window.location.search 里这样的 '?level=preview&a=123' 字符串转成 json
function parseSearchToJson(search) {
  const json = {}
  const regex = /[?&]([^=]*)=([^=^&]*)/g // 取反匹配
  let match
  let lastMatchStr = null // 记录下最后一次不是 null 的匹配到的字符串，用于判断是否以遗漏的内容
  let lastMatchIndex = null // 记录下最后一次不是 null 的匹配到的索引值，用于判断是否以遗漏的内容
  let hasMatch = false

  // 假设需要配的 search url 是这条：https://app.eventsframe.com/app/event/5592600260116480?abc=123&name=Ernest&e=
  // 那么每次 regex.exec(search) 得到的 match 是这样的，直到匹配不到的，那么  regex.exec(search) 得到的则是 null
  // ['?abc=123', 'abc', '123', index: 54, input: 'https://app.eventsframe.com/app/event/5592600260116480?abc=123&name=Ernest&e=', groups: undefined]
  while (match = regex.exec(search)) {
    json[match[1]] = match[2]
    // 记录下最后一次不是 null 的匹配到的索引值(里的索引值是匹配到的字符串的第一个字符的索引，比如匹配的是'?abc=123'的话，那就是'?'这个字符的索引)
    lastMatchStr = match[0]
    lastMatchIndex = match.index
    if (!hasMatch) hasMatch = true
  }

  // 如果最后匹配到的字符串长度与原始字符串search的长度不同，则说明有遗漏的内容，则通过 slice 去匹配完整
  let sliceIndex = null
  let jsonKey = null
  if (lastMatchStr && lastMatchIndex && (sliceIndex = (lastMatchStr.length + lastMatchIndex)) !== search.length && !!(jsonKey = search.slice(sliceIndex + 1))) {
    json[search.slice(sliceIndex + 1)] = ''
  }

  return hasMatch ? json : null
}

// 获取json格式的把 window.location.search
function getRouteQuery() {
  return parseSearchToJson(window.location.search)
}

// 获取网站原始url等信息
function getFullOriginPath() {
  const { origin, pathname } = window.location
  return `${origin}${pathname}`
}