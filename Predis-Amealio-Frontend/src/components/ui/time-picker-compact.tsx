'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerCompactProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export function TimePickerCompact({ value, onChange, onClose }: TimePickerCompactProps) {
  const [hours, setHours] = useState<string>('12');
  const [minutes, setMinutes] = useState<string>('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const period = h >= 12 ? 'PM' : 'AM';
        const display12h = h === 0 ? 12 : h > 12 ? h - 12 : h;
        setHours(String(display12h).padStart(2, '0'));
        setMinutes(String(m).padStart(2, '0'));
        setPeriod(period);
      }
    }
  }, [value]);

  const handleHourChange = (val: string) => {
    const num = parseInt(val) || 0;
    if (num >= 1 && num <= 12) {
      setHours(String(num).padStart(2, '0'));
    }
  };

  const handleMinuteChange = (val: string) => {
    const num = parseInt(val) || 0;
    if (num >= 0 && num <= 59) {
      setMinutes(String(num).padStart(2, '0'));
    }
  };

  const incrementHour = () => {
    const num = (parseInt(hours) % 12) + 1;
    setHours(String(num).padStart(2, '0'));
  };

  const decrementHour = () => {
    const num = (parseInt(hours) - 2 + 12) % 12 + 1;
    setHours(String(num).padStart(2, '0'));
  };

  const incrementMinute = () => {
    const num = (parseInt(minutes) + 5) % 60;
    setMinutes(String(num).padStart(2, '0'));
  };

  const decrementMinute = () => {
    const num = (parseInt(minutes) - 5 + 60) % 60;
    setMinutes(String(num).padStart(2, '0'));
  };

  const handleConfirm = () => {
    const h24 = period === 'AM' 
      ? parseInt(hours) === 12 ? 0 : parseInt(hours)
      : parseInt(hours) === 12 ? 12 : parseInt(hours) + 12;
    
    const timeString = `${String(h24).padStart(2, '0')}:${minutes}`;
    onChange(timeString);
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-white rounded-lg border border-gray-200 min-w-fit">
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Select Time</div>
      
      <div className="flex items-center justify-center gap-2">
        {/* Hours */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={incrementHour}
            className="p-0.5 hover:bg-gray-100 rounded transition"
            type="button"
          >
            <ChevronUp className="w-3 h-3 text-gray-600" />
          </button>
          <Input
            type="text"
            value={hours}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-10 h-9 text-center text-base font-bold border border-gray-300 rounded p-0"
            inputMode="numeric"
            maxLength={2}
          />
          <button
            onClick={decrementHour}
            className="p-0.5 hover:bg-gray-100 rounded transition"
            type="button"
          >
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </button>
        </div>

        {/* Separator */}
        <div className="text-lg font-bold text-gray-400 mb-0.5">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={incrementMinute}
            className="p-0.5 hover:bg-gray-100 rounded transition"
            type="button"
          >
            <ChevronUp className="w-3 h-3 text-gray-600" />
          </button>
          <Input
            type="text"
            value={minutes}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="w-10 h-9 text-center text-base font-bold border border-gray-300 rounded p-0"
            inputMode="numeric"
            maxLength={2}
          />
          <button
            onClick={decrementMinute}
            className="p-0.5 hover:bg-gray-100 rounded transition"
            type="button"
          >
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </button>
        </div>

        {/* AM/PM Toggle */}
        <div className="flex flex-col gap-0.5 ml-1">
          <button
            onClick={() => {
              if (period === 'PM') setPeriod('AM');
            }}
            className={`px-1.5 py-0.5 text-xs font-bold rounded transition ${
              period === 'AM'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            type="button"
          >
            AM
          </button>
          <button
            onClick={() => {
              if (period === 'AM') setPeriod('PM');
            }}
            className={`px-1.5 py-0.5 text-xs font-bold rounded transition ${
              period === 'PM'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            type="button"
          >
            PM
          </button>
        </div>
      </div>

      <Button
        onClick={handleConfirm}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded text-sm transition"
        type="button"
      >
        Confirm
      </Button>
    </div>
  );
}
