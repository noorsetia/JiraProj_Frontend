import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Save,
  Trash2,
  Sparkles,
  Edit3,
  Eye,
  FileText,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Notes = () => {
  const { id: projectId } = useParams();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [aiResult, setAiResult] = useState('');
  const [aiMode, setAiMode] = useState("");

  // ==========================================
  // FETCH NOTES
  // ==========================================

  const fetchNotes = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/notes/project/${projectId}`
      );

      setNotes(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);

      toast.error(
        error.response?.data?.message ||
          'Failed to load notes'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchNotes();
    }
  }, [projectId]);

  // ==========================================
  // NEW NOTE
  // ==========================================

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setAiResult('');
    setIsEditing(true);
  };

  // ==========================================
  // SELECT NOTE
  // ==========================================

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setAiResult('');
    setIsEditing(false);
  };

  // ==========================================
  // SAVE NOTE
  // ==========================================

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some note content');
      return;
    }

    try {
      setSaving(true);

      let response;

      if (selectedNote) {
        response = await api.put(
          `/notes/${selectedNote._id}`,
          {
            title,
            content
          }
        );
      } else {
        response = await api.post(
          '/notes',
          {
            title,
            content,
            projectId
          }
        );
      }

      const savedNote = response.data?.data;

      toast.success(
        selectedNote
          ? 'Note updated successfully'
          : 'Note created successfully'
      );

      await fetchNotes();

      if (savedNote) {
        setSelectedNote(savedNote);
        setTitle(savedNote.title);
        setContent(savedNote.content);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);

      toast.error(
        error.response?.data?.message ||
          'Failed to save note'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE NOTE
  // ==========================================

  const handleDelete = async () => {
    if (!selectedNote) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/notes/${selectedNote._id}`
      );

      toast.success('Note deleted successfully');

      setSelectedNote(null);
      setTitle('');
      setContent('');
      setAiResult('');
      setIsEditing(false);

      await fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);

      toast.error(
        error.response?.data?.message ||
          'Failed to delete note'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // AI EXPLAIN
  // ==========================================

  const handleExplain = async () => {
  if (!selectedNote?.content?.trim()) {
    toast.error("Please add some content first");
    return;
  }

  try {
    setAiLoading(true);
    setAiMode("explain");
    setAiResult("");

    const response = await api.post("/gemini/explain", {
      content: selectedNote.content,
      type: "markdown",
    });

    console.log("AI Explain Response:", response);

    const result =
      response?.data?.data?.response ||
      response?.data?.response ||
      response?.data?.data ||
      response?.data ||
      "";

    setAiResult(
      typeof result === "string"
        ? result
        : JSON.stringify(result, null, 2)
    );

    toast.success("AI explanation generated");
  } catch (error) {
    console.error("Failed to explain note:", error);
    toast.error(
      error.response?.data?.message ||
      "Failed to generate explanation"
    );
  } finally {
    setAiLoading(false);
  }
};

  // ==========================================
  // AI IMPROVE
  // ==========================================

  const handleImprove = async () => {
  if (!selectedNote?.content?.trim()) {
    toast.error("Please add some content first");
    return;
  }

  try {
    setAiLoading(true);
    setAiMode("improve");
    setAiResult("");

    const response = await api.post("/gemini/docs", {
      content: selectedNote.content,
    });

    console.log("AI Improve Response:", response);

    const result =
      response?.data?.data?.response ||
      response?.data?.response ||
      response?.data?.data ||
      response?.data ||
      "";

    setAiResult(
      typeof result === "string"
        ? result
        : JSON.stringify(result, null, 2)
    );

    toast.success("AI improvements generated");
  } catch (error) {
    console.error("Failed to improve note:", error);
    toast.error(
      error.response?.data?.message ||
      "Failed to generate improvements"
    );
  } finally {
    setAiLoading(false);
  }
};

  // ==========================================
  // SIMPLE MARKDOWN PREVIEW
  // ==========================================

  const renderMarkdown = (text) => {
    if (!text) {
      return '';
    }

    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };
  // ==========================================
  // DISPLAY THE RESULT
  // ==========================================
  {(aiLoading || aiResult) && (
  <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
        <Sparkles size={20} />
        {aiMode === "explain"
          ? "AI Explanation"
          : "AI Improvements"}
      </h3>

      {aiLoading && (
        <Loader2
          size={20}
          className="animate-spin text-purple-600"
        />
      )}
    </div>

    {aiLoading ? (
      <p className="text-gray-600">
        AI is thinking...
      </p>
    ) : (
      <div className="bg-white rounded-lg p-4 border border-purple-100">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-6">
          {aiResult}
        </pre>
      </div>
    )}
  </div>
)}
  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${projectId}`}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              title="Back to project"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText size={24} />
                Project Notes
              </h1>

              <p className="text-gray-500 text-sm">
                Create and manage Markdown notes with AI assistance.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleNewNote}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          <Plus size={18} />
          New Note
        </button>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NOTES LIST */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="font-semibold mb-4">
            Notes ({notes.length})
          </h2>

          {notes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <FileText
                size={36}
                className="mx-auto mb-3 opacity-50"
              />

              <p>No notes yet.</p>

              <button
                onClick={handleNewNote}
                className="mt-3 text-purple-600 font-medium"
              >
                Create your first note
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  key={note._id}
                  onClick={() =>
                    handleSelectNote(note)
                  }
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedNote?._id === note._id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium truncate">
                    {note.title}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(
                      note.updatedAt
                    ).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* EDITOR */}

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {!selectedNote && !isEditing ? (
              <div className="text-center py-20 text-gray-500">
                <FileText
                  size={48}
                  className="mx-auto mb-4 opacity-40"
                />

                <h2 className="text-lg font-semibold text-gray-700">
                  Select a note
                </h2>

                <p className="mt-1">
                  Or create a new Markdown note.
                </p>

                <button
                  onClick={handleNewNote}
                  className="mt-5 px-4 py-2 rounded-lg bg-purple-600 text-white"
                >
                  <Plus
                    size={16}
                    className="inline mr-2"
                  />
                  New Note
                </button>
              </div>
            ) : (
              <>
                {/* TITLE */}

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Note title"
                  className="w-full text-xl font-semibold border-b border-gray-200 pb-3 mb-4 outline-none focus:border-purple-500 disabled:bg-transparent"
                />

                {/* CONTENT */}

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder={`Write your Markdown note here...

# Project Architecture

## Frontend
React + Vite

## Backend
Node.js + Express

## Database
MongoDB`}
                  className="w-full min-h-[320px] resize-y p-4 border border-gray-200 rounded-lg font-mono text-sm outline-none focus:border-purple-500 disabled:bg-gray-50"
                />

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-2 mt-4">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save size={16} />
                      )}

                      {saving
                        ? 'Saving...'
                        : 'Save Note'}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setIsEditing(true)
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  )}

                  <button
                    onClick={handleExplain}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Sparkles size={16} />
                    )}

                    Explain with AI
                  </button>

                  <button
                    onClick={handleImprove}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                  >
                    <Sparkles size={16} />
                    Improve with AI
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    Delete
                  </button>
                </div>

                {/* PREVIEW */}

                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={17} />

                    <h3 className="font-semibold">
                      Markdown Preview
                    </h3>
                  </div>

                  <div
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        renderMarkdown(content)
                    }}
                  />
                </div>

                {/* AI RESULT */}

                {aiResult && (
                  <div className="mt-6 p-5 rounded-lg border border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles
                        size={18}
                        className="text-purple-600"
                      />

                      <h3 className="font-semibold text-purple-800">
                        AI Result
                      </h3>
                    </div>

                    <div
                      className="text-sm leading-6"
                      dangerouslySetInnerHTML={{
                        __html:
                          renderMarkdown(aiResult)
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
