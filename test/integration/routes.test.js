const {HookManager} = require('../../src/HookManager');
const {assert, chai} = require('../helpers');
const server = require('../../src/index');
const sinon = require('sinon');

describe('Routes', () => {
    const hookManager = new HookManager();
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        hookManager.cleanHooks();
    });

    afterEach(() => {
        sandbox.restore();
    });

    after(() => {
        hookManager.cleanHooks();
    });

    it('should register a new hook', done => {
        const testHook = 'http://test.com/test1';

        chai.request(server)
            .post('/webhook')
            .send({hookUrl: testHook})
            .end((err, res) => {
                assert.strictEqual(res.statusCode, 204);
                done(err);
            });
    });

    it('should validate register request', done => {
        chai.request(server)
            .post('/webhook')
            .send({})
            .end((err, res) => {
                assert.strictEqual(res.statusCode, 400);
                assert.strictEqual(res.body.message, 'The parameter "hookUrl" should be informed.');
                done(err);
            });
    });    

    it('should remove a hook', done => {
        const testHook = 'http://test.com/test2';
        hookManager.writeHook(testHook);

        chai.request(server)
            .delete(`/webhook/${encodeURIComponent(testHook)}`)
            .end((err, res) => {
                assert.strictEqual(res.statusCode, 204);
                done(err);
            });
    });
    
    it('should list all hooks', done => {
        const testHook = 'http://test.com/test3';
        hookManager.writeHook(testHook);

        chai.request(server)
            .get('/webhook')
            .end((err, res) => {
                assert.strictEqual(res.statusCode, 200);
                const {hooks} = res.body;
                assert.lengthOf(hooks, 1);
                assert.deepStrictEqual(hooks, [{hookUrl: testHook}]);
                done(err);
            });
    });

    it('should notify registered clients', done => {
        const hook1 = 'http://test.com/hook1';
        const hook2 = 'http://test.com/hook2';
        const hook3 = 'http://test.com/hook3';
        [hook1, hook2, hook3].forEach(hook => hookManager.writeHook(hook));

        const testData = {test: 'test-data'};

        const stub = sandbox.stub(hookManager, '_hook').callsFake(() => {});
        
        chai.request(server)
            .post('/send-to-hooks')
            .send(testData)
            .end((err, res) => {
                assert.strictEqual(res.statusCode, 204);

                sinon.assert.calledThrice(stub);

                stub.onFirstCall(hook1, testData);
                stub.onSecondCall(hook1, testData);
                stub.onThirdCall(hook1, testData);

                done(err);
            });
    });

    it('should notify a specific client', done => {
        const hook1 = 'http://test.com/hook1';
        const hook2 = 'http://test.com/hook2';
        const hook3 = 'http://test.com/hook3';
        [hook1, hook2, hook3].forEach(hook => hookManager.writeHook(hook));

        const testData = {test: 'test-data'};

        const stub = sandbox.stub(hookManager, '_hook').callsFake(() => {});
        
        chai.request(server)
            .post(`/send-to-hooks/${encodeURIComponent(hook2)}`)
            .send(testData)
            .end((err, res) => {
                assert.strictEqual(res.statusCode, 204);

                sinon.assert.calledOnce(stub);
                
                stub.onCall(hook2, testData);

                done(err);
            });        
    });    
});