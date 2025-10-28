'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, MoreVertical, Edit, Trash2, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface BreedingRecord {
  id: string;
  breedingDate: string;
  breedingDay: number;
  breedingMethod: string;
  studName?: string;
  studRegistration?: string;
  semenQuality?: string;
  motility?: number;
  concentration?: string;
  progesteroneLevelAtBreeding?: string;
  notes?: string;
  stud?: {
    name: string;
    registeredName?: string;
  };
}

interface BreedingRecordsListProps {
  records: BreedingRecord[];
  onEdit?: (record: BreedingRecord) => void;
  onDelete?: (recordId: string) => void;
  canEdit?: boolean;
}

const BREEDING_METHOD_LABELS: Record<string, string> = {
  natural: 'Natural Tie',
  ai_fresh: 'AI - Fresh',
  ai_chilled: 'AI - Chilled',
  ai_frozen: 'AI - Frozen',
  tci: 'TCI',
  surgical: 'Surgical AI',
};

const BREEDING_METHOD_COLORS: Record<string, string> = {
  natural: 'bg-green-500',
  ai_fresh: 'bg-blue-500',
  ai_chilled: 'bg-cyan-500',
  ai_frozen: 'bg-purple-500',
  tci: 'bg-orange-500',
  surgical: 'bg-red-500',
};

export function BreedingRecordsList({
  records,
  onEdit,
  onDelete,
  canEdit = true,
}: BreedingRecordsListProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium mb-2">No Breeding Records</p>
        <p className="text-sm">Add breeding information to track mating dates and details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records
        .sort((a, b) => new Date(b.breedingDate).getTime() - new Date(a.breedingDate).getTime())
        .map((record) => (
          <Card key={record.id} className="shadow-card bg-surface-secondary border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge 
                      className={`${BREEDING_METHOD_COLORS[record.breedingMethod] || 'bg-gray-500'} text-white`}
                    >
                      {BREEDING_METHOD_LABELS[record.breedingMethod] || record.breedingMethod}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      Day {record.breedingDay}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(record.breedingDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {/* Stud Information */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Stud</p>
                    <p className="font-semibold text-lg">
                      {record.stud?.name || record.studName || 'Unknown'}
                    </p>
                    {(record.stud?.registeredName || record.studRegistration) && (
                      <p className="text-sm text-muted-foreground">
                        {record.stud?.registeredName || record.studRegistration}
                      </p>
                    )}
                  </div>

                  {/* Progesterone Level */}
                  {record.progesteroneLevelAtBreeding && (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Progesterone at Breeding</p>
                        <p className="font-bold text-purple-600">
                          {parseFloat(record.progesteroneLevelAtBreeding).toFixed(1)} ng/mL
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Semen Details (for AI) */}
                  {(record.semenQuality || record.motility || record.concentration) && (
                    <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      {record.semenQuality && (
                        <div>
                          <p className="text-xs text-muted-foreground">Quality</p>
                          <p className="text-sm font-medium capitalize">{record.semenQuality}</p>
                        </div>
                      )}
                      {record.motility && (
                        <div>
                          <p className="text-xs text-muted-foreground">Motility</p>
                          <p className="text-sm font-medium">{record.motility}%</p>
                        </div>
                      )}
                      {record.concentration && (
                        <div>
                          <p className="text-xs text-muted-foreground">Concentration</p>
                          <p className="text-sm font-medium">{record.concentration}M/mL</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {record.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm italic">{record.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions Menu */}
                {canEdit && (onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Record
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this breeding record?')) {
                              onDelete(record.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Record
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
