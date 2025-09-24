import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // 检查是否是Chrome DOM错误
    const isDOMError = error.message && (
      error.message.includes('insertBefore') || 
      error.message.includes('removeChild') ||
      error.name === 'NotFoundError'
    )
    
    if (isDOMError) {
      console.warn('Chrome DOM error caught by ErrorBoundary:', error.message)
      // 对于DOM错误，尝试恢复而不是显示错误界面
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null })
      }, 100)
      return
    }
    
    // 对于其他错误，记录并显示错误界面
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError && this.state.error && !this.isDOMError(this.state.error)) {
      return (
        <div className="error-fallback">
          <h2>出了点问题</h2>
          <p>应用遇到了一个错误，请刷新页面重试。</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }

  isDOMError(error) {
    return error.message && (
      error.message.includes('insertBefore') || 
      error.message.includes('removeChild') ||
      error.name === 'NotFoundError'
    )
  }
}

export default ErrorBoundary