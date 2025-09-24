// 数据管理工具
export class DataManager {
  constructor() {
    this.baseUrl = 'https://api.jsonbin.io/v3/b' // 使用JSONBin作为简单的数据存储
    this.apiKey = '$2a$10$YourAPIKeyHere' // 需要替换为实际的API密钥
  }

  // 生成分享ID
  generateShareId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  // 保存项目数据（可编辑）
  async saveProject(projectData) {
    try {
      const shareId = this.generateShareId()
      
      const dataToSave = {
        id: shareId,
        createdAt: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        isCompleted: projectData.isCompleted || false,
        type: 'editable' // 标记为可编辑类型
      }

      // 使用localStorage作为临时存储（实际项目中应该使用后端服务）
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      savedProjects[shareId] = dataToSave
      localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))

      return {
        success: true,
        shareId,
        editUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}&mode=edit`
      }
    } catch (error) {
      console.error('Save failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 分享项目数据（只读）
  async shareProject(projectData) {
    try {
      const shareId = this.generateShareId()
      
      const dataToSave = {
        id: shareId,
        createdAt: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        isCompleted: projectData.isCompleted || false,
        type: 'readonly' // 标记为只读类型
      }

      // 使用localStorage作为临时存储
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      savedProjects[shareId] = dataToSave
      localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))

      return {
        success: true,
        shareId,
        shareUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}&mode=view`
      }
    } catch (error) {
      console.error('Share failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 加载项目数据
  async loadProject(shareId, password = null, mode = 'view') {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      const project = savedProjects[shareId]

      if (!project) {
        return {
          success: false,
          error: 'Project not found'
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
    } catch (error) {
      console.error('Load failed:', error)
      return {
        success: false,
        error: error.message
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