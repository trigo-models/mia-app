'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Search, RefreshCw } from 'lucide-react'
import RecordModal from './record-modal'
import DeleteConfirmDialog from './delete-confirm-dialog'

interface Record {
  id: string
  fields: { [key: string]: any }
  createdTime: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  })
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null)

  const fetchRecords = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    
    try {
      const response = await fetch(`/api/admin/records?page=${page}&limit=${pagination.limit}`)
      const data = await response.json()
      
      if (data.success) {
        if (append) {
          setRecords(prev => [...prev, ...data.records])
        } else {
          setRecords(data.records)
        }
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      if (append) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const loadMoreRecords = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchRecords(pagination.page + 1, true)
    }
  }

  const handleAddRecord = () => {
    setEditingRecord(null)
    setIsModalOpen(true)
  }

  const handleDeleteRecord = (record: Record) => {
    setRecordToDelete(record)
    setIsDeleteDialogOpen(true)
  }

  const handleViewRecord = (record: Record) => {
    router.push(`/admin/view/${record.id}`)
  }

  const handleSaveRecord = async (recordId: string, updatedFields: { [key: string]: any }) => {
    try {
      const response = await fetch(`/api/admin/records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: updatedFields }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh the records list
          fetchRecords(pagination.page)
        } else {
          alert(`שגיאה בשמירה: ${result.error || 'שגיאה לא ידועה'}`)
        }
      } else {
        let errorMessage = 'שגיאה לא ידועה'
        try {
          const result = await response.json()
          errorMessage = result.error || errorMessage
        } catch (e) {
          errorMessage = `שגיאת שרת: ${response.status} ${response.statusText}`
        }
        alert(`שגיאה בשמירה: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error saving record:', error)
      alert('שגיאה בשמירת הרשומה - בעיית רשת')
    }
  }

  const confirmDelete = async () => {
    if (!recordToDelete) return

    try {
      const response = await fetch(`/api/admin/records/${recordToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchRecords(pagination.page)
        setIsDeleteDialogOpen(false)
        setRecordToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const filteredRecords = records
    .filter(record =>
      Object.values(record.fields).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      // Sort by date_made first, then by creation time
      const dateMadeA = a.fields.date_made ? new Date(a.fields.date_made).getTime() : 0
      const dateMadeB = b.fields.date_made ? new Date(b.fields.date_made).getTime() : 0
      
      if (dateMadeA !== dateMadeB) {
        return dateMadeB - dateMadeA // Newest date_made first
      }
      
      // If date_made is the same or missing, sort by creation time
      const dateA = new Date(a.createdTime).getTime()
      const dateB = new Date(b.createdTime).getTime()
      return dateB - dateA
    })

  // Define Hebrew column mappings
  const getColumnMappings = () => {
    return {
      'fac_name': 'שם המפעל',
      'element': 'איזור ספציפי',
      'date_made': 'תאריך ביצוע',
      'r_owner': 'שם הממלא',
      'start_time': 'שעת התחלה',
      'end_time': 'שעת סיום',
      'is_construction': 'קונסטרוקציה',
      'contruction_tons': 'משקל קונסט',
      'is_greetings': 'שבכות',
      'greetings_dim': 'שבכות מ"ר',
      'is_handrail': 'מעקות',
      'handrail_length': 'מעקות מ"א',
      'is_steps': 'מדרגות',
      'steps_qty': 'כמות מדרגות',
      'step_size': 'מידות מדרגה',
      'is_bolts': 'עוגנים',
      'bolt_qty': 'כמות עוגנים',
      'bolt_type': 'סוג העוגן',
      'r_comments': 'הערות ר"צ',
      'r_leaders': 'ראשי צוות',
      'r_team': 'אנשי צוות',
      'r_status': 'סטאטוס',
      'job_desc': 'תיאור עבודה מפורט',
      'has_disconnections': 'פירוקים',
      'disconnected_tons': 'משקל חומר שפורק',
      'Number': 'מספר עבודה'
    }
  }

  const getFieldKeys = () => {
    if (records.length === 0) return []
    
    // Get all unique field keys from all records
    const allKeys = new Set<string>()
    records.forEach(record => {
      Object.keys(record.fields).forEach(key => allKeys.add(key))
    })
    
    // Filter out date_created, ID, and id fields, convert to array
    const filteredKeys = Array.from(allKeys).filter(key => 
      key !== 'date_created' && 
      key !== 'ID' && 
      key !== 'id'
    )
    
    // Reorder fields to put Number right after fac_name, and r_owner right after date_made
    const orderedKeys = []
    const hasNumber = filteredKeys.includes('Number')
    const hasFacName = filteredKeys.includes('fac_name')
    const hasDateMade = filteredKeys.includes('date_made')
    const hasROwner = filteredKeys.includes('r_owner')
    
    // Add fac_name first
    if (hasFacName) {
      orderedKeys.push('fac_name')
    }
    
    // Add Number right after fac_name (only if it exists in the data)
    if (hasNumber) {
      orderedKeys.push('Number')
    }
    
    // Add date_made
    if (hasDateMade) {
      orderedKeys.push('date_made')
    }
    
    // Add r_owner right after date_made
    if (hasROwner) {
      orderedKeys.push('r_owner')
    }
    
    // Add all other fields except the ones already added
    filteredKeys.forEach(key => {
      if (key !== 'fac_name' && key !== 'Number' && key !== 'date_made' && key !== 'r_owner') {
        orderedKeys.push(key)
      }
    })
    
    return orderedKeys
  }

  // Define which fields to show in the main table
  const getMainTableFields = () => {
    return ['fac_name', 'Number', 'element', 'date_made', 'r_owner', 'r_status']
  }

  const fieldKeys = getFieldKeys()
  const columnMappings = getColumnMappings()
  const mainTableFields = getMainTableFields()
  
  // Check if Number field exists in any record
  const hasNumberField = records.some(record => 'Number' in record.fields)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Actions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 hebrew-text">
            ניהול רשומות ({pagination.total} רשומות)
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchRecords(pagination.page)}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              רענן
            </Button>
            <Button onClick={handleAddRecord}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף רשומה
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="חיפוש רשומות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        
        {/* Number Field Notice */}
        {!hasNumberField && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 hebrew-text text-sm">
              <strong>הערה:</strong> עמודת "מספר עבודה" לא קיימת ברשומות הקיימות. 
              הרשומות החדשות שייווצרו יכללו את העמודה הזו.
            </p>
          </div>
        )}
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text">רשומות</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right" dir="rtl">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right">תאריך ביצוע</th>
                    <th className="px-6 py-3 text-right">שם הממלא</th>
                    <th className="px-6 py-3 text-right">שם המפעל</th>
                    <th className="px-6 py-3 text-right">מספר עבודה</th>
                    <th className="px-6 py-3 text-right">מיקום ספציפי</th>
                    <th className="px-6 py-3 text-right">סטאטוס</th>
                    <th className="px-6 py-3 text-right">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-right">
                        {record.fields.date_made ? new Date(record.fields.date_made).toLocaleDateString('he-IL') : 'לא מוגדר'}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-right">
                        <span>
                          {record.fields.r_owner || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-right">
                        <span>
                          {record.fields.fac_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-right">
                        <span>
                          {record.fields.Number || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-right">
                        <span>
                          {record.fields.element || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-right">
                        <span>
                          {record.fields.r_status || '-'}
                        </span>
                      </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRecord(record)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                צפיה
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRecord(record)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRecords.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  אין רשומות להצגה
                </div>
              )}

              {/* Load More Button */}
              {pagination.hasMore && filteredRecords.length > 0 && (
                <div className="text-center py-6">
                  <Button
                    onClick={loadMoreRecords}
                    disabled={loadingMore}
                    variant="outline"
                    className="hebrew-text"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 ml-2"></div>
                        טוען...
                      </>
                    ) : (
                      'טען עוד רשומות'
                    )}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              {filteredRecords.length > 0 && (
                <div className="text-center py-4 text-sm text-gray-600 hebrew-text">
                  מציג {filteredRecords.length} מתוך {pagination.total} רשומות
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* Record Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={editingRecord}
        onSave={() => {
          fetchRecords(pagination.page)
          setIsModalOpen(false)
        }}
        fieldKeys={fieldKeys}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        recordName={recordToDelete?.fields?.fac_name || recordToDelete?.fields?.element || 'רשומה זו'}
      />

    </div>
  )
}
