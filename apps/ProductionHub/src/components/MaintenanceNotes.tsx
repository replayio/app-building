import { CommentsSection, type Comment } from "@shared/components/CommentsSection";
import { formatDateTime } from "@shared/utils/date";
import type { EquipmentNote } from "../types";
import { useAppDispatch } from "../hooks";
import { createEquipmentNote } from "../slices/equipmentSlice";

interface MaintenanceNotesProps {
  equipmentId: string;
  notes: EquipmentNote[];
}

export function MaintenanceNotes({ equipmentId, notes }: MaintenanceNotesProps) {
  const dispatch = useAppDispatch();

  const comments: Comment[] = notes.map((note) => ({
    id: note.id,
    authorName: note.author_name,
    authorRole: note.author_role,
    date: formatDateTime(note.created_at),
    text: note.text,
  }));

  const handlePostNote = (text: string) => {
    dispatch(
      createEquipmentNote({
        equipment_id: equipmentId,
        author_name: "Admin",
        author_role: "Operator",
        text,
      })
    );
  };

  return (
    <div data-testid="maintenance-notes">
      <CommentsSection
        title="Maintenance Notes & Comments"
        comments={comments}
        onPostComment={handlePostNote}
        placeholder="Add a note..."
        postButtonLabel="Post Note"
      />
    </div>
  );
}
