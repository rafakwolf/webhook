const express = require('express');

/**
 * Routes definitions
 * @param {HookManager} hookManager
 */
module.exports = (hookManager) => {
    const routes = express.Router();

  /**
   * @swagger
   * definitions:
   *   Hook:
   *     properties:
   *       hookUrl:
   *         type: string
   *   ApiStatus:
   *     properties:
   *       status:
   *         type: string
   */

    /**
     * @swagger
     * /:
     *   get:
     *     tags:
     *       - Api Status
     *     description: Returns the Api Status
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Status
     *         schema:
     *           $ref: '#/definitions/ApiStatus'
     */
    routes.get('/', (req, res) => {
        res.json({
          status: 'ok'
        });
    });
    
    /**
     * @swagger
     * /webhook:
     *   post:
     *     tags:
     *       - Webhook
     *     description: Register a webhook 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: hookUrl
     *         description: Webhook url.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       204:
     *         description: Successful request
     *       400:
     *         description: Validations
     *       500:
     *         description: Internal Server Errors          
     */
    routes.post('/webhook', (req, res) => {
        const {hookUrl} = req.body;
        if (!hookUrl) {
            return res.status(400).json({message: 'The parameter "hookUrl" should be informed.'});
        }
    
        try {
            hookManager.writeHook(hookUrl);
        
            res.status(204).send();
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    });

    /**
     * @swagger
     * /webhook:
     *   get:
     *     tags:
     *       - Webhook
     *     description: Retrieves all webhooks 
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Successful request
     *         schema:
     *           $ref: '#/definitions/Hook'
     *       500:
     *         description: Internal Server Errors          
     */
    routes.get('/webhook', (req, res) => {
        try {
            const hooks = hookManager.readHooks();
        
            res.json({hooks});
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    });

    /**
     * @swagger
     * /webhook?hookUrl=:
     *   delete:
     *     tags:
     *       - Webhook
     *     description: Removes a specific webhook 
     *     produces:
     *       - application/json
     *     responses:
     *       204:
     *         description: Successful request
     *       500:
     *         description: Internal Server Errors          
     */    
    routes.delete('/webhook/', (req, res) => {
        const {hookUrl} = req.query;
        try {
            hookManager.removeHook(hookUrl);
        
            res.status(204).send();
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    });
    
    /**
     * @swagger
     * /send-to-hooks:
     *   post:
     *     tags:
     *       - Webhook
     *     description: Calls the registered hooks 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: data
     *         description: The data desired to be send to the clients.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       204:
     *         description: Successful request
     *       500:
     *         description: Internal Server Errors          
     */
    routes.post('/send-to-hooks', (req, res) => {
        const data = req.body || {};
        hookManager.dispathHooks(data);
    
        res.status(204).send();
    });

    /**
     * @swagger
     * /send-to-hook?hookurl=:
     *   post:
     *     tags:
     *       - Webhook
     *     description: Calls an specific registered hooks 
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: data
     *         description: The data desired to be send to the clients.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       204:
     *         description: Successful request
     *       500:
     *         description: Internal Server Errors          
     */    
    routes.post('/send-to-hooks/:hookUrl', (req, res) => {
        const data = req.body || {};
        const {hookUrl} = req.params; 

        hookManager.dispathHook(hookUrl, data);
    
        res.status(204).send();
    });


    return routes;
}