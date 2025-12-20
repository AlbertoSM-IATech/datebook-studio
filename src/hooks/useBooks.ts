import { useState, useCallback } from 'react';
import { Book } from '@/types/calendar';
import { MOCK_BOOKS } from '@/data/mockData';

export function useBooks() {
  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [isLoading] = useState(false);

  const getBookById = useCallback((id: string): Book | undefined => {
    return books.find(book => book.id === id);
  }, [books]);

  const getBooksByIds = useCallback((ids: string[]): Book[] => {
    return books.filter(book => ids.includes(book.id));
  }, [books]);

  const searchBooks = useCallback((query: string): Book[] => {
    const lowerQuery = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowerQuery)
    );
  }, [books]);

  return {
    books,
    isLoading,
    getBookById,
    getBooksByIds,
    searchBooks,
  };
}
