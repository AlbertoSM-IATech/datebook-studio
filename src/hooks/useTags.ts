import { useState, useCallback } from 'react';
import { Tag, DEFAULT_TAGS } from '@/types/calendar';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);

  const createTag = useCallback((name: string, color?: string): Tag => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: name.trim(),
      color: color || generateRandomColor(),
    };
    
    setTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const updateTag = useCallback((id: string, updates: Partial<Tag>): void => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  }, []);

  const deleteTag = useCallback((id: string): void => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  }, []);

  const getTagById = useCallback((id: string): Tag | undefined => {
    return tags.find(tag => tag.id === id);
  }, [tags]);

  const getTagsByIds = useCallback((ids: string[]): Tag[] => {
    return tags.filter(tag => ids.includes(tag.id));
  }, [tags]);

  const searchTags = useCallback((query: string): Tag[] => {
    const lowerQuery = query.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery)
    );
  }, [tags]);

  return {
    tags,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
    getTagsByIds,
    searchTags,
  };
}

function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue} 70% 50%)`;
}
