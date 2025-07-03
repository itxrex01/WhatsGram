class ModuleLoader {
  constructor() {
    this.modules = new Map();
  }

  loadModule(name, moduleExports, context) {
    try {
      // Initialize module with context
      if (typeof moduleExports.init === 'function') {
        moduleExports.init(context);
      }
      
      this.modules.set(name, moduleExports);
      console.log(`📦 Module '${name}' loaded successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load module '${name}':`, error);
      return false;
    }
  }

  getModule(name) {
    return this.modules.get(name);
  }

  getAllModules() {
    return Array.from(this.modules.keys());
  }

  unloadModule(name) {
    if (this.modules.has(name)) {
      const module = this.modules.get(name);
      
      // Call cleanup if available
      if (typeof module.cleanup === 'function') {
        module.cleanup();
      }
      
      this.modules.delete(name);
      console.log(`🗑️ Module '${name}' unloaded`);
      return true;
    }
    return false;
  }
}

module.exports = ModuleLoader;