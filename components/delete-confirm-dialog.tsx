'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  recordName: string
}

export default function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  recordName 
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="hebrew-text flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 ml-2" />
            אישור מחיקה
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 hebrew-text">
            האם אתה בטוח שברצונך למחוק את הרשומה "{recordName}"?
          </p>
          <p className="text-sm text-red-600 hebrew-text">
            פעולה זו לא ניתנת לביטול.
          </p>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              מחק
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

