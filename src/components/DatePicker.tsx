'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  selectedDate?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  maxDate?: Date;
  className?: string;
  forcePosition?: 'above' | 'below' | 'auto';
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function DatePicker({ 
  selectedDate, 
  onChange, 
  placeholder = "dd/mm/aaaa",
  maxDate = new Date(),
  className = "",
  forcePosition = 'auto'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState<'below' | 'above'>('below');
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Atualizar input quando selectedDate muda
  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setInputValue(`${day}/${month}/${year}`);
    } else {
      setInputValue('');
    }
  }, [selectedDate]);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen && inputRef.current) {
        if (forcePosition === 'above') {
          setPosition('above');
        } else if (forcePosition === 'below') {
          setPosition('below');
        } else {
          // Modo auto - calcular baseado no espaço disponível
          const inputRect = inputRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - inputRect.bottom;
          const spaceAbove = inputRect.top;
          const calendarHeight = 400;
          
          if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
            setPosition('above');
          } else {
            setPosition('below');
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleInputClick = () => {
    setIsOpen(true);
    
    // Calcular posição do calendário
    setTimeout(() => {
      if (inputRef.current) {
        if (forcePosition === 'above') {
          setPosition('above');
        } else if (forcePosition === 'below') {
          setPosition('below');
        } else {
          // Modo auto - calcular baseado no espaço disponível
          const inputRect = inputRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - inputRect.bottom;
          const spaceAbove = inputRect.top;
          const calendarHeight = 400; // Altura aproximada do calendário
          
          if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
            setPosition('above');
          } else {
            setPosition('below');
          }
        }
      }
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validar formato dd/mm/aaaa
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Verificar se a data é válida e não é futura
      if (date.getDate() === parseInt(day) && 
          date.getMonth() === parseInt(month) - 1 && 
          date.getFullYear() === parseInt(year) &&
          date <= maxDate) {
        onChange(date);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isDisabled = (date: Date) => {
    return date > maxDate;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm"
        />
      </div>

      {/* Calendário */}
      {isOpen && (
        <div
          ref={calendarRef}
          className={`absolute left-0 bg-slate-800 border border-white/20 rounded-xl shadow-2xl z-[9999] p-4 min-w-[280px] ${
            position === 'above' 
              ? 'bottom-full mb-2' 
              : 'top-full mt-2'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            <div className="text-white font-semibold text-lg">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(({ date, isCurrentMonth }, index) => {
              const isSelectedDay = isSelected(date);
              const isTodayDay = isToday(date);
              const isDisabledDay = isDisabled(date);
              
              return (
                <button
                  key={index}
                  onClick={() => !isDisabledDay && handleDateSelect(date)}
                  disabled={isDisabledDay}
                  className={`
                    w-8 h-8 text-sm rounded-lg transition-all duration-200 flex items-center justify-center
                    ${isCurrentMonth ? 'text-white' : 'text-gray-500'}
                    ${isSelectedDay 
                      ? 'bg-blue-600 text-white font-semibold' 
                      : isTodayDay 
                        ? 'bg-blue-500/30 text-blue-200 font-semibold border border-blue-400'
                        : 'hover:bg-white/10'
                    }
                    ${isDisabledDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
