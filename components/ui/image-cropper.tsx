'use client'

import { useState, useRef } from 'react'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ImageCropperProps {
  open: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImage: string) => void
  aspectRatio?: number
}

export function ImageCropper({
  open,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  })
  const imageRef = useRef<HTMLImageElement>(null)

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): string => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return canvas.toDataURL('image/jpeg')
  }

  const handleComplete = () => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImage = getCroppedImg(imageRef.current, crop)
      onCropComplete(croppedImage)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div className="relative bg-muted/50 rounded-lg overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              aspect={aspectRatio}
              circularCrop
              className={cn(
                "max-w-full",
                "[&_.ReactCrop__crop-selection]:rounded-full",
                "[&_.ReactCrop__crop-selection]:border-2",
                "[&_.ReactCrop__crop-selection]:border-primary",
                "[&_.ReactCrop__drag-handle]:bg-primary",
                "[&_.ReactCrop__drag-handle]:rounded-full",
                "[&_.ReactCrop__drag-handle]:w-2",
                "[&_.ReactCrop__drag-handle]:h-2",
                "[&_.ReactCrop__drag-handle]:border",
                "[&_.ReactCrop__drag-handle]:border-background"
              )}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="max-w-full max-h-[40vh] object-contain mx-auto"
                onLoad={(e) => {
                  const { width, height } = e.currentTarget
                  const size = Math.min(width, height)
                  setCrop({
                    unit: 'px',
                    width: size,
                    height: size,
                    x: (width - size) / 2,
                    y: (height - size) / 2
                  })
                }}
              />
            </ReactCrop>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-20 h-8 text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleComplete}
              className="w-20 h-8 text-sm"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 