'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, ChevronDown } from 'lucide-react';
import { VisualizationData, VisualizationType } from '@/components/canvas/Canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  threadId?: string;
  visualization?: VisualizationData;
}

interface ChatSidebarProps {
  onVisualize: (visualization: VisualizationData) => void;
}

export default function ChatSidebar({ onVisualize }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat thread
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch('/api/chat/create-thread', {
          method: 'POST',
        });
        const data = await response.json();
        setThreadId(data.threadId);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !threadId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          message: input.trim(),
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        threadId: data.threadId,
      };

      console.log('Assistant Message:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVisualization = async (message: Message, type?: VisualizationType) => {
    if (!message.threadId) return;
    
    try {
      console.log('Generating visualization for message:', {
        threadId: message.threadId,
        content: message.content,
        requestedType: type
      });

      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: message.threadId,
          message: message.content,
          type: type
        }),
      });

      const data = await response.json();
      console.log('Visualization API Response:', data);

      if (data.visualization) {
        console.log('Updating message with visualization:', data.visualization);
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, visualization: data.visualization }
            : msg
        ));
        console.log('Calling onVisualize with:', data.visualization);
        onVisualize(data.visualization);
      }
    } catch (error) {
      console.error('Error generating visualization:', error);
    }
  };

  const handleVisualize = async (message: Message, type?: VisualizationType) => {
    if (message.visualization && !type) {
      onVisualize(message.visualization);
    } else {
      await generateVisualization(message, type);
    }
  };

  return (
    <div className="flex flex-col h-full w-[400px] border-l">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              console.log('Rendering message:', message);
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.threadId && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVisualize(message)}
                      >
                        {message.visualization ? 'Show Visualization' : 'Generate Visualization'}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleVisualize(message, 'barChart')}>
                            Bar Chart
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVisualize(message, 'flowChart')}>
                            Flow Chart
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVisualize(message, 'mindMap')}>
                            Mind Map
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div className="flex items-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            size="sm"
            className="h-10 w-10 p-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 