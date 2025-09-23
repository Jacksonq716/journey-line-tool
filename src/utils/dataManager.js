// 数据管理工具
export class DataManager {
  constructor() {
    this.baseUrl = 'https://api.jsonbin.io/v3/b' // 使用JSONBin作为简单的数据存储
    this.apiKey = '$2a$10$YourAPIKeyHere' // 需要替换为实际的API密钥
  }

  // 生成4位随机密码
  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 生成分享ID
  generateShareId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  // 保存项目数据
  async saveProject(projectData) {
    try {
      const shareId = this.generateShareId()
      const password = this.generatePassword()
      
      const dataToSave = {
        id: shareId,
        password: password,
        createdAt: new Date().toISOString(),
        title: projectData.title || 'My Journey',
        events: projectData.events,
        settings: projectData.settings || {},
        isCompleted: projectData.isCompleted || false
      }

      // 使用localStorage作为临时存储（实际项目中应该使用后端服务）
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      savedProjects[shareId] = dataToSave
      localStorage.setItem('journeyProjects', JSON.stringify(savedProjects))

      return {
        success: true,
        shareId,
        password,
        shareUrl: `${window.location.origin}${window.location.pathname}?id=${shareId}`
      }
    } catch (error) {
      console.error('Save failed:', error)
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

      // 编辑模式需要验证密码
      if (mode === 'edit' && project.password !== password) {
        return {
          success: false,
          error: 'Incorrect password'
        }
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
  async updateProject(shareId, password, projectData) {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('journeyProjects') || '{}')
      const project = savedProjects[shareId]

      if (!project) {
        return { success: false, error: 'Project not found' }
      }

      if (project.password !== password) {
        return { success: false, error: 'Incorrect password' }
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