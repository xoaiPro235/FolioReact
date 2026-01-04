import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Plus, Folder, Trash2, ArrowRight, Search, User } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { projects, currentUser, loadProjectData, createProject, deleteProject, workspaceSearchQuery, setWorkspaceSearch, users, loadWorkspaceData } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteInput, setDeleteInput] = useState('');

  // Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Load user data for avatars if not present
  useEffect(() => {
    if (currentUser) {
        loadWorkspaceData(currentUser.id);
    }
  }, [currentUser]);

  // Debounced Search logic could go here, but kept simple for now
  const filteredProjects = projects.filter(p => {
    // Luôn đảm bảo name và description là chuỗi trước khi xử lý
    const safeName = (p.name || '').toLowerCase();
    const safeDesc = (p.description || '').toLowerCase();
    const query = workspaceSearchQuery.toLowerCase();

    return safeName.includes(query) || safeDesc.includes(query);
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProject(newName, newDesc);
    setIsModalOpen(false);
    setNewName(''); setNewDesc('');
  };

  const projectToDelete = projects.find(p => p.id === deleteConfirmId);

  const confirmDelete = () => {
    if (deleteConfirmId && projectToDelete && deleteInput === projectToDelete.name) {
      deleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
      setDeleteInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all your projects in one place.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" /> New Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
            type="text" 
            placeholder="Search projects..." 
            value={workspaceSearchQuery}
            onChange={(e) => setWorkspaceSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const isOwner = project.ownerId === currentUser?.id;
          return (
            <div key={project.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                    <Folder className="w-6 h-6" />
                  </div>
                  {isOwner && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); setDeleteInput(''); }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{project.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-3 flex-1">{project.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((m, i) => {
                        const user = users.find(u => u.id === m.userId);
                        return (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300 overflow-hidden" title={user?.name || m.userId}>
                                {user ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                            </div>
                        );
                      })}
                      {project.members.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">
                              +{project.members.length - 3}
                          </div>
                      )}
                   </div>
                   <button 
                    onClick={() => loadProjectData(project.id)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                   >
                     Open <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 absolute bottom-0 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>
          );
        })}
        
        {filteredProjects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Folder className="w-16 h-16 mb-4 opacity-20" />
                <p>No projects found matching your search.</p>
            </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                <input 
                    required 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                    required 
                    value={newDesc} 
                    onChange={e => setNewDesc(e.target.value)} 
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                    rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Strict Delete Confirmation Modal */}
      {deleteConfirmId && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-red-600 mb-2">Delete Project?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                Type <span className="font-mono font-bold select-all">{projectToDelete.name}</span> to confirm.
            </p>
            <input 
                type="text" 
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={projectToDelete.name}
                className="w-full p-2 border border-slate-300 rounded-lg mb-6 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
              <button 
                onClick={confirmDelete}
                disabled={deleteInput !== projectToDelete.name}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};