"use client";

import { useState, useEffect } from "react";
import { Database, LayoutDashboard, BookText, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLogin } from "@/context/LoginContext";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

interface VoiceAgent {
  id: number;
  title: string;
  content: string;
  prompt?: string;
  category?: string;
  created_at: string;
  user_id?: number;
}

export default function VoiceAgentsPage() {
  const [voiceAgents, setVoiceAgents] = useState<VoiceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { username } = useLogin();
  const [newVoiceAgent, setNewVoiceAgent] = useState({ title: "", content: "", prompt: "" });
  const router = useRouter();

  const navigationItems = [
    { name: "Datasets", path: "/datasets", icon: <Database className="w-5 h-5" /> },
    { name: "Voice Agents", path: "/voice-agents", icon: <Mic className="w-5 h-5" /> },
  ];

  useEffect(() => {
    fetchVoiceAgents();
  }, [username]);

  const fetchVoiceAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/voice-agents/${username}`);
      if (!response.ok) throw new Error("Failed to fetch voice agents");
      const data = await response.json();
      setVoiceAgents(data.voice_agents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoiceAgent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-voice-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, title: newVoiceAgent.title, content: newVoiceAgent.content, prompt: newVoiceAgent.prompt }),
      });
      if (!response.ok) throw new Error("Failed to create voice agent");
      await fetchVoiceAgents();
      setNewVoiceAgent({ title: "", content: "", prompt: "" });
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRowClick = (voiceAgentId: number) => {
    router.push(`/voice-agents/${voiceAgentId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(voiceAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVoiceAgents = voiceAgents.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <div className="w-full flex-1">
        <Topbar navigationItems={[{ text: "Voice Agents", link: "/voice-agents" }]} />
        <div className="flex">
          <Sidebar navItems={navigationItems} />
          <main className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Voice Agents</h1>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                onClick={() => setIsModalOpen(true)}
              >
                Add voice agent
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-white border border-[#dbd9d5] rounded-lg overflow-hidden mt-6">
              {loading ? (
                <div className="p-6">Loading voice agents...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-[30%] text-gray-600 font-semibold">Name</TableHead>
                      <TableHead className="text-gray-600 font-semibold">Goal</TableHead>
                      <TableHead className="w-[20%] text-gray-600 font-semibold">Date Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentVoiceAgents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-[#6e6a65] py-8">No voice agents yet.</TableCell>
                      </TableRow>
                    ) : (
                      currentVoiceAgents.map((va) => (
                        <TableRow
                          key={va.id}
                          className="cursor-pointer hover:bg-[#f9fafb] h-16 bg-white"
                          onClick={() => handleRowClick(va.id)}
                        >
                          <TableCell className="font-medium py-4 pl-6">{va.title}</TableCell>
                          <TableCell className="truncate max-w-[600px] py-4">{va.content}</TableCell>
                          <TableCell className="py-4">{new Date(va.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, voiceAgents.length)} of {voiceAgents.length} voice agents
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-[#dbd9d5]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={
                          currentPage === page
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "border-[#dbd9d5]"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-[#dbd9d5]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Voice Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={newVoiceAgent.title}
                onChange={(e) => setNewVoiceAgent({ ...newVoiceAgent, title: e.target.value })}
                placeholder="Enter voice agent title"
                className="border-[#dbd9d5]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Goal</label>
              <Textarea
                id="content"
                value={newVoiceAgent.content}
                onChange={(e) => setNewVoiceAgent({ ...newVoiceAgent, content: e.target.value })}
                placeholder="Enter voice agent goal"
                className="border-[#dbd9d5] min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">Prompt</label>
              <Textarea
                id="prompt"
                value={newVoiceAgent.prompt}
                onChange={(e) => setNewVoiceAgent({ ...newVoiceAgent, prompt: e.target.value })}
                placeholder="Enter voice agent prompt"
                className="border-[#dbd9d5] min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-[#dbd9d5]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateVoiceAgent}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!newVoiceAgent.title || !newVoiceAgent.content}
            >
              Create Voice Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
