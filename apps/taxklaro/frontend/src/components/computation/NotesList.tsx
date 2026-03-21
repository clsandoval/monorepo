interface Note {
  id: string;
  content: string;
  createdAt: string;
  authorName?: string | null;
}

interface NotesListProps {
  notes: Note[];
  isLoading?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function NotesList({ notes, isLoading }: NotesListProps) {
  if (isLoading) {
    return <div className="text-sm text-zinc-500">Loading notes…</div>;
  }

  if (notes.length === 0) {
    return <div className="text-sm text-zinc-500">No notes yet.</div>;
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div key={note.id} className="rounded-lg bg-zinc-800 border border-zinc-700 p-4 space-y-1">
          <p className="text-sm text-zinc-100 whitespace-pre-wrap">{note.content}</p>
          <p className="text-xs text-zinc-500">
            {note.authorName ? `${note.authorName} · ` : ''}{formatDate(note.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default NotesList;
