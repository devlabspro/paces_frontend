"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Copy, MoreHorizontal, Plus, Upload, Search, ChevronRight, ArrowLeft, Database, Mic, Download, FileText } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"

interface DataTableItem {
  id: string
  identifier: string
  input: string
  expected_output: string
  metadata: string
  created_at: string
  updated_at: string
}

interface Dataset {
  id: number
  title: string
  goal: string
  category?: string
  created_at: string
  updated_at: string
}

const navigationItems = [
  {
    name: "Datasets",
    path: "/datasets",
    icon: <Database className="w-5 h-5" />,
  },
  {
    name: "Voice Agents",
    path: "/voice-agents",
    icon: <Mic className="w-5 h-5" />,
  },
]

export default function DatasetDetailPage() {
  const params = useParams<{ datasetid: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [dataTableItems, setDataTableItems] = useState<DataTableItem[]>([])
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DataTableItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [newItem, setNewItem] = useState({ identifier: "", input: "", expected_output: "" })
  const [editItem, setEditItem] = useState({ identifier: "", input: "", expected_output: "" })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
  const [parsedItems, setParsedItems] = useState<Array<{identifier: string, input: string, expected_output: string, metadata: string}> | null>(null)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, status: '' })
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchDatasetData()
  }, [params.datasetid])

  const fetchDatasetData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/data-table`)
      if (!response.ok) throw new Error("Failed to fetch dataset data")
      const data = await response.json()
      setDataset(data.dataset)
      setDataTableItems(data.data_table_items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateItem = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/data-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })
      if (!response.ok) throw new Error("Failed to create item")
      await fetchDatasetData()
      setNewItem({ identifier: "", input: "", expected_output: "" })
      setIsCreateModalOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditItem = async () => {
    if (!editingItem) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/data-table/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      })
      if (!response.ok) throw new Error("Failed to update item")
      await fetchDatasetData()
      setEditingItem(null)
      setEditItem({ identifier: "", input: "", expected_output: "" })
      setIsEditModalOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/data-table/${itemId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete item")
      await fetchDatasetData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    try {
      setIsDeleting(true)
      const deletePromises = Array.from(selectedItems).map(itemId => 
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/data-table/${itemId}`, {
          method: "DELETE",
        })
      )
      
      const results = await Promise.allSettled(deletePromises)
      const failed = results.filter(result => result.status === 'rejected' || !result.value?.ok)
      
      if (failed.length > 0) {
        console.error('Some items failed to delete:', failed)
        alert(`Failed to delete ${failed.length} items. Please try again.`)
      } else {
        console.log(`Successfully deleted ${selectedItems.size} items`)
      }
      
      await fetchDatasetData()
      setSelectedItems(new Set())
      setShowBulkDeleteConfirm(false)
    } catch (e) {
      console.error('Bulk delete failed:', e)
      alert('Bulk delete failed. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleAll = () => {
    const allSelected = dataTableItems.every(item => selectedItems.has(item.id))
    if (allSelected) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(dataTableItems.map(item => item.id)))
    }
  }

  const openEditModal = (item: DataTableItem) => {
    setEditingItem(item)
    setEditItem({ identifier: item.identifier, input: item.input, expected_output: item.expected_output })
    setIsEditModalOpen(true)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true)
      const itemsToExport = selectedItems.size > 0 
        ? dataTableItems.filter(item => selectedItems.has(item.id))
        : dataTableItems

      if (format === 'csv') {
        const csvContent = [
          'Identifier,Input,Expected Output,Metadata,Created At,Updated At',
          ...itemsToExport.map(item => 
            `"${item.identifier.replace(/"/g, '""')}","${item.input.replace(/"/g, '""')}","${item.expected_output.replace(/"/g, '""')}","${item.metadata}","${item.created_at}","${item.updated_at}"`
          )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${dataset?.title || 'dataset'}_${format}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const jsonContent = JSON.stringify(itemsToExport, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${dataset?.title || 'dataset'}_${format}.json`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return

    try {
      setIsUploading(true)
      const fileContent = await readFileContent(uploadFile)
      const newItems = parseFileContent(fileContent, uploadFile.name)
      
      // Show confirmation dialog
      setShowReplaceConfirm(true)
      
      // Store the parsed items for confirmation
      setParsedItems(newItems)
      // Enable confirmation actions (we only wanted a brief uploading state while reading file)
      setIsUploading(false)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setIsUploading(false)
    }
  }

  const confirmReplace = async () => {
    if (!parsedItems) return

    try {
      setIsUploading(true)
      setUploadProgress({ current: 0, total: 0, status: 'Starting upload...' })
      // Try batch upload first
      const batchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/batch-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsedItems }),
      })

      if (batchResponse.ok) {
        // Batch upload successful
        console.log('Batch upload successful!')
        await fetchDatasetData()
        setUploadFile(null)
        setParsedItems(null)
        setIsUploadModalOpen(false)
        setShowReplaceConfirm(false)
        return
      }

      // Fallback to individual uploads if batch endpoint doesn't exist
      console.log('Batch upload not available, using individual uploads...')
      
      // First, clear all existing items
      setUploadProgress({ current: 0, total: dataTableItems.length, status: 'Clearing existing items...' })
      console.log('Clearing existing items...')
      const deletePromises = dataTableItems.map(item => deleteDataTableItem(item.id))
      await Promise.all(deletePromises)
      
      // Then add all new items in batches
      setUploadProgress({ current: 0, total: parsedItems.length, status: 'Adding new items...' })
      console.log(`Adding ${parsedItems.length} new items...`)
      const batchSize = 2 // Process 2 items at a time for better reliability
      for (let i = 0; i < parsedItems.length; i += batchSize) {
        const batch = parsedItems.slice(i, i + batchSize)
        const createPromises = batch.map(item => createDataTableItem(item))
        await Promise.all(createPromises)
        
        const current = Math.min(i + batchSize, parsedItems.length)
        setUploadProgress({ current, total: parsedItems.length, status: `Processing items... ${current}/${parsedItems.length}` })
        console.log(`Progress: ${current}/${parsedItems.length} items processed`)
      }
      
      // Refresh the dataset data
      console.log('Refreshing dataset data...')
      await fetchDatasetData()
      
      setUploadFile(null)
      setParsedItems(null)
      setIsUploadModalOpen(false)
      setShowReplaceConfirm(false)
      
      console.log('Upload completed successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsUploading(false)
    }
  }

  const deleteDataTableItem = async (itemId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/data-table/${itemId}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete item")
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const parseFileContent = (content: string, filename: string): Array<{identifier: string, input: string, expected_output: string, metadata: string}> => {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    if (extension === 'json') {
      try {
        const data = JSON.parse(content)
        if (Array.isArray(data)) {
          return data.map(item => ({
            identifier: item.identifier || item.Identifier || item.name || item.Name || '',
            input: item.input || item.Input || '',
            expected_output: item.expected_output || item.expectedOutput || item['Expected Output'] || '',
            metadata: item.metadata || item.Metadata || ''
          }))
        } else {
          throw new Error('JSON file must contain an array of items')
        }
      } catch (error) {
        throw new Error('Invalid JSON format')
      }
    } else if (extension === 'csv') {
      try {
        const lines = content.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header and one data row')
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const identifierIndex = headers.findIndex(h => h.toLowerCase().includes('identifier') || h.toLowerCase().includes('name'))
        const inputIndex = headers.findIndex(h => h.toLowerCase().includes('input'))
        const outputIndex = headers.findIndex(h => h.toLowerCase().includes('output') || h.toLowerCase().includes('expected'))
        const metadataIndex = headers.findIndex(h => h.toLowerCase().includes('metadata'))
        
        if (inputIndex === -1 || outputIndex === -1) {
          throw new Error('CSV must have "Input" and "Expected Output" columns')
        }
        
        return lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          return {
            identifier: values[identifierIndex] || '',
            input: values[inputIndex] || '',
            expected_output: values[outputIndex] || '',
            metadata: values[metadataIndex] || ''
          }
        }).filter(item => item.input && item.expected_output)
      } catch (error) {
        throw new Error('Invalid CSV format: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    } else {
      throw new Error('Unsupported file format. Please use CSV or JSON.')
    }
  }

  const createDataTableItem = async (item: {identifier: string, input: string, expected_output: string, metadata: string}) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${params.datasetid}/data-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`Failed to create item: ${response.status}`)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - server may be slow')
      }
      throw error
    }
  }

  const filteredItems = dataTableItems.filter(item =>
    item.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.expected_output.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="w-full flex-1">
          <Topbar
            navigationItems={[{ text: "Datasets", link: "/datasets" }]}
          />
          <div className="flex">
            <Sidebar navItems={navigationItems} />
            <main className="flex-1 p-6">
              <div className="flex justify-center items-center h-64">
                <div className="text-[#8c8984]">Loading dataset...</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="w-full flex-1">
          <Topbar
            navigationItems={[{ text: "Datasets", link: "/datasets" }]}
          />
          <div className="flex">
            <Sidebar navItems={navigationItems} />
            <main className="flex-1 p-6">
              <div className="flex justify-center items-center h-64">
                <div className="text-[#8c8984]">Dataset not found</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="w-full flex-1">
        <Topbar
          navigationItems={[{ text: "Datasets", link: "/datasets" }]}
        />
        <div className="flex">
          <Sidebar navItems={navigationItems} />
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h1 className="text-2xl font-semibold text-gray-900">{dataset.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 !bg-white !text-black border border-gray-300 hover:!bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy ID
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Metadata Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top row: Created, Version, Description */}
                <Card className="p-4 bg-white border-gray-200">
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium text-gray-900">{formatDate(dataset.created_at)}</div>
                </Card>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="text-sm text-gray-500">Version</div>
                  <div className="font-medium text-2xl text-gray-900">1 (created {Math.ceil((Date.now() - new Date(dataset.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago)</div>
                </Card>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="font-medium text-gray-400">-</div>
                </Card>

                {/* Bottom row: Records, Experiments, Last used */}
                <Card className="p-4 bg-white border-gray-200">
                  <div className="text-sm text-gray-500"># of Records</div>
                  <div className="font-medium text-2xl text-gray-900">{dataTableItems.length}</div>
                </Card>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="text-sm text-gray-500"># of Experiments run</div>
                  <div className="font-medium text-2xl text-gray-900">0</div>
                </Card>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="text-sm text-gray-500">Last used</div>
                  <div className="font-medium text-gray-900">Never</div>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Data Table</h2>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 !bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItems.size > 0 && (
                      <div className="flex items-center gap-2 mr-4">
                        <span className="text-sm text-gray-600">
                          {selectedItems.size} selected
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => setShowBulkDeleteConfirm(true)}
                          disabled={isDeleting}
                        >
                          Delete Selected
                        </Button>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      New Item
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2 !bg-white !text-black border border-gray-300 hover:!bg-gray-50"
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-2 !bg-white !text-black border border-gray-300 hover:!bg-gray-50"
                          disabled={isExporting}
                        >
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport('csv')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('json')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border-t border-gray-300 bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300 bg-gray-50">
                          <th className="text-left p-4 w-12">
                            <Checkbox
                              checked={dataTableItems.length > 0 && dataTableItems.every(item => selectedItems.has(item.id))}
                              onCheckedChange={toggleAll}
                              className="!bg-white border-gray-600 data-[state=checked]:!bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                            />
                          </th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Identifier</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Input</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Expected Output</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Metadata</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Last modified</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-700">Date created</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center text-gray-500 py-8">
                              {searchQuery ? "No items match your search" : "No data table items yet"}
                            </td>
                          </tr>
                        ) : (
                          filteredItems.map((item) => (
                            <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                              <td className="p-4">
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onCheckedChange={() => toggleItem(item.id)}
                                  className="!bg-white border-gray-600 data-[state=checked]:!bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                                />
                              </td>
                              <td className="p-4 max-w-xs">
                                <div className="text-sm font-medium text-gray-900">{item.identifier}</div>
                              </td>
                              <td className="p-4 max-w-md">
                                <div className="text-sm leading-relaxed text-gray-900">{item.input}</div>
                              </td>
                              <td className="p-4 max-w-md">
                                <div className="text-sm leading-relaxed text-gray-700">{item.expected_output}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant="secondary" className="bg-gray-200 text-gray-800 border-gray-300">
                                  {item.metadata}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm text-gray-700">{formatDate(item.updated_at)}</td>
                              <td className="p-4 text-sm text-gray-700">{formatDate(item.created_at)}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditModal(item)}
                                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Create Item Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Data Table Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium">Identifier</label>
              <Input
                id="identifier"
                value={newItem.identifier}
                onChange={(e) => setNewItem({ ...newItem, identifier: e.target.value })}
                placeholder="Enter identifier/name"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="input" className="text-sm font-medium">Input</label>
              <Textarea
                id="input"
                value={newItem.input}
                onChange={(e) => setNewItem({ ...newItem, input: e.target.value })}
                placeholder="Enter input text"
                className="border-gray-300 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="expected_output" className="text-sm font-medium">Expected Output</label>
              <Textarea
                id="expected_output"
                value={newItem.expected_output}
                onChange={(e) => setNewItem({ ...newItem, expected_output: e.target.value })}
                placeholder="Enter expected output"
                className="border-gray-300 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateItem}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!newItem.identifier || !newItem.input || !newItem.expected_output}
            >
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Data Table Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit_identifier" className="text-sm font-medium">Identifier</label>
              <Input
                id="edit_identifier"
                value={editItem.identifier}
                onChange={(e) => setEditItem({ ...editItem, identifier: e.target.value })}
                placeholder="Enter identifier/name"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit_input" className="text-sm font-medium">Input</label>
              <Textarea
                id="edit_input"
                value={editItem.input}
                onChange={(e) => setEditItem({ ...editItem, input: e.target.value })}
                placeholder="Enter input text"
                className="border-gray-300 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit_expected_output" className="text-sm font-medium">Expected Output</label>
              <Textarea
                id="edit_expected_output"
                value={editItem.expected_output}
                onChange={(e) => setEditItem({ ...editItem, expected_output: e.target.value })}
                placeholder="Enter expected output"
                className="border-gray-300 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditItem}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!editItem.identifier || !editItem.input || !editItem.expected_output}
            >
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Upload Dataset Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="file-upload" className="text-sm font-medium">Select File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    CSV or JSON files only
                  </span>
                </label>
              </div>
              {uploadFile && (
                <div className="text-sm text-gray-600">
                  Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              <p><strong>⚠️ Warning:</strong> This will replace all existing data in the dataset.</p>
              <p><strong>CSV Format:</strong> Identifier, Input, Expected Output, Metadata</p>
              <p><strong>JSON Format:</strong> Array of objects with identifier, input, expected_output, metadata fields</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false)
                setUploadFile(null)
              }}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!uploadFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Confirmation Dialog */}
      <Dialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">⚠️ Replace Dataset Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-700">
              <p>You are about to replace <strong>all existing data</strong> in this dataset with the uploaded file.</p>
              <p className="mt-2">This action cannot be undone.</p>
              {parsedItems && (
                <p className="mt-2 text-blue-600">
                  <strong>{parsedItems.length} items</strong> will be added to the dataset.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReplaceConfirm(false)
                setParsedItems(null)
                setIsUploading(false)
              }}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReplace}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="text-sm">{uploadProgress.status}</div>
                  {uploadProgress.total > 0 && (
                    <div className="text-xs mt-1">
                      {uploadProgress.current}/{uploadProgress.total} items
                    </div>
                  )}
                </div>
              ) : (
                "Replace Data"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">⚠️ Delete Selected Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-700">
              <p>You are about to delete <strong>{selectedItems.size} selected items</strong> from this dataset.</p>
              <p className="mt-2">This action cannot be undone.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="border-gray-300"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : `Delete ${selectedItems.size} Items`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
