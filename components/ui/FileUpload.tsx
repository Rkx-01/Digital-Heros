"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, CheckCircle2, AlertCircle, FileText, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number // in MB
  isLoading?: boolean
  label?: string
  helperText?: string
  className?: string
}

export const FileUpload = ({
  onUpload,
  accept = "image/*",
  maxSize = 10,
  isLoading = false,
  label = "Upload Proof",
  helperText = "PNG, JPG up to 10MB",
  className
}: FileUploadProps) => {
  const [dragActive, setDragActive] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File) => {
    setError(null)
    
    // Check type if accept is provided
    if (accept) {
      const acceptedTypes = accept.split(",").map(t => t.trim())
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith(".")) {
          return file.name.endsWith(type)
        }
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", ""))
        }
        return file.type === type
      })
      
      if (!isAccepted) {
        setError(`File type not allowed. Please upload ${accept}`)
        return false
      }
    }

    // Check size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Max size is ${maxSize}MB`)
      return false
    }

    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleConfirmUpload = async () => {
    if (file) {
      await onUpload(file)
      // Reset after success if needed, or caller can handle redirect
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        className={cn(
          "relative group border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center overflow-hidden",
          dragActive 
            ? "border-brand-500 bg-brand-50/30 scale-[0.98]" 
            : "border-surface-200 bg-surface-50/50 hover:border-surface-300 hover:bg-surface-50",
          error && "border-red-200 bg-red-50/30"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-white border border-surface-100 rounded-2xl flex items-center justify-center text-surface-400 group-hover:text-brand-500 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-110">
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-surface-900">{label}</p>
                <p className="text-[10px] text-surface-400 font-black uppercase tracking-widest">{helperText}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 h-10 border-surface-200 font-bold"
                onClick={onButtonClick}
                type="button"
              >
                Select File
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full space-y-6"
            >
              <div className="flex items-center gap-4 p-4 bg-white border border-surface-100 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                  {file.type.startsWith('image/') ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-extrabold text-surface-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-surface-400 font-black uppercase tracking-widest">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-14 font-extrabold shadow-lg shadow-brand-500/20"
                  onClick={handleConfirmUpload}
                  isLoading={isLoading}
                >
                  Confirm & Submit Proof
                </Button>
                <button 
                  onClick={clearFile}
                  className="text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-surface-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-0 right-0 px-6"
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 py-2 rounded-lg border border-red-100">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
