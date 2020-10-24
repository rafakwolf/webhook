const {HookManager} = require('../../src/HookManager');
const {assert} = require('../helpers'); 

describe('HookManager', () => {
    const hookManager = new HookManager('testHooks.json');

    beforeEach(() => {
        hookManager.cleanHooks();
    });

    after(() => {
        hookManager.cleanHooks();
    });

    it('should store and read hooks', () => {
        const testHook = 'http://test.com/test1';

        hookManager.writeHook(testHook);

        const hooks = hookManager.readHooks();
        
        assert.lengthOf(hooks, 1);
        const [{hookUrl}] = hooks;
        assert.strictEqual(hookUrl, testHook);
    });

    it('should not store duplicated hooks', () => {
        const testHook = 'http://test.com/test2';

        hookManager.writeHook(testHook);
        hookManager.writeHook(testHook);

        const hooks = hookManager.readHooks();
        
        assert.lengthOf(hooks, 1);
        const [{hookUrl}] = hooks;
        assert.strictEqual(hookUrl, testHook);
    });

    it('should remove one specific hook', () => {
        const hook1 = 'http://test.com/test3';
        const hook2 = 'http://test.com/test4';

        hookManager.writeHook(hook1);
        hookManager.writeHook(hook2);

        let hooks = hookManager.readHooks();
        assert.lengthOf(hooks, 2);

        hookManager.removeHook(hook1);

        hooks = hookManager.readHooks();
        assert.lengthOf(hooks, 1);
    });    
});