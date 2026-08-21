"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Edit, FileDown, Play, Plus, MoreHorizontal, ChevronDown, ChevronRight, ArrowUpDown, X, Save, XCircle, Check } from "lucide-react"
import { useParams } from "next/navigation"
import { useLogin } from "@/context/LoginContext"
import Topbar from "@/components/Topbar"
import Sidebar from "@/components/Sidebar"
import { Database, Mic } from "lucide-react"

interface VoiceAgentDetail {
  id: number
  title: string
  content: string
  prompt?: string
  category: string
  created_at: string
}

interface Dataset {
  id: number
  title: string
  content: string
  category?: string
  created_at: string
}

interface DatasetDataItem {
  id: number
  identifier: string
  input: string
  expected_output: string
  metadata: string
  created_at: string
}

interface CallData {
  id: number
  call_id: string
  dataset_item_id: number
  status: string
  rating: string
  transcript: string
  duration: string
  twilio_call_sid: string
  created_at: string
  updated_at: string
  dataset_item: {
    id: number
    identifier: string
    input: string
    expected_output: string
    metadata: string
  }
}

export default function VoiceAgentDetailPage() {
  const params = useParams()
  const voiceAgentId = Number(params.voiceagentid)
  const { username } = useLogin()
  const [voiceAgent, setVoiceAgent] = useState<VoiceAgentDetail | null>(null)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [datasetData, setDatasetData] = useState<DatasetDataItem[]>([])
  const [callData, setCallData] = useState<CallData[]>([])
  const [datasetItems, setDatasetItems] = useState<DatasetDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<number | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ title: "", content: "", prompt: "" })
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false)
  const [selectedDatasetItem, setSelectedDatasetItem] = useState<DatasetDataItem | null>(null)

  const navigationItems = [
    { name: "Datasets", path: "/datasets", icon: <Database className="w-5 h-5" /> },
    { name: "Voice Agents", path: "/voice-agents", icon: <Mic className="w-5 h-5" /> },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [vaRes, datasetsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/voice-agent/${voiceAgentId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/datasets/${username}`)
        ])
        
        if (!vaRes.ok || !datasetsRes.ok) throw new Error("Failed to load data")
        
        const va = await vaRes.json()
        const datasetsData = await datasetsRes.json()
        
        setVoiceAgent(va)
        setDatasets(datasetsData.datasets || [])
        
        // Initialize edit data
        setEditData({
          title: va.title,
          content: va.content,
          prompt: va.prompt || ""
        })
        
        // Fetch call records
        fetchCallRecords()
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    
    if (!Number.isNaN(voiceAgentId)) {
      fetchData()
    }
  }, [voiceAgentId, username])

  const fetchCallRecords = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/voice-agent/${voiceAgentId}/call-records`)
      if (response.ok) {
        const data = await response.json()
        setCallData(data.call_records || [])
      } else {
        console.error("Failed to fetch call records")
        setCallData([])
      }
    } catch (error) {
      console.error("Error fetching call records:", error)
      setCallData([])
    }
  }

  const fetchDatasetItems = async (datasetId: number) => {
    try {
      const itemsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dataset/${datasetId}/data-table`)
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setDatasetItems(itemsData.data_table_items || [])
      } else {
        console.error("Failed to fetch dataset items")
        setDatasetItems([])
      }
    } catch (error) {
      console.error("Error fetching dataset items:", error)
      setDatasetItems([])
    }
  }

  const getCallDataForItem = (datasetItemId: number) => {
    return callData.find(call => call.dataset_item_id === datasetItemId)
  }

  const handleDatasetSelect = async (dataset: Dataset) => {
    setSelectedDataset(dataset)
    // Fetch dataset items for the selected dataset
    await fetchDatasetItems(dataset.id)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/voice-agent/${voiceAgentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      })
      if (!res.ok) throw new Error("Failed to update voice agent")
      
      const updated = await res.json()
      setVoiceAgent(updated)
      setIsEditing(false)
    } catch (e) {
      console.error("Failed to update voice agent:", e)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: voiceAgent?.title || "",
      content: voiceAgent?.content || "",
      prompt: voiceAgent?.prompt || ""
    })
    setIsEditing(false)
  }

  const handleExpandClick = (index: number) => {
    setSelectedCall(index)
    setIsMinimized(false)
  }

  const closeModal = () => {
    setSelectedCall(null)
    setIsMinimized(false)
  }

  const handleRunClick = () => {
    if (!selectedDataset) {
      alert("Please select a dataset first")
      return
    }
    setIsDatasetModalOpen(true)
  }

  const handleDatasetItemSelect = (item: DatasetDataItem) => {
    setSelectedDatasetItem(item)
  }

  const handleConfirmDatasetSelection = async () => {
    if (!selectedDatasetItem) {
      console.log("No dataset item selected")
      return
    }
    
    setIsDatasetModalOpen(false)
    
    try {
      // Call the Flask backend to trigger a call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trigger-voice-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: voiceAgent?.prompt || "[TASK] Your name is {name}, you're a venture capitalist and you are calling a founder. You're...",
          identifier: selectedDatasetItem.identifier,
          input_prompt: selectedDatasetItem.input,
          dataset_item_id: selectedDatasetItem.id,
          voice_agent_id: voiceAgentId
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to trigger call")
      }
      
      const result = await response.json()
      
      // Refresh call records and dataset items
      await fetchCallRecords()
      if (selectedDataset) {
        await fetchDatasetItems(selectedDataset.id)
      }
      
      console.log("Call initiated successfully:", result)
      
    } catch (error) {
      console.error("Error triggering call:", error)
    }
    
    // Reset selection
    setSelectedDatasetItem(null)
  }

  const handleCancelDatasetSelection = () => {
    setIsDatasetModalOpen(false)
    setSelectedDatasetItem(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Topbar navigationItems={[{ text: "Voice Agents", link: "/voice-agents" }, { text: "Loading...", link: "#" }]} />
        <div className="flex flex-1">
          <Sidebar navItems={navigationItems} />
          <div className="flex-1 bg-white flex items-center justify-center">
            <p className="text-[#8c8984]">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!voiceAgent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Topbar navigationItems={[{ text: "Voice Agents", link: "/voice-agents" }, { text: "Not Found", link: "#" }]} />
        <div className="flex flex-1">
          <Sidebar navItems={navigationItems} />
          <div className="flex-1 bg-white flex items-center justify-center">
            <p className="text-[#8c8984]">Voice agent not found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      <Topbar navigationItems={[{ text: "Voice Agents", link: "/voice-agents" }, { text: voiceAgent.title, link: `/voice-agents/${voiceAgentId}` }]} />
      <div className="flex">
        <Sidebar navItems={navigationItems} />
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6">
            <h1 className="text-2xl font-semibold text-gray-900">{voiceAgent.title}</h1>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleCancel}>
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <FileDown className="h-4 w-4" />
                    CSV
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Project Details - Three Separate Cards */}
          <div className="px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
                  <p className="text-gray-900">{new Date(voiceAgent.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Goal</h3>
                  {isEditing ? (
                    <Textarea
                      value={editData.content}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      className="text-gray-900 text-sm leading-relaxed min-h-[100px]"
                    />
                  ) : (
                    <p className="text-gray-900 text-sm leading-relaxed">{voiceAgent.content}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Prompt</h3>
                  {isEditing ? (
                    <Textarea
                      value={editData.prompt}
                      onChange={(e) => setEditData({ ...editData, prompt: e.target.value })}
                      className="text-gray-900 text-sm min-h-[100px]"
                      placeholder="Enter prompt..."
                    />
                  ) : (
                    <p className="text-gray-900 text-sm">
                      {voiceAgent.prompt || "[TASK] Your name is {name}, you're a venture capitalist and you are calling a founder. You're..."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Input placeholder="Search" className="w-64" />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    dataset: {selectedDataset ? selectedDataset.title : "Select dataset"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {datasets.map((dataset) => (
                    <DropdownMenuItem key={dataset.id} onClick={() => handleDatasetSelect(dataset)}>
                      {dataset.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="gap-2" onClick={handleRunClick}>
                <Play className="h-4 w-4" />
                Run
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Start New Call
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="px-6">
            <div className="border border-gray-200 rounded-lg bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium px-4">Identifier</TableHead>
                    <TableHead className="font-medium px-4">Input</TableHead>
                    <TableHead className="font-medium px-4">Metadata</TableHead>
                    <TableHead className="font-medium px-4">Status</TableHead>
                    <TableHead className="font-medium px-4">Rating</TableHead>
                    <TableHead className="font-medium px-4">Transcript</TableHead>
                    <TableHead className="font-medium px-4">
                      <div className="flex items-center gap-1">
                        Duration
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-medium px-4">Recording</TableHead>
                    <TableHead className="font-medium px-4">
                      <div className="flex items-center gap-1">
                        Date created
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="px-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDataset ? (
                    datasetItems.length > 0 ? (
                      datasetItems.map((item, index) => {
                        const callData = getCallDataForItem(item.id)
                        return (
                          <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium py-2 px-4">
                              <div className="whitespace-normal leading-tight max-w-[80px] text-sm">{item.identifier}</div>
                            </TableCell>
                            <TableCell className="py-2 px-4">
                              <div className="text-xs text-gray-600 leading-tight max-w-[200px] line-clamp-2">{item.input}</div>
                            </TableCell>
                            <TableCell className="py-2 px-4 text-sm">{item.metadata}</TableCell>
                            <TableCell className="py-2 px-4">
                              <Badge variant="secondary" className={`text-xs ${
                                callData?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                callData?.status === 'failed' ? 'bg-red-100 text-red-800' :
                                callData?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {callData?.status || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 px-4">
                              <Badge variant="secondary" className={`text-xs ${
                                callData?.rating === 'successful' ? 'bg-green-100 text-green-800' :
                                callData?.rating === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {callData?.rating || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 px-4">
                              <div className="text-xs text-gray-600 leading-tight max-w-[150px] line-clamp-2">
                                {callData?.transcript ? callData.transcript.substring(0, 100) + '...' : 'No transcript'}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs py-2 px-4 leading-tight">{callData?.duration || 'N/A'}</TableCell>
                            <TableCell className="py-2 px-4">
                              <Button variant="ghost" size="sm">
                                <Play className="h-3 w-3" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-xs text-gray-600 py-2 px-4 leading-tight max-w-[100px] whitespace-normal">
                              {callData ? new Date(callData.created_at).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-2 px-4">
                              <Button variant="ghost" size="sm" onClick={() => handleExpandClick(index)}>
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                          No dataset items found for the selected dataset.
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        Please select a dataset to view its items.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {selectedCall !== null && (
        <div
          className={`fixed right-0 top-0 bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-1/2 h-full"
          } z-50`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">View Call</h3>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                Identifier: {datasetItems[selectedCall]?.identifier || "N/A"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-4 h-full overflow-y-auto">
              <div className="space-y-4">
                {(() => {
                  const selectedItem = datasetItems[selectedCall]
                  const selectedCallData = selectedItem ? getCallDataForItem(selectedItem.id) : null
                  
                  return (
                    <>
                      <div className="text-sm text-gray-600 mb-4">
                        Duration: {selectedCallData?.duration || 'N/A'} | Status: {selectedCallData?.status || 'N/A'} | Rating: {selectedCallData?.rating || 'N/A'}
                      </div>
                      
                      {selectedCallData?.transcript ? (
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">Call Transcript</h4>
                          {selectedCallData.transcript
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((line, index) => {
                              const match = line.match(/^\[(\w+)\] (.+)$/)
                              if (!match) return null

                              const [, speaker, message] = match
                              const isAI = speaker === "assistant" || speaker === "AI"

                              return (
                                <div key={index} className={`flex ${isAI ? "justify-end" : "justify-start"}`}>
                                  <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                      isAI ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium opacity-90">{isAI ? "AI" : "Human"}</span>
                                    </div>
                                    <div className="text-sm leading-relaxed">{message}</div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-700">Dataset Item Details</h4>
                          <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
                            <div><strong>Identifier:</strong> {selectedItem?.identifier}</div>
                            <div><strong>Input:</strong> {selectedItem?.input}</div>
                            <div><strong>Expected Output:</strong> {selectedItem?.expected_output}</div>
                            <div><strong>Metadata:</strong> {selectedItem?.metadata}</div>
                          </div>
                          <div className="text-center text-gray-500 py-4">
                            No call has been made for this dataset item yet. Click "Run" to make a call.
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dataset Selection Modal */}
      <Dialog open={isDatasetModalOpen} onOpenChange={setIsDatasetModalOpen}>
        <DialogContent className="bg-white sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Select Dataset Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {selectedDataset && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Dataset: {selectedDataset.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedDataset.content}</p>
              </div>
            )}
            
            {selectedDataset ? (
              datasetItems.length > 0 ? (
                <div className="border border-gray-200 rounded-lg bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-medium px-4">Select</TableHead>
                        <TableHead className="font-medium px-4">Identifier</TableHead>
                        <TableHead className="font-medium px-4">Input</TableHead>
                        <TableHead className="font-medium px-4">Expected Output</TableHead>
                        <TableHead className="font-medium px-4">Metadata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datasetItems.map((item) => (
                        <TableRow 
                          key={item.id} 
                          className={`hover:bg-gray-50 cursor-pointer ${selectedDatasetItem?.id === item.id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleDatasetItemSelect(item)}
                        >
                          <TableCell className="px-4">
                            {selectedDatasetItem?.id === item.id ? (
                              <Check className="h-4 w-4 text-blue-600" />
                            ) : (
                              <div className="h-4 w-4 border border-gray-300 rounded"></div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium py-2 px-4">
                            <div className="whitespace-normal leading-tight max-w-[120px] text-sm">{item.identifier}</div>
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="text-xs text-gray-600 leading-tight max-w-[200px] line-clamp-3">{item.input}</div>
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="text-xs text-gray-600 leading-tight max-w-[200px] line-clamp-3">{item.expected_output}</div>
                          </TableCell>
                          <TableCell className="py-2 px-4 text-sm">{item.metadata}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No dataset items found for the selected dataset.
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                Please select a dataset first to view its items.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDatasetSelection}
              className="border-[#dbd9d5]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDatasetSelection}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!selectedDatasetItem}
            >
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}