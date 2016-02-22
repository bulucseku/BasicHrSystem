/*jsl:ignoreall*/
/* List of CSS files used in the application. The files will be minified to production.css during steal build in production.
 * In development environment steal does not send separate HTTP requests for the css files if they are already loaded from styles.css.
 */

steal(
    'styles/styles.css',
    'styles/pg-savedreports.css',
    'styles/pg-builder.css',
    /*'styles/collapsibleContainer.css',*/
    'styles/sideBarCollapsibleContainer.css',
    /*styles/sideBarCollapsibleContainer.css',*/
    'styles/pg-repoman.css',
    'styles/onlywhencolumn.css',
    'styles/biqstyles.css',
    'styles/result-definition.css',
    'styles/analytic_report.css',
    'styles/page-layout.css'
);
