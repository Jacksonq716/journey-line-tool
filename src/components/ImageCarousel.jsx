import React, { useCallback } from 'react'
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react'

const ImageCarousel = React.memo(({ images, currentIndex, onPrevious, onNext, onIndexChange }) => {
  if (!images || images.length === 0) {
    return (
      <div className="default-image-container" style={{isolation: 'isolate'}}>
        <img 
          src="/0000111.png" 
          alt="Default Journey Background" 
          className="default-event-image"
        />
      </div>
    )
  }

  return (
    <div className="view-images" style={{isolation: 'isolate'}}>
      <div className="image-carousel">
        <div className="image-slider">
          {images.map((image, index) => (
            <div
              key={`image-${index}`}
              className="image-container"
              style={{
                display: index === currentIndex ? 'flex' : 'none'
              }}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="carousel-image"
                loading="eager"
                draggable={false}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button 
              className="nav-btn prev-btn"
              onClick={onPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              className="nav-btn next-btn"
              onClick={onNext}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
            <div className="image-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onIndexChange(index)
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
})

ImageCarousel.displayName = 'ImageCarousel'

export default ImageCarousel