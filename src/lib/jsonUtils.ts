/**
 * 判断字符串是否为有效的 JSON
 * @param str 待检测的字符串
 * @returns 是否为有效 JSON
 */
export function isValidJson(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * 尝试解析 JSON 字符串
 * @param str 待解析的字符串
 * @returns 解析后的对象，如果失败返回原字符串
 */
export function tryParseJson<T = unknown>(str: string): T | string {
  if (!str || typeof str !== 'string') return str;
  try {
    return JSON.parse(str) as T;
  } catch {
    return str;
  }
}

/**
 * 格式化 JSON 字符串
 * @param str JSON 字符串或普通字符串
 * @param indent 缩进空格数
 * @returns 格式化后的字符串
 */
export function formatJsonString(str: string, indent: number = 2): string {
  if (!str || typeof str !== 'string') return str;
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed, null, indent);
  } catch {
    return str;
  }
}

/**
 * 检查字符串是否看起来像 JSON（以 { 或 [ 开头）
 * @param str 待检测的字符串
 * @returns 是否看起来像 JSON
 */
export function looksLikeJson(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}
