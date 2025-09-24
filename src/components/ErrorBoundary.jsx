import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 清理可能的DOM状态
    setTimeout(() => {
      if (error.message.includes('insertBefore') || error.message.includes('removeChild')) {
        console.warn('DOM operation error detected, attempting recovery...')
        // 强制重新渲染
        this.setState({ errorInfo })
      }
    }, 100)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          background: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>出现了一些问题</h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>应用遇到了DOM操作错误，这通常是临时性问题</p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              重试
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              刷新页面
            </button>
          </div>
          
          {this.state.error && (
            <details style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
              <summary>错误详情</summary>
              <pre style={{ textAlign: 'left', padding: '10px', background: '#f1f3f5', borderRadius: '4px', marginTop: '8px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary