'use client';
import { useState } from 'react';
import { MapPin, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PickupPoint {
  id?: string;
  name: string;
  address?: string;
  sequence_order: number;
}

interface PickupPointsManagerProps {
  pickupPoints: PickupPoint[];
  onChange: (points: PickupPoint[]) => void;
  readonly?: boolean;
}

export default function PickupPointsManager({
  pickupPoints,
  onChange,
  readonly = false,
}: PickupPointsManagerProps) {
  const [newPointName, setNewPointName] = useState('');
  const [newPointAddress, setNewPointAddress] = useState('');

  const handleAdd = () => {
    if (!newPointName.trim()) return;

    const newPoint: PickupPoint = {
      name: newPointName.trim(),
      address: newPointAddress.trim() || undefined,
      sequence_order: pickupPoints.length,
    };

    onChange([...pickupPoints, newPoint]);
    setNewPointName('');
    setNewPointAddress('');
  };

  const handleRemove = (index: number) => {
    const updated = pickupPoints.filter((_, i) => i !== index);
    // Update sequence order
    updated.forEach((point, i) => {
      point.sequence_order = i;
    });
    onChange(updated);
  };

  if (readonly) {
    return (
      <div className="space-y-2">
        {pickupPoints.map((point, index) => (
          <div
            key={point.id || index}
            className="flex items-center gap-3 p-3 bg-muted rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{point.name}</p>
              {point.address && (
                <p className="text-xs text-muted-foreground">{point.address}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Pickup Points</Label>
      <p className="text-sm text-muted-foreground">
        Add stops where passengers can be picked up along your route
      </p>

      {/* Existing points */}
      <div className="space-y-2">
        {pickupPoints.map((point, index) => (
          <div
            key={point.id || index}
            className="flex items-center gap-3 p-3 bg-muted rounded-lg"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{point.name}</p>
              {point.address && (
                <p className="text-xs text-muted-foreground">{point.address}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new point */}
      <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Add a pickup point</span>
        </div>
        <Input
          placeholder="Point name (e.g., Metro Station)"
          value={newPointName}
          onChange={(e) => setNewPointName(e.target.value)}
        />
        <Input
          placeholder="Address (optional)"
          value={newPointAddress}
          onChange={(e) => setNewPointAddress(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newPointName.trim()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Point
        </Button>
      </div>
    </div>
  );
}
