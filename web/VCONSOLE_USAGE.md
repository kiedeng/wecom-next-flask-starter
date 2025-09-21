# vConsole 使用说明

## 概述
vConsole 已经以最简单的方式集成到项目中，支持页面刷新时保留日志。

## 功能特性
- ✅ 自动加载 vConsole 调试工具
- ✅ 支持页面刷新时保留日志
- ✅ 轻量级实现，不影响应用性能
- ✅ 只在客户端加载，避免 SSR 问题

## 使用方法

### 1. 自动加载
vConsole 会在应用启动时自动加载，无需手动操作。

### 2. 查看调试信息
- 在移动端或桌面端打开应用
- 点击右下角的绿色 vConsole 按钮
- 可以查看 Console、Network、Element、Storage 等调试信息

### 3. 日志持久化
- 页面刷新时，vConsole 会自动保留之前的日志
- 日志会定期保存到本地存储
- 支持查看历史调试信息

## 技术实现

### 文件结构
```
web/src/components/VConsole.tsx  # vConsole 组件
web/src/app/layout.tsx           # 在根布局中集成
```

### 核心功能
1. **动态加载**: 使用 `import('vconsole')` 动态加载，避免 SSR 问题
2. **日志持久化**: 通过 localStorage 保存日志时间戳
3. **自动初始化**: 只在客户端且未初始化时加载
4. **内存管理**: 自动清理定时器和事件监听器

### 配置选项
- 默认启用所有插件：system、network、element、storage
- 自动保存日志时间戳
- 定期保存（每10秒）
- 页面卸载时保存

## 开发建议

### 调试技巧
1. **查看网络请求**: 在 Network 标签页查看所有 API 请求
2. **查看控制台日志**: 在 Console 标签页查看所有 console.log 输出
3. **查看元素信息**: 在 Element 标签页查看 DOM 结构
4. **查看存储信息**: 在 Storage 标签页查看 localStorage 和 sessionStorage

### 性能优化
- vConsole 只在开发环境或需要调试时启用
- 生产环境可以通过环境变量控制是否加载
- 日志持久化不会影响应用性能

## 故障排除

### 常见问题
1. **vConsole 不显示**: 检查浏览器控制台是否有错误信息
2. **日志丢失**: 检查 localStorage 是否被清理
3. **性能问题**: 检查是否有大量日志输出

### 调试步骤
1. 打开浏览器开发者工具
2. 查看 Console 是否有 vConsole 相关错误
3. 检查 Network 标签页确认 vconsole 包是否正确加载
4. 检查 localStorage 中是否有 vconsole_timestamp 项

## 环境变量控制（可选）

如果需要根据环境控制 vConsole 的加载，可以修改 `VConsole.tsx`：

```typescript
// 只在开发环境或特定条件下加载
if (typeof window !== 'undefined' && !window.vConsole && process.env.NODE_ENV === 'development') {
  // vConsole 加载逻辑
}
```

## 总结
vConsole 已经以最简单的方式集成到项目中，提供了完整的移动端调试功能，支持日志持久化，是开发和调试企业微信应用的理想工具。
