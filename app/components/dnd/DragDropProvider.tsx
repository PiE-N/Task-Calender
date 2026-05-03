'use client';

import { ReactNode } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

interface DragDropProviderProps {
  children: ReactNode;
  onDragEnd: (result: DropResult) => void;
}

/**
 * ドラッグ＆ドロップの機能を提供するプロバイダー
 * react-beautiful-dnd のコンテキストをラップして、アプリ全体でドラッグ＆ドロップを可能にする
 */
export default function DragDropProvider({ children, onDragEnd }: DragDropProviderProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
}
