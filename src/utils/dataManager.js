// 数据管理工具
export class DataManager {
  constructor() {
    // 使用Supabase作为数据存储
    this.supabaseUrl = 'https://tabeoktqictxhvlcbpfh.supabase.co'
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYmVva3RxaWN0eGh2bGNicGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjQ5NDgsImV4cCI6MjA3NDMwMDk0OH0.h3Y_b9YWpnHbrBO8Dl4GUxwm-PgaVnbnB_s2EtuCgNk'
    this.tableName = 'journey_projects'
  }

  // 生成分享ID
  generateShareId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  // 初始化数据表（如果不存在）
  async initializeTable() {
    try {
      // 尝试查询表是否存在
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      })
      
      if (response.ok) {
        console.log('Supabase table exists and is accessible')
        return true
      } else {
        console.warn('Supabase table not accessible:', response.status)
        return false
      }
    } catch (error) {
      console.warn('Supabase initialization failed:', error)
      return false
    }
  }

  // 保存项目数据（可编辑）
  async saveProject(projectData) {
    try {
      const shareId = this.generateShareId()
      
      const dataToSave = {
        id: shareId,
        created_at: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        is_completed: projectData.isCompleted || false,
        type: 'editable' // 标记为可编辑类型
      }

      // 使用Supabase REST API保存数据
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dataToSave)
      })

      if (response.ok) {
        const result = await response.json()
        
        // 也在localStorage中备份
        const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
        savedProjects[shareId] = dataToSave
        localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))
        
        return {
          success: true,
          shareId,
          editUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}&mode=edit`
        }
      } else {
        const errorText = await response.text()
        throw new Error(`Supabase save failed: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Remote save failed, using localStorage:', error)
      
      // 如果远程保存失败，使用localStorage作为备选
      const shareId = this.generateShareId()
      const dataToSave = {
        id: shareId,
        createdAt: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        isCompleted: projectData.isCompleted || false,
        type: 'editable'
      }
      
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      savedProjects[shareId] = dataToSave
      localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))
      
      return {
        success: true,
        shareId,
        editUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}&mode=edit`,
        fallback: true
      }
    }
  }

  // 分享项目数据（只读）
  async shareProject(projectData) {
    try {
      const shareId = this.generateShareId()
      
      const dataToSave = {
        id: shareId,
        created_at: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        is_completed: projectData.isCompleted || false,
        type: 'readonly' // 标记为只读类型
      }

      // 使用Supabase REST API保存数据
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dataToSave)
      })

      if (response.ok) {
        const result = await response.json()
        
        // 也在localStorage中备份
        const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
        savedProjects[shareId] = dataToSave
        localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))
        
        return {
          success: true,
          shareId,
          shareUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}&mode=view`
        }
      } else {
        const errorText = await response.text()
        throw new Error(`Supabase share failed: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Remote share failed, using localStorage:', error)
      
      // 如果远程保存失败，使用localStorage作为备选
      const shareId = this.generateShareId()
      const dataToSave = {
        id: shareId,
        createdAt: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        isCompleted: projectData.isCompleted || false,
        type: 'readonly'
      }
      
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      savedProjects[shareId] = dataToSave
      localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))

      return {
        success: true,
        shareId,
        shareUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}&mode=view`,
        fallback: true
      }
    }
  }

  // 加载项目数据
  async loadProject(shareId, password = null, mode = 'view') {
    try {
      // 先尝试从 Supabase 加载
      const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${shareId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const project = data[0]
          
          // 如果是只读类型，强制设置为查看模式
          if (project.type === 'readonly') {
            mode = 'view'
          }

          return {
            success: true,
            data: project,
            mode: mode
          }
        } else {
          throw new Error('Project not found in Supabase')
        }
      } else {
        throw new Error(`Supabase load failed: ${response.status}`)
      }
    } catch (error) {
      console.log('Supabase load failed, trying localStorage:', error.message)
      
      // 如果 Supabase 加载失败，尝试从 localStorage 加载
      try {
        const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
        const project = savedProjects[shareId]

        if (!project) {
          return {
            success: false,
            error: 'Project not found - 项目不存在，请检查链接是否正确'
          }
        }

        // 如果是只读类型，强制设置为查看模式
        if (project.type === 'readonly') {
          mode = 'view'
        }

        return {
          success: true,
          data: project,
          mode: mode
        }
      } catch (localError) {
        console.error('Both remote and local load failed:', localError)
        return {
          success: false,
          error: 'Failed to load project from both remote and local storage'
        }
      }
    }
  }

  // 更新项目数据
  async updateProject(shareId, projectData) {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      const project = savedProjects[shareId]

      if (!project) {
        return { success: false, error: 'Project not found' }
      }

      // 只有可编辑类型才能更新
      if (project.type !== 'editable') {
        return { success: false, error: 'Project is read-only' }
      }

      // 更新数据
      project.events = projectData.events
      project.settings = projectData.settings || {}
      project.isCompleted = projectData.isCompleted || false
      project.updatedAt = new Date().toISOString()

      savedProjects[shareId] = project
      localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))

      return { success: true }
    } catch (error) {
      console.error('Update failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export const dataManager = new DataManager()