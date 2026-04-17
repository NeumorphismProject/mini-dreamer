# 音频素材生成管理系统 API 接口文档 v2.1.0

## 文档信息
- **版本**: v2.1.0
- **更新日期**: 2025-04-17
- **系统**: 音频素材生成管理系统
- **更新内容**: 新增 upload_audio 接口（外部音频URL转存）

## 接口概览

本系统提供完整的音频素材生成、编辑、管理功能，包括：

| 序号 | 接口名称 | 功能描述 |
|------|---------|---------|
| 1 | generate_audio | 生成音频（通过文生图→图生视频→提取音频流程） |
| 2 | edit_audio | 编辑音频（音量调整、淡入淡出、格式转换、剪辑） |
| 3 | upload_audio | 上传音频（将外部音频URL转存到项目对象存储） |
| 4 | move_sound_effect_to_temp | 将音效从正式表移动到临时表 |
| 5 | save_audio | 保存音频（从临时表迁移到正式表） |
| 6 | query_sound_effects | 查询音效列表（支持组合查询和分页，返回关联图片） |
| 7 | query_premium_sound_effects | 查询精品音效列表（支持组合查询和分页，返回关联图片） |
| 8 | move_to_premium_library | 批量转移到精品音效库 |
| 9 | restore_from_premium_library | 批量恢复到音效库 |
| 10 | query_temp_audio | 查询临时音频列表（支持组合查询和分页） |
| 11 | delete_temp_audio | 软删除临时音频 |
| 12 | cleanup_temp_audio | 清理已软删除的临时音频 |
| 13 | retry_cleanup_audio | 重试清理失败的文件 |
| 14 | query_deleted_temp_audio | 查询软删除临时音频列表 |
| 15 | restore_deleted_temp_audio | 恢复软删除临时音频 |
| 16 | query_tags | 查询标签列表（支持组合查询和分页） |
| 17 | create_tag | 创建新标签 |
| 18 | update_tag | 更新标签信息 |
| 19 | soft_delete_tags | 批量软删除标签（只允许删除无关联的标签） |
| 20 | query_deleted_tags | 查询软删除标签列表 |
| 21 | restore_tags | 批量恢复标签 |
| 22 | cleanup_deleted_tags | 清理无关联的软删除标签（最多100条） |
| 23 | query_audio_tags | 查询音频的标签列表 |
| 24 | add_audio_tag | 为音频添加标签（数据库层检查3个限制） |
| 25 | add_audio_tags_batch | 批量为音频添加标签（支持file_name跨3张表） |
| 26 | delete_audio_tag | 删除音频的指定标签 |
| 27 | optimize_prompt_for_audio | 优化音效提示词（用于生成纯净音效） |
| 28 | query_audio_source_image | 查询音频关联的源图片 |
| 29 | query_audio_source_video | 查询音频关联的源视频 |

---

## 1. 生成音频 (generate_audio)

### 接口描述
通过文生图→图生视频→提取音频流程生成音频，生成最纯净的音效，上传到对象存储，并插入临时表。

### 请求参数

```json
{
  "action": "generate_audio",
  "params": {
    "audio_type": "sound_effect",
    "style_type": "清脆",
    "description": "水滴声",
    "file_format": "MP3",
    "duration": 2
  }
}
```

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| audio_type | string | 是 | 音频类型 | sound_effect |
| style_type | string | 否 | 风格类型（支持任意风格描述） | 任意文本（如"清脆"、"科幻"、"复古"、"现代"等），默认：自然 |
| description | string | 是 | 音频描述 | 任意文本 |
| file_format | string | 是 | 文件格式 | MP3、WAV、AAC、FLAC、OGG |
| duration | int | 是 | 时长（秒） | 1-10 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "temp_id": 123,
    "audio_url": "https://example.com/audio.mp3",
    "audio_duration": 2.0,
    "file_size": 102400,
    "file_format": "MP3",
    "style_type": "清脆",
    "description": "水滴声",
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "created_at": "2024-04-16T10:00:00Z",
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://example.com/video.mp4"
  }
}
```

### 功能说明

#### 技术实现流程
1. **文生图**：根据风格类型和描述生成参考图片（512x512，最低分辨率）
2. **图生视频**：基于参考图片生成包含音效的视频（480p分辨率，最低成本）
3. **音频提取**：从视频中提取音频轨道
4. **格式转换**：转换为用户指定的音频格式（MP3/WAV/AAC/FLAC/OGG）
5. **存储与返回**：上传到对象存储，返回音频URL、图片URL、视频URL

#### Prompt设计策略
- **文生图Prompt**："{风格类型}风格的{描述}场景画面，高质量摄影风格"
- **图生视频Prompt**：包含严格音频约束，要求"只生成符合描述的音效，严格禁止添加任何背景音乐、环境音效等无关声音"

#### 时长控制策略 ⚠️
- **问题**：视频生成模型有最小时长限制（推荐5秒）
- **解决**：
  - 如果用户请求时长<5秒 → 视频生成为5秒，然后剪辑音频为用户请求的时长
  - 如果用户请求时长>=5秒 → 视频生成为用户请求的时长
  - 最终音频时长 = 用户请求的时长

#### 音频存储策略
- 用户请求时长<5秒：保存2个音频（原始+剪辑），使用事务处理
- 用户请求时长>=5秒：保存1个音频（完整），不使用事务

#### 文件命名规则
- 原始音频：`se_{style_type}_{timestamp}_{unique_id}_original.{format}`
- 剪辑音频：`se_{style_type}_{timestamp}_{unique_id}_clipped_{duration}s.{format}`
- 完整音频：`se_{style_type}_{timestamp}_{unique_id}.{format}`

#### 媒体资源关联
- 生成音频时，同时保存图片和视频到 media_resources 表
- media_resources 表通过 audio_file_name 字段指向音频表的 file_name（主动关联）
- 音频数据在3张表之间转移时，关联关系自动保持，无需修改转移接口
- 可以通过 query_audio_source_image 和 query_audio_source_video 接口查询关联资源

---

## 2. 编辑音频 (edit_audio)

### 接口描述
批量编辑音频文件，支持音量调整、淡入淡出、音频剪辑、格式转换。

### 请求参数

```json
{
  "action": "edit_audio",
  "params": {
    "audio_list": [
      {
        "audio_url": "https://example.com/audio.mp3",
        "file_name": "se_清脆_1713264000000_abc123.mp3",
        "volume_multiplier": 1.5,
        "fade_in_ms": 100,
        "fade_out_ms": 200,
        "clip_start_time": 0,
        "clip_end_time": 5,
        "output_format": "WAV"
      }
    ]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| audio_url | string | 是 | 原始音频URL |
| file_name | string | 是 | 原始文件名 |
| volume_multiplier | float | 否 | 音量倍数（0.0-5.0），默认1.0 |
| fade_in_ms | int | 否 | 淡入时间（毫秒），默认0 |
| fade_out_ms | int | 否 | 淡出时间（毫秒），默认0 |
| clip_start_time | float | 否 | 剪辑开始时间（秒），默认0 |
| clip_end_time | float | 否 | 剪辑结束时间（秒），默认音频时长 |
| output_format | string | 否 | 输出格式，默认与原格式相同 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "edited_audios": [
      {
        "original_url": "https://example.com/audio.mp3",
        "audio_url": "https://example.com/edited_audio.wav",
        "is_edited": true,
        "edit_params": {
          "volume_multiplier": 1.5,
          "fade_in_ms": 100,
          "fade_out_ms": 200,
          "clip_start_time": 0,
          "clip_end_time": 5,
          "output_format": "WAV"
        },
        "audio_duration": 5.0,
        "file_size": 204800,
        "file_format": "WAV",
        "file_name": "se_清脆_edited_1713264100000_def456.wav",
        "temp_id": 124,
        "created_at": "2024-04-16T10:01:40Z"
      }
    ]
  }
}
```

### 功能说明

#### 核心功能
- **音量调整**：支持 0.0 ~ 5.0 倍音量调整
- **淡入效果**：支持毫秒级淡入效果
- **淡出效果**：支持毫秒级淡出效果
- **格式转换**：支持 MP3、WAV、AAC 格式互转
- **批量编辑**：支持一次编辑多个音频
- **智能优化**：默认值参数直接返回原音频，不进行处理
- **数据关联**：编辑后的音频通过 original_audio_id 关联到原始音频

#### 参数验证规则
- volume_multiplier：0.0 ≤ value ≤ 5.0
- fade_in_ms：0 ≤ value ≤ 音频时长（毫秒）
- fade_out_ms：0 ≤ value ≤ 音频时长（毫秒）- fade_in_ms
- output_format：MP3、WAV、AAC

#### 文件命名规则
`{prefix}_{style_type}_edited_{timestamp}_{unique_id}.{format}`

---

## 3. 上传音频 (upload_audio) 🆕

### 接口描述
将外部音频URL转存到项目对象存储，并记录到临时表。支持自动检测文件格式、生成唯一文件名。

### 请求参数

```json
{
  "action": "upload_audio",
  "params": {
    "audio_url": "https://external-site.com/audio/sound-effect.mp3",
    "audio_type": "sound_effect",
    "style_type": "自然",
    "description": "外部上传的音效"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| audio_url | string | 是 | 外部音频URL | - |
| audio_type | string | 否 | 音频类型 | sound_effect |
| style_type | string | 否 | 风格类型 | 自然 |
| description | string | 否 | 音频描述 | 外部上传音频 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "temp_id": 456,
    "file_name": "se_自然_uploaded_1713264000000_abc12345.mp3",
    "audio_url": "https://project-storage.com/audio-files/sound_effects/202404/se_自然_uploaded_1713264000000_abc12345.mp3?sign=xxx",
    "audio_duration": 5.5,
    "file_size": 204800,
    "file_format": "MP3",
    "style_type": "自然",
    "description": "外部上传的音效",
    "created_at": "2024-04-16T10:00:00"
  }
}
```

### 功能说明

#### 核心功能
- **URL转存**：将外部音频URL下载并转存到项目对象存储
- **格式检测**：自动检测音频格式（优先级：URL扩展名 > Content-Type > moviepy检测）
- **唯一命名**：自动生成唯一文件名，遵循项目命名规范
- **数据库记录**：自动插入 temp_audio_files 临时表

#### 文件命名规则
`{prefix}_{style_type}_uploaded_{timestamp}_{unique_id}.{format}`

- **prefix**：
  - `se`：sound_effect（音效）
  - `bm`：background_music（背景音乐）
- **style_type**：用户指定的风格类型（默认"自然"）
- **timestamp**：Unix时间戳
- **unique_id**：8位唯一ID（UUID前8位）
- **format**：检测到的文件格式（MP3/WAV/AAC/FLAC/OGG）

#### 格式检测策略
1. **优先URL扩展名**：从URL路径提取文件扩展名
2. **其次Content-Type**：从HTTP响应头获取Content-Type判断
3. **最后moviepy检测**：使用moviepy库检测实际音频格式

#### 支持的音频格式
| 格式 | Content-Type |
|------|-------------|
| MP3 | audio/mpeg, audio/mp3 |
| WAV | audio/wav, audio/wave, audio/x-wav |
| AAC | audio/aac, audio/x-aac |
| FLAC | audio/flac, audio/x-flac |
| OGG | audio/ogg, application/ogg |

#### 签名URL有效期
- 生成的签名URL有效期为 **1天**（86400秒）
- 过期后需要重新获取URL

#### 限制说明
- 如果 audio_url 已属于项目对象存储，返回错误提示："文件已存在于项目中，无需重复上传"
- 项目对象存储域名特征：
  - `coze-coding-project.tos`
  - `coze-storage.tos`
  - `coze-coding.tos`

### 错误响应示例

```json
{
  "success": false,
  "data": {
    "error": "文件已存在于项目中，无需重复上传"
  }
}
```

---

## 4. 移动音效到临时表 (move_sound_effect_to_temp)

### 接口描述
将音效从正式表（sound_effects）移动到临时表（temp_audio_files），使用事务处理确保原子性。

### 请求参数

```json
{
  "action": "move_sound_effect_to_temp",
  "params": {
    "id": 456
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 音效ID |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "音效已移动到临时表",
    "temp_id": 124
  }
}
```

### 功能说明
- 使用 PostgreSQL 存储过程实现事务处理
- 移动后音效从 sound_effects 表删除，插入到 temp_audio_files 表
- 数据标记：is_edited 标记为 false，original_audio_id 标记为 NULL

---

## 5. 保存音频 (save_audio)

### 接口描述
调用存储过程，从临时表迁移到正式表（事务处理）。

### 请求参数

```json
{
  "action": "save_audio",
  "params": {
    "temp_id": 123,
    "audio_name": "清脆水滴声",
    "audio_type": "sound_effect",
    "description": "清脆的水滴声效果",
    "tag_ids": "1,2,3"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| temp_id | int | 是 | 临时音频ID |
| audio_name | string | 是 | 音频名称 |
| audio_type | string | 是 | 音频类型 |
| description | string | 否 | 音频描述 |
| tag_ids | string | 否 | 标签ID（逗号分隔） |

### 响应数据

```json
{
  "success": true,
  "data": {
    "id": 456,
    "audio_name": "清脆水滴声",
    "audio_url": "https://example.com/audio.mp3",
    "audio_duration": 2.0,
    "file_size": 102400,
    "file_format": "MP3",
    "style_type": "清脆",
    "description": "清脆的水滴声效果",
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "created_at": "2024-04-16T10:00:00Z",
    "tags": [
      {"id": 1, "tag_name": "水"},
      {"id": 2, "tag_name": "清脆"},
      {"id": 3, "tag_name": "自然"}
    ]
  }
}
```

### 功能说明
- 使用 PostgreSQL 存储过程实现事务处理
- 支持同时添加标签关联
- 已关联的标签会自动跳过，不报错

---

## 6. 查询音效列表 (query_sound_effects)

### 接口描述
查询音效列表，支持组合查询、分页、多标签查询（OR关系），返回关联的图片URL。

### 请求参数

```json
{
  "action": "query_sound_effects",
  "params": {
    "page": 1,
    "page_size": 20,
    "file_name": "水滴",
    "file_format": "MP3",
    "audio_duration_min": 1,
    "audio_duration_max": 5,
    "file_size_min": 10000,
    "file_size_max": 500000,
    "style_type": "清脆",
    "description": "水滴声",
    "update_time_min": "2024-01-01T00:00:00Z",
    "tag_ids": "1,2,3"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |
| file_name | string | 否 | 文件名（模糊查询） |
| file_format | string | 否 | 文件格式 |
| audio_duration_min | float | 否 | 最小时长（秒） |
| audio_duration_max | float | 否 | 最大时长（秒） |
| file_size_min | int | 否 | 最小文件大小（字节） |
| file_size_max | int | 否 | 最大文件大小（字节） |
| style_type | string | 否 | 风格类型 |
| description | string | 否 | 描述（模糊查询） |
| update_time_min | string | 否 | 更新时间最小值（ISO 8601格式） |
| tag_ids | string | 否 | 标签ID（逗号分隔，OR关系） |

### 响应数据

```json
{
  "success": true,
  "data": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "id": 456,
        "file_name": "se_清脆_1713264000000_abc123.mp3",
        "file_format": "MP3",
        "audio_url": "https://example.com/audio.mp3",
        "audio_duration": 2.0,
        "file_size": 102400,
        "style_type": "清脆",
        "description": "清脆的水滴声效果",
        "created_at": "2024-04-16T10:00:00Z",
        "updated_at": "2024-04-16T10:00:00Z",
        "source_image_url": "https://example.com/image.jpg",
        "tags": [
          {"id": 1, "tag_name": "水"},
          {"id": 2, "tag_name": "清脆"}
        ]
      }
    ]
  }
}
```

### 功能说明
- 支持多条件组合查询
- 支持分页查询
- 支持标签OR关系查询
- 返回关联的图片URL（source_image_url）

---

## 7. 查询精品音效列表 (query_premium_sound_effects)

### 接口描述
查询精品音效列表，支持组合查询、分页、多标签查询（OR关系），返回关联的图片URL。

### 请求参数

```json
{
  "action": "query_premium_sound_effects",
  "params": {
    "page": 1,
    "page_size": 20,
    "file_name": "水滴",
    "file_format": "MP3",
    "audio_duration_min": 1,
    "audio_duration_max": 5,
    "file_size_min": 10000,
    "file_size_max": 500000,
    "style_type": "清脆",
    "description": "水滴声",
    "update_time_min": "2024-01-01T00:00:00Z",
    "tag_ids": "1,2,3"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |
| file_name | string | 否 | 文件名（模糊查询） |
| file_format | string | 否 | 文件格式 |
| audio_duration_min | float | 否 | 最小时长（秒） |
| audio_duration_max | float | 否 | 最大时长（秒） |
| file_size_min | int | 否 | 最小文件大小（字节） |
| file_size_max | int | 否 | 最大文件大小（字节） |
| style_type | string | 否 | 风格类型 |
| description | string | 否 | 描述（模糊查询） |
| update_time_min | string | 否 | 更新时间最小值（ISO 8601格式） |
| tag_ids | string | 否 | 标签ID（逗号分隔，OR关系） |

### 响应数据

```json
{
  "success": true,
  "data": {
    "total": 50,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "id": 789,
        "file_name": "se_清脆_1713264000000_abc123.mp3",
        "file_format": "MP3",
        "audio_url": "https://example.com/audio.mp3",
        "audio_duration": 2.0,
        "file_size": 102400,
        "style_type": "清脆",
        "description": "清脆的水滴声效果",
        "created_at": "2024-04-16T10:00:00Z",
        "updated_at": "2024-04-16T10:00:00Z",
        "source_image_url": "https://example.com/image.jpg",
        "tags": [
          {"id": 1, "tag_name": "水"},
          {"id": 2, "tag_name": "清脆"}
        ]
      }
    ]
  }
}
```

### 功能说明
- 支持多条件组合查询
- 支持分页查询
- 支持标签OR关系查询
- 返回关联的图片URL（source_image_url）

---

## 8. 批量转移到精品音效库 (move_to_premium_library)

### 接口描述
从音效库批量转移音效到精品音效库，使用事务处理。

### 请求参数

```json
{
  "action": "move_to_premium_library",
  "params": {
    "ids": [456, 457, 458]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 音效ID列表 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "批量转移完成",
    "total_count": 3,
    "moved_count": 3,
    "failed_count": 0,
    "details": [
      {"id": 456, "status": "success"},
      {"id": 457, "status": "success"},
      {"id": 458, "status": "success"}
    ]
  }
}
```

### 功能说明
- 使用事务处理确保原子性
- 转移后音效从 sound_effects 表删除，插入到 premium_sound_effects 表

---

## 9. 批量恢复到音效库 (restore_from_premium_library)

### 接口描述
从精品音效库批量恢复音效到音效库，使用事务处理。

### 请求参数

```json
{
  "action": "restore_from_premium_library",
  "params": {
    "ids": [789, 790, 791]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 精品音效ID列表 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "批量恢复完成",
    "total_count": 3,
    "restored_count": 3,
    "failed_count": 0,
    "details": [
      {"id": 789, "status": "success"},
      {"id": 790, "status": "success"},
      {"id": 791, "status": "success"}
    ]
  }
}
```

### 功能说明
- 使用事务处理确保原子性
- 恢复后音效从 premium_sound_effects 表删除，插入到 sound_effects 表

---

## 10. 查询临时音频列表 (query_temp_audio)

### 接口描述
查询临时音频列表，支持组合查询和分页，返回关联的图片URL。

### 请求参数

```json
{
  "action": "query_temp_audio",
  "params": {
    "page": 1,
    "page_size": 20,
    "file_name": "水滴",
    "file_format": "MP3",
    "audio_duration_min": 1,
    "audio_duration_max": 5,
    "file_size_min": 10000,
    "file_size_max": 500000,
    "style_type": "清脆",
    "description": "水滴声",
    "created_at_min": "2024-01-01T00:00:00Z"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |
| file_name | string | 否 | 文件名（模糊查询） |
| file_format | string | 否 | 文件格式 |
| audio_duration_min | float | 否 | 最小时长（秒） |
| audio_duration_max | float | 否 | 最大时长（秒） |
| file_size_min | int | 否 | 最小文件大小（字节） |
| file_size_max | int | 否 | 最大文件大小（字节） |
| style_type | string | 否 | 风格类型 |
| description | string | 否 | 描述（模糊查询） |
| created_at_min | string | 否 | 创建时间最小值（ISO 8601格式） |

### 响应数据

```json
{
  "success": true,
  "data": {
    "total": 50,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "id": 123,
        "file_name": "se_清脆_1713264000000_abc123.mp3",
        "file_format": "MP3",
        "audio_url": "https://example.com/audio.mp3",
        "audio_duration": 2.0,
        "file_size": 102400,
        "style_type": "清脆",
        "description": "清脆的水滴声效果",
        "created_at": "2024-04-16T10:00:00Z",
        "updated_at": "2024-04-16T10:00:00Z",
        "source_image_url": "https://example.com/image.jpg"
      }
    ]
  }
}
```

### 功能说明
- 支持多条件组合查询
- 支持分页查询
- 只查询未软删除的临时音频
- 返回关联的图片URL（source_image_url）

---

## 11. 软删除临时音频 (delete_temp_audio)

### 接口描述
软删除临时音频，标记为已删除，不删除实际文件。

### 请求参数

```json
{
  "action": "delete_temp_audio",
  "params": {
    "temp_ids": [123, 124, 125]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| temp_ids | array | 是 | 临时音频ID列表 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "软删除完成",
    "marked_count": 3,
    "details": [
      {"id": 123, "status": "success"},
      {"id": 124, "status": "success"},
      {"id": 125, "status": "success"}
    ]
  }
}
```

### 功能说明
- 只标记 is_deleted 为 true，不删除实际文件
- 可以通过 restore_deleted_temp_audio 接口恢复

---

## 12. 清理临时音频 (cleanup_temp_audio)

### 接口描述
清理已软删除的临时音频，删除对象存储中的文件和数据库记录。

### 请求参数

```json
{
  "action": "cleanup_temp_audio",
  "params": {
    "limit": 10
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | int | 否 | 限制清理数量，默认10 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "清理完成",
    "total_checked": 10,
    "deleted_count": 10,
    "failed_count": 0,
    "failed_details": []
  }
}
```

### 功能说明
- 删除对象存储中的音频文件
- 删除数据库中的记录
- 返回清理详情

---

## 13. 重试清理音频 (retry_cleanup_audio)

### 接口描述
重试清理失败的文件。

### 请求参数

```json
{
  "action": "retry_cleanup_audio",
  "params": {
    "file_urls": [
      "https://example.com/audio1.mp3",
      "https://example.com/audio2.mp3"
    ]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file_urls | array | 是 | 对象存储文件URL列表 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "重试清理完成",
    "total_checked": 2,
    "deleted_count": 2,
    "failed_count": 0,
    "failed_details": []
  }
}
```

### 功能说明
- 重新尝试删除对象存储中的文件
- 返回清理详情

---

## 14. 查询软删除临时音频 (query_deleted_temp_audio)

### 接口描述
查询软删除临时音频列表，支持分页和组合查询。

### 请求参数

```json
{
  "action": "query_deleted_temp_audio",
  "params": {
    "page": 1,
    "page_size": 20,
    "file_name": "水滴",
    "description": "水滴声"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |
| file_name | string | 否 | 文件名（模糊查询） |
| description | string | 否 | 描述（模糊查询） |

### 响应数据

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "id": 123,
        "file_name": "se_清脆_1713264000000_abc123.mp3",
        "audio_url": "https://example.com/audio.mp3",
        "audio_duration": 2.0,
        "file_size": 102400,
        "description": "清脆的水滴声效果",
        "created_at": "2024-04-16T10:00:00Z",
        "deleted_at": "2024-04-16T11:00:00Z"
      }
    ]
  }
}
```

### 功能说明
- 只查询已软删除的临时音频
- 可以通过 restore_deleted_temp_audio 接口恢复

---

## 15. 恢复软删除临时音频 (restore_deleted_temp_audio)

### 接口描述
恢复软删除的临时音频，撤销软删除操作。

### 请求参数

```json
{
  "action": "restore_deleted_temp_audio",
  "params": {
    "temp_ids": [123, 124, 125]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| temp_ids | array | 是 | 临时音频ID列表 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "恢复完成",
    "restored_count": 3,
    "details": [
      {"id": 123, "status": "success"},
      {"id": 124, "status": "success"},
      {"id": 125, "status": "success"}
    ]
  }
}
```

### 功能说明
- 将 is_deleted 设置为 false
- 清空 deleted_at 字段

---

## 16. 查询标签列表 (query_tags)

### 接口描述
查询标签列表，支持组合查询和分页。

### 请求参数

```json
{
  "action": "query_tags",
  "params": {
    "page": 1,
    "page_size": 20,
    "tag_name": "水"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |
| tag_name | string | 否 | 标签名称（模糊查询） |

### 响应数据

```json
{
  "success": true,
  "data": {
    "total": 10,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "id": 1,
        "tag_name": "水",
        "description": "与水相关的音效",
        "created_at": "2024-04-16T10:00:00Z",
        "updated_at": "2024-04-16T10:00:00Z"
      }
    ]
  }
}
```

### 功能说明
- 只查询未软删除的标签
- 支持分页查询

---

## 17. 创建标签 (create_tag)

### 接口描述
创建新标签。

### 请求参数

```json
{
  "action": "create_tag",
  "params": {
    "tag_name": "水滴",
    "description": "水滴声效果"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| tag_name | string | 是 | 标签名称（唯一） |
| description | string | 否 | 标签描述 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "id": 11,
    "tag_name": "水滴",
    "description": "水滴声效果",
    "created_at": "2024-04-16T10:00:00Z"
  }
}
```

### 功能说明
- 标签名称必须唯一
- 自动设置 created_at 和 updated_at

---

## 18. 更新标签 (update_tag)

### 接口描述
更新标签信息。

### 请求参数

```json
{
  "action": "update_tag",
  "params": {
    "id": 11,
    "tag_name": "水滴声",
    "description": "各种水滴声音效"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 标签ID |
| tag_name | string | 否 | 新标签名称 |
| description | string | 否 | 新标签描述 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "id": 11,
    "tag_name": "水滴声",
    "description": "各种水滴声音效",
    "updated_at": "2024-04-16T11:00:00Z"
  }
}
```

### 功能说明
- 至少提供一个更新字段
- 标签名称不能与其他标签重复

---

## 19. 批量软删除标签 (soft_delete_tags)

### 接口描述
批量软删除标签（只允许删除无关联的标签）。

### 请求参数

```json
{
  "action": "soft_delete_tags",
  "params": {
    "ids": [11, 12, 13]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 标签ID列表 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "软删除完成",
    "deleted_count": 2,
    "failed_count": 1,
    "details": [
      {"id": 11, "status": "success"},
      {"id": 12, "status": "success"},
      {"id": 13, "status": "failed", "reason": "标签关联了音频"}
    ]
  }
}
```

### 功能说明
- 只允许删除无关联的标签
- 标记 is_deleted 为 true，不删除实际记录

---

## 20. 查询软删除标签列表 (query_deleted_tags)

### 接口描述
查询软删除标签列表，支持分页。

### 请求参数

```json
{
  "action": "query_deleted_tags",
  "params": {
    "page": 1,
    "page_size": 20
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "id": 11,
        "tag_name": "水滴声",
        "description": "各种水滴声音效",
        "created_at": "2024-04-16T10:00:00Z",
        "deleted_at": "2024-04-16T12:00:00Z"
      }
    ]
  }
}
```

### 功能说明
- 只查询已软删除的标签

---

## 21. 批量恢复标签 (restore_tags)

### 接口描述
批量恢复软删除的标签。

### 请求参数

```json
{
  "action": "restore_tags",
  "params": {
    "ids": [11, 12]
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 标签ID列表 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "恢复完成",
    "restored_count": 2,
    "details": [
      {"id": 11, "status": "success"},
      {"id": 12, "status": "success"}
    ]
  }
}
```

### 功能说明
- 将 is_deleted 设置为 false
- 清空 deleted_at 字段

---

## 22. 清理软删除标签 (cleanup_deleted_tags)

### 接口描述
清理无关联的软删除标签（最多100条）。

### 请求参数

```json
{
  "action": "cleanup_deleted_tags",
  "params": {}
}
```

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "清理完成",
    "deleted_count": 5
  }
}
```

### 功能说明
- 只删除无关联的软删除标签
- 每次最多清理100条

---

## 23. 查询音频标签列表 (query_audio_tags)

### 接口描述
查询音频的标签列表。

### 请求参数

```json
{
  "action": "query_audio_tags",
  "params": {
    "file_name": "se_清脆_1713264000000_abc123.mp3"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file_name | string | 是 | 音频文件名 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "tags": [
      {"id": 1, "tag_name": "水"},
      {"id": 2, "tag_name": "清脆"}
    ]
  }
}
```

### 功能说明
- 支持跨3张表查询（temp_audio_files、sound_effects、premium_sound_effects）
- 返回所有关联的标签

---

## 24. 为音频添加标签 (add_audio_tag)

### 接口描述
为音频添加标签（数据库层检查3个限制）。

### 请求参数

```json
{
  "action": "add_audio_tag",
  "params": {
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "tag_id": 3
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file_name | string | 是 | 音频文件名 |
| tag_id | int | 是 | 标签ID |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "标签添加成功",
    "tag_id": 3,
    "file_name": "se_清脆_1713264000000_abc123.mp3"
  }
}
```

### 功能说明
- **限制1**：一个音频最多只能关联3个标签
- **限制2**：不能重复添加同一个标签
- **限制3**：不能添加已软删除的标签
- 数据库层实现，使用 PostgreSQL 存储过程

---

## 25. 批量为音频添加标签 (add_audio_tags_batch)

### 接口描述
批量为音频添加标签（支持file_name跨3张表）。

### 请求参数

```json
{
  "action": "add_audio_tags_batch",
  "params": {
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "tag_ids": "1,2,3"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file_name | string | 是 | 音频文件名 |
| tag_ids | string | 是 | 标签ID（逗号分隔） |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "批量添加标签完成",
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "added_tags": [1, 2],
    "skipped_tags": [3],
    "skipped_reasons": {
      "3": "音频已达到标签数量上限（3个）"
    }
  }
}
```

### 功能说明
- 支持跨3张表查询音频（temp_audio_files、sound_effects、premium_sound_effects）
- 已关联的标签会自动跳过，不报错
- 遵循每个音频最多3个标签的限制

---

## 26. 删除音频标签 (delete_audio_tag)

### 接口描述
删除音频的指定标签。

### 请求参数

```json
{
  "action": "delete_audio_tag",
  "params": {
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "tag_id": 3
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file_name | string | 是 | 音频文件名 |
| tag_id | int | 是 | 标签ID |

### 响应数据

```json
{
  "success": true,
  "data": {
    "message": "标签删除成功",
    "file_name": "se_清脆_1713264000000_abc123.mp3",
    "tag_id": 3
  }
}
```

### 功能说明
- 支持跨3张表查询音频
- 删除音频与标签的关联关系

---

## 27. 优化音效提示词 (optimize_prompt_for_audio)

### 接口描述
优化用户输入的音效描述，提取核心声音特征，输出精简的提示词（50字以内）。

### 请求参数

```json
{
  "action": "optimize_prompt_for_audio",
  "params": {
    "description": "老虎叫声"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| description | string | 是 | 原始音效描述 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "original_description": "老虎叫声",
    "optimized_prompt": "老虎低沉浑厚的咆哮，喉咙深处发出，震颤感强，节奏缓慢有力，低频饱满。",
    "character_count": 30
  }
}
```

### 功能说明

#### 优化原则
- **字数限制**：优化后的提示词控制在50字以内
- **只描述声音特征**：所有描述都必须围绕声音本身的物理特性
- **禁止环境描述**：绝对不能描述环境、场景、背景
- **精简明确**：只保留最核心的2-3个声音特征

#### 核心特征维度
- **音调特征**：高音、低音、清脆、浑厚、低沉、明亮等
- **节奏特征**：急促、缓慢、短促、规律、无规律等
- **质感特征**：金属感、液体质感、塑料质感等

#### 绝对禁止项
- ❌ 环境描述（丛林、森林、城市、室内等）
- ❌ 背景元素（树木、建筑、地面等）
- ❌ 光照和天气（阳光、雨天等）
- ❌ 时间描述（早晨、傍晚等）
- ❌ 其他无关物体或生物
- ❌ 场景氛围描述
- ❌ 冗余描述（超过50字）

#### 示例对比

**示例1：老虎叫声**
- **输入**：老虎叫声
- **输出**：老虎低沉浑厚的咆哮，喉咙深处发出，震颤感强，节奏缓慢有力，低频饱满。（30字）

**示例2：水滴声**
- **输入**：水滴声
- **输出**：水滴撞击清脆短促，音调高亮，液体质感通透，发声后快速衰减。（26字）

**示例3：按钮点击**
- **输入**：按钮点击
- **输出**：按钮清脆短促的咔哒声，音调中高，塑料质感，撞击发声后瞬间消失。（28字）

**示例4：长描述精简**
- **输入**：科幻枪械射击发出的声音，带有明亮尖锐的高频电子震颤感，同时混合厚重的低频能量脉冲...（200+字）
- **输出**：科幻枪声，高频电子震颤，低频脉冲，短促干脆，能量爆发后快衰，带金属能量混合质感。（38字）

#### 使用建议
- 适用于将冗长的音效描述精简为AI可理解的核心特征
- 可用于优化用户输入的提示词，提高视频生成效率
- 建议在 generate_audio 接口之前先调用此接口优化描述

---

## 28. 查询音频源图片 (query_audio_source_image)

### 接口描述
根据音频文件名查询关联的源图片。

### 请求参数

```json
{
  "action": "query_audio_source_image",
  "params": {
    "file_name": "se_清脆_1713264000000_abc123.mp3"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file_name | string | 是 | 音频文件名 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "audio_file_name": "se_清脆_1713264000000_abc123.mp3",
    "source_image": {
      "file_name": "img_1713264000000_abc123.jpg",
      "media_type": "image",
      "media_url": "https://example.com/image.jpg",
      "permanent_url": "https://example.com/permanent/image.jpg",
      "created_at": "2024-04-16T10:00:00Z"
    }
  }
}
```

### 功能说明
- 按优先级查询（temp_audio_files → sound_effects → premium_sound_effects）
- 如果音频文件没有关联图片，source_image 为 null
- 返回图片的临时URL和永久URL（如果有）

---

## 29. 查询音频源视频 (query_audio_source_video)

### 接口描述
根据音频文件名查询关联的源视频。

### 请求参数

```json
{
  "action": "query_audio_source_video",
  "params": {
    "file_name": "se_清脆_1713264000000_abc123.mp3"
  }
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file_name | string | 是 | 音频文件名 |

### 响应数据

```json
{
  "success": true,
  "data": {
    "audio_file_name": "se_清脆_1713264000000_abc123.mp3",
    "source_video": {
      "file_name": "video_1713264000000_abc123.mp4",
      "media_type": "video",
      "media_url": "https://example.com/video.mp4",
      "permanent_url": "https://example.com/permanent/video.mp4",
      "created_at": "2024-04-16T10:00:00Z"
    }
  }
}
```

### 功能说明
- 按优先级查询（temp_audio_files → sound_effects → premium_sound_effects）
- 如果音频文件没有关联视频，source_video 为 null
- 返回视频的临时URL和永久URL（如果有）

---

## 风格类型说明

`style_type` 参数支持**任意风格描述**，不限制在预定义列表中。

### 推荐风格类型

系统推荐以下风格类型作为参考：

| 序号 | 风格类型 | 描述 |
|------|---------|------|
| 1 | 清脆 | 声音清晰、明亮、尖锐 |
| 2 | 浑厚 | 声音低沉、厚重、有力 |
| 3 | 尖锐 | 声音刺耳、高频、强烈 |
| 4 | 柔和 | 声音温和、平缓、柔和 |
| 5 | 空灵 | 声音空旷、灵异、飘逸 |
| 6 | 沉重 | 声音沉重、压抑、厚重 |
| 7 | 急促 | 声音快速、紧凑、急躁 |
| 8 | 悠扬 | 声音悠长、连贯、优美 |
| 9 | 机械 | 声音机械、人工、重复 |
| 10 | 自然 | 声音自然、真实、原始 |

### 自定义风格

用户可以传入任意风格描述，例如：
- "科幻" - 未来科技感
- "复古" - 怀旧复古风格
- "现代" - 现代都市风格
- "电子" - 电子合成风格
- "金属" - 金属质感风格
- "水润" - 水滴湿润感
- "爆裂" - 爆炸冲击感

该参数会结合到 AI 提示词中，影响音效生成效果。如果 `style_type` 为空，默认使用"自然"风格。

---

## 音频文件格式列表

系统支持以下5种音频文件格式：

| 序号 | 格式 | 说明 |
|------|------|------|
| 1 | MP3 | 常用压缩音频格式 |
| 2 | WAV | 无损音频格式 |
| 3 | AAC | 高级音频编码格式 |
| 4 | FLAC | 无损音频压缩格式 |
| 5 | OGG | 开源音频格式 |

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 201001 | 参数错误 |
| 201002 | 音频类型错误 |
| 201003 | 值错误 |
| 201004 | 数据库错误 |
| 201005 | 对象存储错误 |
| 201006 | 标签限制（最多3个） |
| 201007 | 标签重复 |
| 201008 | 标签已删除 |
| 201009 | 音频标签关联失败 |
| 201010 | 文件不存在 |

---

## 版本更新日志

### v2.1.0 (2025-04-17)
- **新增**：upload_audio 接口 - 支持将外部音频URL转存到项目对象存储
  - 自动检测文件格式（URL扩展名 > Content-Type > moviepy检测）
  - 自动生成唯一文件名
  - 自动插入临时表
  - 签名URL有效期1天
  - 限制：项目对象存储的URL不能重复上传

### v2.0.0 (2025-04-16)
- **优化**：optimize_prompt_for_audio 接口输出控制在50字以内
- **修复**：generate_audio 接口视频生成超时问题（增加超时时间到600秒）
- **修复**：generate_audio 接口 style_type 参数验证问题（允许任意风格描述）
- **重构**：媒体资源关联架构（media_resources 表通过 audio_file_name 主动关联音频表）
