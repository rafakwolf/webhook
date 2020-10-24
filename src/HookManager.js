const {default: axios} = require('axios');
const path = require('path');
const events = require('./events');
const fs = require('fs');

/**
 * Hook record definition
 * @typedef {Object} Hook
 * @property {string} hookUrl
 */

/**
 * HookManager implementation
 */
class HookManager {
    /**
     * @param {string} [hooksFileName]
     */
    constructor(hooksFileName) {
        const hooksDbFileName = hooksFileName || 'hooks.json';
        this.HOOKS_DB_FILE = path.join(__dirname, '..', hooksDbFileName);

        events.on('hook-dispatch', (eventData) => {
            const {url, data} = eventData;
            this._hook(url, data);
        });
    }

    /**
     * Clean all registered hooks
     * @returns {void}
     */
    cleanHooks() {
        try {
            fs.unlinkSync(this.HOOKS_DB_FILE);    
        } catch (error) {
            // Ignore if the file doesn't exist   
        }        
    }    

    /**
     * Returns registered hooks
     * @returns {Array<Hook>}
     */
    readHooks() {
        if (fs.existsSync(this.HOOKS_DB_FILE)) {
            return JSON.parse(fs.readFileSync(this.HOOKS_DB_FILE, {encoding: 'utf8'}));
        }
        return [];
    }

    /**
     * Returns hooks without the one that was passed 
     * @param {string} hookUrl
     * @return {Array<Hook>}
     * @private
     */
    _removeHookIfExists(hookUrl) {
        const hooks = this.readHooks();

        const index = hooks.findIndex(h => h.hookUrl === hookUrl);
        if (index > -1) {
           hooks.splice(index, 1);
        }
        
        return hooks;
    }

    /**
     * Remove one hook 
     * @param {string} hookUrl
     */
    removeHook(hookUrl) {
        const hooks = this._removeHookIfExists(hookUrl);
        fs.writeFileSync(this.HOOKS_DB_FILE, JSON.stringify(hooks), {encoding: 'utf8'});
    }    

    /**
     * Registers the requested hooks to a json file
     * NOTE: In case of duplication the already existing one will be replaced.
     * @param {string} hookUrl
     */
    writeHook(hookUrl) {
        const hooks = this._removeHookIfExists(hookUrl);
        hooks.push({hookUrl});
        fs.writeFileSync(this.HOOKS_DB_FILE, JSON.stringify(hooks), {encoding: 'utf8'});        
    }
    
    /**
     * Notifies a registered hook  
     * @param {string} url
     * @param {Object} data
     * @private
     */
    _hook(url, data) {
        axios({
            baseURL: url,
            data,
            method: 'POST'
        })
        .then(() => console.info(`hook ${url} executed sucessfully`))
        .catch(console.error);
    }

    /**
     * Reads all registered hooks and notify them
     * @param {Object} data
     */
    dispathHooks(data) {
        const hooks = this.readHooks();
        for (const hook of hooks) {
            const {hookUrl} = hook;
            events.emit('hook-dispatch', {url: hookUrl, data});
        }
    }

    /**
     * Notifies a specific hook
     * @param {string} hookUrl
     * @param {Object} data
     */
    dispathHook(hookUrl, data) {
        const hooks = this.readHooks();
        const hook = hooks.find(h => h.hookUrl === hookUrl);
        if (hook) {
            events.emit('hook-dispatch', {url: hookUrl, data});
        }
    }    
}

module.exports = {HookManager};
