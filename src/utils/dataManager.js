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
        console.warn('Supabase table not accessible. Please create the table manually. See SUPABASE_SETUP.md for instructions.')
        return false
      }
    } catch (error) {
      console.warn('Supabase initialization failed:', error)
      return false
    }
  }

  // 保存/分享项目数据（统一功能）
  async saveProject(projectData, projectId = null) {
    try {
      const shareId = projectId || this.generateShareId()
      
      const dataToSave = {
        id: shareId,
        created_at: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        is_completed: projectData.isCompleted || false,
        type: 'editable' // 统一为可编辑类型
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
          shareUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}`,
          editUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}` // 两个链接相同
        }
      } else {
        const errorText = await response.text()
        throw new Error(`Supabase save failed: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Remote save failed, using localStorage:', error)
      
      // 如果远程保存失败，使用localStorage作为备选
      const shareId = projectId || this.generateShareId()
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
        shareUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}`,
        editUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}`,
        fallback: true
      }
    }
  }

  // 加载项目数据 - 简化版，统一为编辑模式
  async loadProject(shareId) {
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
          
          return {
            success: true,
            data: project,
            mode: 'edit' // 统一为编辑模式
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

        // 统一为编辑模式
        return {
          success: true,
          data: project,
          mode: 'edit'
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
      // 先尝试更新Supabase
      const dataToUpdate = {
        events: projectData.events,
        settings: projectData.settings || {},
        is_completed: projectData.isCompleted || false,
        updated_at: new Date().toISOString()
      }

      const response = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?id=eq.${shareId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(dataToUpdate)
      })

      if (response.ok) {
        console.log('Supabase updated successfully')
      } else {
        console.warn('Supabase update failed:', response.status)
      }
    } catch (error) {
      console.warn('Remote update failed:', error)
    }

    // 同时更新localStorage作为备份
    try {
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      if (savedProjects[shareId]) {
        savedProjects[shareId].events = projectData.events
        savedProjects[shareId].settings = projectData.settings || {}
        savedProjects[shareId].isCompleted = projectData.isCompleted || false
        savedProjects[shareId].updatedAt = new Date().toISOString()
        localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))
      }
      return { success: true }
    } catch (error) {
      console.error('Update failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export const dataManager = new DataManager()