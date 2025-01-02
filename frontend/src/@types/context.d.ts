export interface Entry {
  id?: string;
  title: string;
  description: string;
  created_at: Date | string;
  scheduled_for:Date | string;
}
export type EntryContextType = {
  entries: Entry[];
  saveEntry: (entry: Entry) => void;
  updateEntry: (id: string, entryData: Entry) => void;
  deleteEntry: (id: string) => void;
};
