'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface AutocompleteItem {
  id: string;
  text: string;
  highlighted?: boolean;
}

interface AutocompletePortalProps {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  items: AutocompleteItem[];
  onSelect: (item: AutocompleteItem) => void;
  onClose: () => void;
  renderItem?: (item: AutocompleteItem, index: number, isSelected: boolean) => React.ReactNode;
  selectedIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const AutocompletePortal: React.FC<AutocompletePortalProps> = ({
  anchorRef,
  open,
  items,
  onSelect,
  onClose,
  renderItem,
  selectedIndex = -1,
  onKeyDown
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const portalRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !open) return;

    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top + rect.height + 8, // 8px de margem (mt-2)
      left: rect.left,
      width: rect.width
    });
  }, [anchorRef, open]);

  // Atualizar posição quando necessário
  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return;
    }

    updatePosition();
    setIsVisible(true);

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, updatePosition]);

  // Fechar com Esc
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Fechar com clique fora
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        portalRef.current &&
        !portalRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorRef]);

  // Renderizar item padrão se não fornecido
  const defaultRenderItem = (item: AutocompleteItem, index: number, isSelected: boolean) => (
    <button
      key={item.id}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(item)}
      className={`w-full px-4 py-3 text-left text-white transition-all duration-200 flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl ${
        isSelected 
          ? 'bg-blue-500/30 border-l-2 border-blue-400' 
          : 'hover:bg-blue-500/20'
      }`}
      role="option"
      aria-selected={isSelected}
    >
      <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="flex-1">{item.text}</span>
    </button>
  );

  if (!open || !isVisible || items.length === 0) {
    return null;
  }

  const portalContent = (
    <div
      ref={portalRef}
      className="fixed bg-gray-900/95 backdrop-blur-sm border border-white/30 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
      role="listbox"
      aria-label="Sugestões de busca"
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => 
        renderItem ? renderItem(item, index, index === selectedIndex) : defaultRenderItem(item, index, index === selectedIndex)
      )}
    </div>
  );

  return createPortal(portalContent, document.body);
};

export default AutocompletePortal;
