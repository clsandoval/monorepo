import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AddNoteFormProps {
  onAdd?: (content: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function AddNoteForm({ onAdd, isSubmitting }: AddNoteFormProps) {
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await onAdd?.(content.trim());
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note…"
        rows={3}
        className="resize-none bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="h-8 px-4 text-xs"
        >
          Add Note
        </Button>
      </div>
    </form>
  );
}

export default AddNoteForm;
