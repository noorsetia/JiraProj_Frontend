import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Upload,
  FileCode,
  Sparkles,
  Loader2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ALLOWED_EXTENSIONS = [
  '.js',
  '.jsx',
  '.py',
  '.java',
  '.html',
  '.css',
  '.json'
];

const Files = () => {
  const { id: projectId } = useParams();

  const [selectedFile, setSelectedFile] = useState(null);
  const [codePreview, setCodePreview] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension =
      '.' + file.name.split('.').pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(
        `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
      setSelectedFile(null);
      setCodePreview('');
      setExplanation('');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2 MB.');
      setSelectedFile(null);
      setCodePreview('');
      setExplanation('');
      return;
    }

    setError('');
    setExplanation('');
    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = (e) => {
      setCodePreview(e.target?.result || '');
    };

    reader.onerror = () => {
      setError('Failed to read the selected file.');
      setCodePreview('');
    };

    reader.readAsText(file);
  };

  const handleExplain = async () => {
    if (!selectedFile) {
      toast.error('Please select a code file first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setExplanation('');

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post(
        '/files/explain',
        formData
      );

      console.log('Code AI Response:', response);

      const result =
        response?.data?.data?.explanation ||
        response?.data?.explanation ||
        '';

      setExplanation(result);

      toast.success('Code explanation generated');
    } catch (err) {
      console.error('Failed to explain code:', err);

      const message =
        err.response?.data?.message ||
        'Failed to generate code explanation';

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              to={`/projects/${projectId}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
            >
              <ArrowLeft size={18} />
              Back to Project
            </Link>

            <h1 className="text-2xl font-bold text-gray-900">
              Code Files
            </h1>

            <p className="text-gray-600 mt-1">
              Upload a code file and use AI to understand it.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Code File
          </h2>

          <label
            htmlFor="code-file"
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <Upload
              size={40}
              className="text-purple-600 mb-3"
            />

            <span className="font-medium text-gray-800">
              Click to select a code file
            </span>

            <span className="text-sm text-gray-500 mt-1">
              JS, JSX, Python, Java, HTML, CSS, JSON
            </span>

            <span className="text-xs text-gray-400 mt-1">
              Maximum size: 2 MB
            </span>

            <input
              id="code-file"
              type="file"
              className="hidden"
              accept=".js,.jsx,.py,.java,.html,.css,.json"
              onChange={handleFileChange}
            />
          </label>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              <AlertCircle size={20} className="mt-0.5" />

              <span>{error}</span>
            </div>
          )}

          {/* Selected file */}
          {selectedFile && (
            <div className="mt-4 bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileCode
                  size={28}
                  className="text-purple-600"
                />

                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <button
                  onClick={handleExplain}
                  disabled={loading}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Explain with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Code Preview */}
        {codePreview && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCode
                size={20}
                className="text-purple-600"
              />

              <h2 className="text-lg font-semibold">
                Code Preview
              </h2>
            </div>

            <pre className="bg-gray-900 text-gray-100 rounded-lg p-5 overflow-x-auto max-h-[500px] overflow-y-auto text-sm leading-6">
              <code>{codePreview}</code>
            </pre>
          </div>
        )}

        {/* AI Explanation */}
        {explanation && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles
                size={22}
                className="text-purple-600"
              />

              <h2 className="text-lg font-semibold text-gray-900">
                AI Code Explanation
              </h2>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-6">
                {explanation}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;