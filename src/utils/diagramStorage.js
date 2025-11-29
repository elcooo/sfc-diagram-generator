// LocalStorage key for diagrams
const STORAGE_KEY = 'sfc-diagrams';
const LAST_SESSION_KEY = 'sfc-last-session';

// Get all saved diagrams
export const getSavedDiagrams = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading diagrams:', e);
    return [];
  }
};

// Save a new diagram or update existing
export const saveDiagram = (name, code, nodes, edges) => {
  try {
    const diagrams = getSavedDiagrams();
    const timestamp = Date.now();
    
    // Check if diagram with this name exists
    const existingIndex = diagrams.findIndex(d => d.name === name);
    
    const diagram = {
      id: existingIndex >= 0 ? diagrams[existingIndex].id : `diagram-${timestamp}`,
      name,
      code,
      nodes,
      edges,
      createdAt: existingIndex >= 0 ? diagrams[existingIndex].createdAt : timestamp,
      updatedAt: timestamp,
    };
    
    if (existingIndex >= 0) {
      diagrams[existingIndex] = diagram;
    } else {
      diagrams.unshift(diagram); // Add to beginning
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));
    return diagram;
  } catch (e) {
    console.error('Error saving diagram:', e);
    return null;
  }
};

// Delete a diagram by id
export const deleteDiagram = (id) => {
  try {
    const diagrams = getSavedDiagrams();
    const filtered = diagrams.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting diagram:', e);
    return false;
  }
};

// Get a diagram by id
export const getDiagramById = (id) => {
  const diagrams = getSavedDiagrams();
  return diagrams.find(d => d.id === id) || null;
};

// Save last session (auto-save)
export const saveLastSession = (code, nodes, edges) => {
  try {
    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({
      code,
      nodes,
      edges,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.error('Error saving last session:', e);
  }
};

// Load last session
export const loadLastSession = () => {
  try {
    const data = localStorage.getItem(LAST_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading last session:', e);
    return null;
  }
};

// Format date for display
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

