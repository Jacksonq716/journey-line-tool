# Supabase数据库设置

要启用跨浏览器数据分享功能，请在Supabase Dashboard中创建以下数据表：

## 1. 登录Supabase Dashboard
访问 https://tabeoktqictxhvlcbpfh.supabase.co 

## 2. 创建数据表
在SQL编辑器中执行以下SQL：

```sql
CREATE TABLE journey_projects (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  events JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'editable'
);
```

## 3. 设置表权限
在表设置中启用以下权限：
- INSERT: 允许匿名用户
- SELECT: 允许匿名用户  
- UPDATE: 允许匿名用户
- PATCH: 允许匿名用户

## 4. 完成
创建完成后，应用将自动使用Supabase进行数据存储。如果Supabase不可用，会自动降级到localStorage作为备用。

## 注意事项
- 每次访问主页都会生成唯一的项目ID
- 分享链接包含项目ID，确保数据隔离
- 编辑操作会实时同步到数据库