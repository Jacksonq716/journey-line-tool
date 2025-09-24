# 数据迁移指南

## 部署前数据备份

### 1. 导出现有数据
在浏览器控制台运行以下代码：

```javascript
// 导出所有项目数据
const journeyProjects = localStorage.getItem('journeyProjects');
const tempProject = localStorage.getItem('journey-line-tool-current-project_temp');

console.log('Journey Projects:', journeyProjects);
console.log('Temp Project:', tempProject);

// 保存到文件
const dataToExport = {
  journeyProjects: JSON.parse(journeyProjects || '{}'),
  tempProject: JSON.parse(tempProject || '{}'),
  exportDate: new Date().toISOString()
};

const blob = new Blob([JSON.stringify(dataToExport, null, 2)], 
  { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'journey-line-backup.json';
a.click();
```

### 2. 验证Supabase数据
- 登录 https://tabeoktqictxhvlcbpfh.supabase.co
- 检查 journey_projects 表中的数据
- 确认所有重要项目都已同步

### 3. 分享链接测试
测试现有分享链接：
- 复制现有的分享链接
- 在无痕窗口中打开
- 验证数据加载和编辑功能

## 部署后数据恢复

如果发现数据丢失：

### 1. 手动导入重要项目
```javascript
// 在新版本中导入备份数据
const backupData = {
  // 粘贴备份的数据
};

// 上传到Supabase
Object.entries(backupData.journeyProjects).forEach(async ([id, project]) => {
  const result = await dataManager.saveProject(project, id);
  console.log(`Restored project ${id}:`, result);
});
```

### 2. 重新生成分享链接
- 为重要项目重新生成分享链接
- 更新书签和分享给他人的链接

## 预防措施

### 1. 定期备份
建议用户定期导出重要数据

### 2. 云端优先
确保重要项目都通过"Save & Share"保存到Supabase

### 3. 版本兼容性
新版本保持与旧数据格式的兼容性