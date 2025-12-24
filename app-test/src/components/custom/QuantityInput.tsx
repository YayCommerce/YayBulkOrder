import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';

interface QuantityInputProps {
  productId: number;
  initialQuantity: number;
  onQuantityChange: (productId: number, quantity: number) => void;
  disabled: boolean;
}

// Quantity input component with local state for smooth typing
export const QuantityInput = ({
  productId,
  initialQuantity,
  onQuantityChange,
  disabled,
}: QuantityInputProps) => {
  const [localValue, setLocalValue] = useState<string>(initialQuantity.toString());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value when initialQuantity changes from outside (e.g., reset)
  useEffect(() => {
    setLocalValue(initialQuantity.toString());
  }, [initialQuantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Handle empty input - allow it temporarily for better UX
    if (value === '' || value === '-') {
      return;
    }

    // Parse the value
    const numValue = parseInt(value, 10);

    // Only update parent if it's a valid number
    if (!isNaN(numValue) && numValue > 0) {
      // Debounce the parent update
      debounceTimerRef.current = setTimeout(() => {
        onQuantityChange(productId, numValue);
      }, 300);
    }
  };

  const handleBlur = () => {
    // Clear any pending debounced update
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Ensure we have a valid value on blur
    const numValue = parseInt(localValue, 10);
    if (isNaN(numValue) || numValue < 1) {
      const validValue = 1;
      setLocalValue(validValue.toString());
      onQuantityChange(productId, validValue);
    } else {
      // Update immediately on blur if value changed
      if (numValue !== initialQuantity) {
        onQuantityChange(productId, numValue);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Input
      type="number"
      min="1"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-20"
      disabled={disabled}
    />
  );
};

