'use strict';

import nunjucks from 'nunjucks';
import isFilePath from './utils/isFilePath/index.js';

let environment;

/**
 * Factory function to create a Nunjucks template engine service.
 *
 * @param {object} [app] - Optional Express app instance to integrate with Nunjucks.
 * @returns {object} Service object with methods to initialise and interact with the template engine.
 */
function createTemplateEngineService(app) {
    /**
     * Initializes the Nunjucks environment if it hasn't been created yet.
     *
     * @returns {nunjucks.Environment} The Nunjucks environment instance.
     */
    function init() {
        if (environment) {
            return environment;
        }

        const configObject = {
            autoescape: true
        };

        if (app) {
            configObject.express = app;
        }

        environment = nunjucks
            .configure(
                [
                    'node_modules/@ministryofjustice/frontend/',
                    // allows the `{% from "govuk/macros/attributes.njk" ...` import in moj identity-bar/template.njk to work.
                    'node_modules/govuk-frontend/dist/',
                    'node_modules/govuk-frontend/dist/govuk/',
                    'node_modules/govuk-frontend/dist/govuk/components/',
                    'components/',
                    '', // root directory.
                    'page/',
                    'partial/'
                ],
                configObject
            )
            .addGlobal('APP_APP_VERSION', process.env.npm_package_version)
            .addGlobal('APP_BUILDTIME_ID', process.env.APP_BUILDTIME_ID)
            .addGlobal('govukRebrand', true);

        return environment;
    }

    /**
     * Renders a Nunjucks template string or file.
     *
     * @param {string} string - Template string or file path.
     * @param {object} [params={}] - Parameters to pass to the template.
     * @returns {string} Rendered HTML string.
     */
    function render(string, params) {
        if (isFilePath(string)) {
            return nunjucks.render(string, params);
        }
        return nunjucks.renderString(string, params);
    }

    /**
     * Gets the Nunjucks engine module.
     *
     * @returns {object} The Nunjucks module.
     */
    function getEngine() {
        return nunjucks;
    }

    /**
     * Gets the current Nunjucks environment instance.
     *
     * @returns {nunjucks.Environment|undefined} The Nunjucks environment or undefined if not initialized.
     */
    function getEnvironment() {
        return environment;
    }

    return Object.freeze({
        init,
        render,
        getEngine,
        getEnvironment
    });
}

export default createTemplateEngineService;
