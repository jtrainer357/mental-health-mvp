'use client';

import * as React from 'react';
import { Add01Icon, Edit02Icon, CheckmarkCircle01Icon } from 'hugeicons-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Card, CardContent } from '@/design-system/components/ui/card';
import { Text } from '@/design-system/components/ui/typography';
import { Separator } from '@/design-system/components/ui/separator';
import { type SessionAddendum } from '@/lib/session/types';

export interface AddendumSectionProps {
  addendums: SessionAddendum[];
  isSignedNote: boolean;
  authorName: string;
  authorCredentials?: string;
  onAddAddendum?: (content: string) => Promise<void>;
  className?: string;
}

/**
 * Addendum Section Component
 * Displays existing addendums and allows adding new ones to signed notes
 */
export function AddendumSection({
  addendums,
  isSignedNote,
  authorName,
  authorCredentials,
  onAddAddendum,
  className,
}: AddendumSectionProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleStartAdding = () => {
    setIsAdding(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setContent('');
  };

  const handleSave = async () => {
    if (!content.trim() || !onAddAddendum) return;

    setIsSaving(true);
    try {
      await onAddAddendum(content.trim());
      setContent('');
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section header */}
      {(addendums.length > 0 || isSignedNote) && (
        <div className="flex items-center justify-between">
          <Text weight="medium" className="text-foreground-strong">
            Addendums
          </Text>
          {isSignedNote && !isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartAdding}
              className="gap-2"
            >
              <Add01Icon size={16} />
              Add Addendum
            </Button>
          )}
        </div>
      )}

      {/* Existing addendums */}
      {addendums.map((addendum, index) => (
        <Card key={addendum.id} className="border-l-4 border-l-primary/50">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-foreground-muted">
              <Edit02Icon size={14} />
              <span>
                Addendum — {formatDate(addendum.createdAt)} by{' '}
                <span className="font-medium text-foreground">
                  {addendum.authorName}
                  {addendum.authorCredentials && `, ${addendum.authorCredentials}`}
                </span>
              </span>
            </div>
            <Text className="whitespace-pre-wrap">{addendum.content}</Text>
          </CardContent>
        </Card>
      ))}

      {/* Add addendum form */}
      {isAdding && (
        <Card className="border-2 border-dashed border-primary/50">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <Edit02Icon size={14} />
              <span>
                New Addendum — {new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })} by{' '}
                <span className="font-medium text-foreground">
                  {authorName}
                  {authorCredentials && `, ${authorCredentials}`}
                </span>
              </span>
            </div>

            <Textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter addendum content..."
              rows={4}
              className="resize-y"
              disabled={isSaving}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!content.trim() || isSaving}
                className="gap-2"
              >
                <CheckmarkCircle01Icon size={16} />
                {isSaving ? 'Saving...' : 'Save Addendum'}
              </Button>
            </div>

            <Text size="xs" muted>
              Once saved, addendums cannot be edited or deleted.
            </Text>
          </CardContent>
        </Card>
      )}

      {/* Empty state for non-signed notes */}
      {!isSignedNote && addendums.length === 0 && (
        <Text size="sm" muted className="text-center py-4">
          Addendums can only be added to signed notes.
        </Text>
      )}
    </div>
  );
}
