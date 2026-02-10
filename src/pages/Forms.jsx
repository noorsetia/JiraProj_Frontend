import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { FileText, PlusCircle, Trash2, Save, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'pm_forms';
const RESP_KEY = 'pm_form_responses';

const defaultTemplates = [
  {
    id: 'error-report',
    name: 'Error Report',
    description: 'Report a bug or error in the project (fields inspired by Jira Issue Reporter).',
    fields: [
      { id: 'summary', label: 'Summary', type: 'text', required: true },
      { id: 'description', label: 'Description', type: 'textarea', required: true },
      { id: 'steps', label: 'Steps to reproduce', type: 'textarea' },
      { id: 'severity', label: 'Severity', type: 'select', options: ['Low','Medium','High','Critical'], required: true },
      { id: 'environment', label: 'Environment (OS/Browser)', type: 'text' }
    ]
  },
  {
    id: 'feature-request',
    name: 'Feature Request',
    description: 'Collect ideas / feature requests from users.',
    fields: [
      { id: 'summary', label: 'Summary', type: 'text', required: true },
      { id: 'description', label: 'Description', type: 'textarea' },
      { id: 'motivation', label: 'Why is this important?', type: 'textarea' },
      { id: 'impact', label: 'Impact', type: 'select', options: ['Low','Medium','High'] }
    ]
  }
];

const loadTemplates = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTemplates;
    return JSON.parse(raw);
  } catch {
    return defaultTemplates;
  }
};

const saveTemplates = (templates) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates', e);
  }
};

const saveResponse = (templateId, response) => {
  try {
    const raw = localStorage.getItem(RESP_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[templateId] = all[templateId] || [];
    all[templateId].push({ id: Date.now().toString(), submittedAt: new Date().toISOString(), data: response });
    localStorage.setItem(RESP_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save response', e);
  }
};

const Forms = () => {
  const [templates, setTemplates] = useState(loadTemplates);
  const [selectedId, setSelectedId] = useState(templates[0]?.id || null);
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    saveTemplates(templates);
    if (!selectedId && templates.length) setSelectedId(templates[0].id);
  }, [templates]);

  const selected = templates.find(t => t.id === selectedId);

  const createTemplate = () => {
    const id = `template_${Date.now()}`;
    const t = { id, name: 'Untitled form', description: '', fields: [{ id: 'field_1', label: 'Field 1', type: 'text' }] };
    setTemplates(prev => [t, ...prev]);
    setSelectedId(id);
    setEditing(true);
    toast.success('Created new form template');
  };

  const deleteTemplate = (id) => {
    if (!confirm('Delete this form template?')) return;
    setTemplates(prev => prev.filter(p => p.id !== id));
    toast.success('Template deleted');
  };

  const addField = () => {
    const fid = `field_${Date.now()}`;
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, fields: [...t.fields, { id: fid, label: 'New field', type: 'text' }] } : t));
  };

  const updateField = (fieldId, patch) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== selectedId) return t;
      return { ...t, fields: t.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f) };
    }));
  };

  const removeField = (fieldId) => {
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, fields: t.fields.filter(f => f.id !== fieldId) } : t));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return toast.error('No form selected');
    const resp = {};
    for (const f of selected.fields) {
      resp[f.id] = formValues[f.id] || '';
      if (f.required && !resp[f.id]) {
        return toast.error(`Please fill ${f.label}`);
      }
    }
    saveResponse(selected.id, resp);
    setFormValues({});
    toast.success('Form submitted');
  };

  const importPreset = (preset) => {
    // Add preset as new template
    const id = `template_${Date.now()}`;
    const t = { ...preset, id };
    setTemplates(prev => [t, ...prev]);
    setSelectedId(id);
    setEditing(true);
    toast.success('Imported preset as editable template');
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
          <aside className="col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Forms</h2>
                <p className="text-sm text-slate-500">Templates & presets</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <button onClick={createTemplate} className="w-full flex items-center gap-2 px-3 py-2 rounded bg-primary-600 text-white">
                <PlusCircle className="w-4 h-4" /> Create template
              </button>
            </div>

            <div className="rounded border p-3 bg-white">
              <h3 className="text-sm font-semibold mb-2">Your templates</h3>
              {templates.length === 0 && <div className="text-sm text-slate-500">No templates</div>}
              <ul className="space-y-2">
                {templates.map(t => (
                  <li key={t.id} className={`p-2 rounded cursor-pointer hover:bg-slate-50 ${t.id === selectedId ? 'bg-slate-100' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div onClick={() => { setSelectedId(t.id); setEditing(false); }}>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button title="Delete" onClick={() => deleteTemplate(t.id)} className="text-rose-500 p-1 rounded hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded border p-3 bg-white">
              <h3 className="text-sm font-semibold mb-2">Presets (Jira-like)</h3>
              <div className="space-y-2">
                <button onClick={() => importPreset(defaultTemplates[0])} className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Import Error Report</button>
                <button onClick={() => importPreset(defaultTemplates[1])} className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Import Feature Request</button>
              </div>
            </div>
          </aside>

          <main className="col-span-6">
            {!selected && <div className="p-4 bg-white rounded">Select or create a template to edit or fill.</div>}

            {selected && (
              <div className="bg-white rounded border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selected.name}</h3>
                    <p className="text-sm text-slate-500">{selected.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(!editing)} className="px-3 py-2 rounded bg-slate-100">{editing ? 'Preview' : 'Edit'}</button>
                    <button onClick={() => { saveTemplates(templates); toast.success('Saved'); }} className="px-3 py-2 rounded bg-slate-100"><Save className="w-4 h-4" /></button>
                  </div>
                </div>

                {editing ? (
                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <div className="text-xs text-slate-500">Form name</div>
                      <input className="w-full p-2 border rounded" value={selected.name} onChange={(e) => setTemplates(prev => prev.map(t => t.id === selected.id ? { ...t, name: e.target.value } : t))} />
                    </label>
                    <label className="block">
                      <div className="text-xs text-slate-500">Description</div>
                      <input className="w-full p-2 border rounded" value={selected.description} onChange={(e) => setTemplates(prev => prev.map(t => t.id === selected.id ? { ...t, description: e.target.value } : t))} />
                    </label>

                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Fields</h4>
                        <div className="flex items-center gap-2">
                          <button onClick={addField} className="px-2 py-1 rounded bg-primary-600 text-white text-sm flex items-center gap-2"><PlusCircle className="w-4 h-4"/> Add field</button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {selected.fields.map(f => (
                          <div key={f.id} className="p-2 border rounded">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <input className="w-full p-1 border rounded mb-1" value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} />
                                <div className="flex gap-2">
                                  <select value={f.type} onChange={(e) => updateField(f.id, { type: e.target.value })} className="p-1 border rounded text-sm">
                                    <option value="text">Text</option>
                                    <option value="textarea">Textarea</option>
                                    <option value="select">Select</option>
                                  </select>
                                  <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={!!f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} /> Required</label>
                                </div>
                              </div>
                              <div>
                                <button onClick={() => removeField(f.id)} className="p-2 rounded hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </div>
                            {f.type === 'select' && (
                              <div className="mt-2">
                                <div className="text-xs text-slate-500">Options (comma separated)</div>
                                <input className="w-full p-1 border rounded mt-1" value={(f.options || []).join(',')} onChange={(e) => updateField(f.id, { options: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {selected.fields.map(f => (
                      <div key={f.id}>
                        <label className="block text-sm font-medium">{f.label}{f.required ? ' *' : ''}</label>
                        {f.type === 'text' && (
                          <input className="w-full p-2 border rounded" value={formValues[f.id] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [f.id]: e.target.value }))} />
                        )}
                        {f.type === 'textarea' && (
                          <textarea className="w-full p-2 border rounded" rows={4} value={formValues[f.id] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [f.id]: e.target.value }))} />
                        )}
                        {f.type === 'select' && (
                          <select className="w-full p-2 border rounded" value={formValues[f.id] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [f.id]: e.target.value }))}>
                            <option value="">Select...</option>
                            {(f.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center gap-2">
                      <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white">Submit</button>
                      <button type="button" onClick={() => { setFormValues({}); toast('Cleared') }} className="px-4 py-2 rounded bg-slate-100">Clear</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </main>

          <aside className="col-span-3">
            <div className="bg-white rounded border p-4">
              <h4 className="font-semibold">Preview & Responses</h4>
              {!selected && <div className="text-sm text-slate-500 mt-2">Select a template</div>}
              {selected && (
                <div className="mt-3">
                  <div className="text-sm text-slate-500">Preview</div>
                  <div className="mt-2 border rounded p-3">
                    <div className="font-medium">{selected.name}</div>
                    <div className="text-xs text-slate-400">{selected.description}</div>
                    <div className="mt-2 space-y-2">
                      {selected.fields.map(f => (
                        <div key={f.id} className="text-sm">
                          <div className="font-medium">{f.label}</div>
                          <div className="text-xs text-slate-400">{f.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Responses</div>
                      <button onClick={() => { localStorage.removeItem(RESP_KEY); toast.success('Responses cleared'); }} className="text-xs text-rose-500">Clear all</button>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">Saved responses are stored locally.</div>
                    <div className="mt-2">
                      {/* list responses */}
                      {(() => {
                        try {
                          const raw = localStorage.getItem(RESP_KEY);
                          const all = raw ? JSON.parse(raw) : {};
                          const list = all[selected.id] || [];
                          if (list.length === 0) return <div className="text-sm text-slate-400 mt-2">No responses yet</div>;
                          return <ul className="space-y-2 mt-2">{list.map(r => (
                            <li key={r.id} className="p-2 border rounded">
                              <div className="text-xs text-slate-400">{new Date(r.submittedAt).toLocaleString()}</div>
                              <pre className="text-xs mt-1 max-h-40 overflow-auto">{JSON.stringify(r.data, null, 2)}</pre>
                            </li>
                          ))}</ul>;
                        } catch (e) {
                          return <div className="text-sm text-red-500">Failed to load responses</div>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Forms;
