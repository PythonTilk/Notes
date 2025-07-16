'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Copy, 
  Link2, 
  Tag, 
  FileText,
  Sparkles,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIInsight {
  id: string;
  type: 'SUMMARY' | 'SUGGESTION' | 'PATTERN' | 'DUPLICATE' | 'IMPROVEMENT' | 'RELATIONSHIP';
  title: string;
  content: string;
  confidence: number;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
  note?: {
    id: string;
    title: string;
  };
  workspace?: {
    id: string;
    name: string;
  };
}

interface Suggestion {
  type: 'improvement' | 'connection' | 'tag' | 'structure';
  title: string;
  description: string;
  confidence: number;
}

interface AIInsightsProps {
  workspaceId?: string;
  noteId?: string;
  onApplySuggestion?: (suggestion: Suggestion) => void;
  onCreateConnection?: (fromId: string, toId: string) => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  workspaceId,
  noteId,
  onApplySuggestion,
  onCreateConnection,
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadInsights();
  }, [workspaceId, noteId]);

  const loadInsights = async () => {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspaceId', workspaceId);
      if (noteId) params.append('noteId', noteId);

      const response = await fetch(`/api/ai/insights?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, noteId }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(prev => [...data.insights, ...prev]);
        setSuggestions(data.suggestions || []);
        toast.success('AI insights generated!');
      } else {
        toast.error('Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Error generating insights');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      await fetch(`/api/ai/insights/${insightId}/read`, { method: 'POST' });
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId ? { ...insight, isRead: true } : insight
        )
      );
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      await fetch(`/api/ai/insights/${insightId}`, { method: 'DELETE' });
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
      toast.success('Insight dismissed');
    } catch (error) {
      console.error('Error dismissing insight:', error);
      toast.error('Failed to dismiss insight');
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'SUMMARY':
        return <FileText className="w-4 h-4" />;
      case 'SUGGESTION':
        return <Lightbulb className="w-4 h-4" />;
      case 'PATTERN':
        return <TrendingUp className="w-4 h-4" />;
      case 'DUPLICATE':
        return <Copy className="w-4 h-4" />;
      case 'IMPROVEMENT':
        return <Sparkles className="w-4 h-4" />;
      case 'RELATIONSHIP':
        return <Link2 className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'SUMMARY':
        return 'bg-blue-100 text-blue-800';
      case 'SUGGESTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'PATTERN':
        return 'bg-green-100 text-green-800';
      case 'DUPLICATE':
        return 'bg-orange-100 text-orange-800';
      case 'IMPROVEMENT':
        return 'bg-purple-100 text-purple-800';
      case 'RELATIONSHIP':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <Link2 className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      case 'structure':
        return <FileText className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Insights
          </h3>
          <Button
            size="sm"
            onClick={generateInsights}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">
              Insights ({insights.filter(i => !i.isRead).length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions ({suggestions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="insights" className="p-4 space-y-3">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No insights yet</p>
                <p className="text-sm">Click the sparkle button to generate AI insights</p>
              </div>
            ) : (
              insights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className={`${!insight.isRead ? 'ring-2 ring-purple-200' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getInsightColor(insight.type)}>
                          {getInsightIcon(insight.type)}
                          <span className="ml-1">{insight.type}</span>
                        </Badge>
                        <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {!insight.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(insight.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissInsight(insight.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-sm">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-2">{insight.content}</p>
                    {insight.note && (
                      <p className="text-xs text-gray-500">
                        Related to: {insight.note.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="p-4 space-y-3">
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No suggestions available</p>
                <p className="text-sm">Generate insights to get AI suggestions</p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-sm font-medium">{suggestion.title}</span>
                      </div>
                      <span className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    <Button
                      size="sm"
                      onClick={() => onApplySuggestion?.(suggestion)}
                      className="w-full"
                    >
                      Apply Suggestion
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};