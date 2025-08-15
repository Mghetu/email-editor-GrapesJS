/*
 * main.js
 *
 * This script bootstraps the GrapesJS editor, wires up the MJML and
 * Tailwind plugins, injects Tailwind CSS into the preview canvas, and
 * registers several custom MJML blocks as well as export commands for
 * MJML and HTML.  Extensive comments throughout the file describe
 * each significant step in detail.
 */

(function () {
  // Wait for the DOM to be fully parsed before initialising the editor.
  document.addEventListener('DOMContentLoaded', function () {
    /*
     * Initialise GrapesJS.
     *
     * The configuration object passed to `grapesjs.init()` controls the
     * editor’s behaviour.  Key properties include:
     *
     *  - `container`: A CSS selector pointing at the element in which
     *    GrapesJS should mount itself.
     *  - `fromElement`: When true GrapesJS will parse the contents of
     *    the container and use it to build the initial canvas.  We set
     *    this to false because we start with a clean MJML template.
     *  - `height`: Height of the editor; using 100% makes the editor fill
     *    the container (which itself is full height via Tailwind classes).
     *  - `storageManager`: Persists the editor state in localStorage so
     *    that page reloads don’t wipe your work.  Autosave triggers after
     *    a configured number of changes (stepsBeforeSave).
     *  - `plugins`: Array of plugin identifiers; the plugin names match
     *    the globals exported by the script tags included in index.html.
     *  - `pluginsOpts`: Options passed to specific plugins.  See
     *    https://github.com/GrapesJS/mjml and plugin docs for details.
     *  - `canvas.styles`: An array of CSS URLs injected into the
     *    internal iframe.  Here we inject Tailwind so classes like
     *    `text-center` work inside MJML components rendered in the canvas.
     */
    var editor = grapesjs.init({
      container: '#gjs',
      fromElement: false,
      height: '100%',
      storageManager: {
        type: 'local', // Persist data in localStorage
        autosave: true, // Enable automatic saving
        autoload: true, // Load saved data on startup
        stepsBeforeSave: 10, // Number of changes before triggering a save
      },
      plugins: ['grapesjs-mjml', 'grapesjs-tailwind'],
      pluginsOpts: {
        // MJML plugin options
        'grapesjs-mjml': {
          // Prevent the plugin from stripping inline styles.  This helps
          // preserve Tailwind classes applied to MJML elements.
          resetStyle: false,
        },
        /*
         * No options are passed to `grapesjs-tailwind`.  The plugin will
         * automatically load Tailwind via its default Play CDN script
         * (https://cdn.tailwindcss.com) and inject the compiled CSS
         * into the editor’s iframe.  Although the Play CDN is intended
         * primarily for development, it performs the necessary JIT
         * compilation of your Tailwind classes at runtime.  By letting
         * the plugin manage the process we avoid cross‑origin issues
         * encountered when attempting to load a standalone CSS bundle.
         */
        'grapesjs-tailwind': {},
      },
      // The canvas configuration is omitted here.  The Tailwind plugin
      // handles injecting styles into the iframe on its own, so there’s
      // no need to specify `canvas.styles` manually.  GrapesJS will
      // otherwise use its default iframe styling.
    });

    // Helper to add a custom MJML block to the block manager.  Each block
    // definition includes a label (visible in the block panel), a
    // category (used to group blocks), and the MJML markup to insert
    // when the block is dragged onto the canvas.
    function addMjmlBlock(id, label, category, content) {
      editor.BlockManager.add(id, {
        label: label,
        category: category,
        content: content,
      });
    }

    // Register a few illustrative MJML blocks.  Feel free to extend or
    // modify these definitions to suit your needs.
    addMjmlBlock(
      'mj-hero',
      'Hero Section',
      'MJML',
      `
<mj-section css-class="bg-gray-100 py-12">
  <mj-column>
    <mj-text css-class="text-3xl font-bold text-center mb-4">Welcome!</mj-text>
    <mj-text css-class="text-lg text-center">Create beautiful responsive emails with Tailwind&nbsp;utilities.</mj-text>
  </mj-column>
</mj-section>
      `.trim(),
    );

    addMjmlBlock(
      'mj-two-columns',
      'Two Columns',
      'MJML',
      `
<mj-section>
  <mj-column width="50%">
    <mj-text css-class="font-semibold">Column 1</mj-text>
    <mj-text css-class="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.</mj-text>
  </mj-column>
  <mj-column width="50%">
    <mj-text css-class="font-semibold">Column 2</mj-text>
    <mj-text css-class="text-sm">Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem.</mj-text>
  </mj-column>
</mj-section>
      `.trim(),
    );

    addMjmlBlock(
      'mj-divider',
      'Divider',
      'MJML',
      `
<mj-divider border-color="#e2e8f0" border-width="2px" />
      `.trim(),
    );

    addMjmlBlock(
      'mj-spacer',
      'Spacer',
      'MJML',
      `
<mj-spacer height="20px" />
      `.trim(),
    );

    /*
     * Default MJML template
     *
     * When the editor loads with no previously saved state, we seed it with a
     * minimal but complete MJML document.  This template includes the
     * necessary <mjml>, <mj-body>, and <mj-section> tags so users aren’t
     * greeted by an empty canvas.  Feel free to customise the
     * placeholder content.
     */
    var defaultTemplate = `
<mjml>
  <mj-head>
    <!-- You can define styles here -->
  </mj-head>
  <mj-body css-class="bg-white">
    <mj-section>
      <mj-column>
        <mj-text css-class="text-2xl font-semibold text-center">Your email title</mj-text>
        <mj-text css-class="text-base text-center text-gray-600">Start building your message by dragging blocks from the left panel.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
    `.trim();

    // Once the editor has finished loading, inject the default template if
    // nothing has been saved yet.  The check against `hasOnce` prevents
    // repeatedly overwriting the user’s work on subsequent loads.
    var hasLoadedOnce = false;
    editor.on('load', function () {
      if (!hasLoadedOnce) {
        hasLoadedOnce = true;
        // Only set the template if the editor is empty (no components)
        if (!editor.getComponents().length) {
          editor.setComponents(defaultTemplate);
        }
      }
    });

    /*
     * Export helpers
     *
     * These functions encapsulate the logic required to convert the MJML
     * document into HTML and trigger file downloads.  The FileSaver
     * library (loaded in index.html) is used to save the files to disk.
     */
    function downloadMJML() {
      var mjmlString = editor.getMjml();
      var blob = new Blob([mjmlString], {
        type: 'application/xml;charset=utf-8',
      });
      saveAs(blob, 'template.mjml');
    }

    function downloadHTML() {
      // Retrieve the current MJML markup from the editor
      var mjmlString = editor.getMjml();
      try {
        // Compile to HTML using the MJML browser compiler.  The second
        // argument allows you to set options such as minification.  See
        // https://mjml.io/documentation/#options for more details.
        var compiled = mjml(mjmlString, { beautify: true, minify: false });
        var htmlOutput = compiled.html || '';
        var blob = new Blob([htmlOutput], {
          type: 'text/html;charset=utf-8',
        });
        saveAs(blob, 'template.html');
      } catch (err) {
        // If compilation fails, alert the user.  An error here usually
        // indicates invalid MJML markup in the canvas.
        alert('Failed to compile MJML to HTML: ' + err.message);
      }
    }

    /*
     * Add custom export buttons to the editor interface.  GrapesJS allows
     * you to define custom panels and buttons.  We create a new panel
     * named `export-panel` and populate it with two buttons: one for
     * exporting MJML and another for exporting HTML.  Each button calls
     * the corresponding helper defined above when clicked.
     */
    var panels = editor.Panels;
    // Add a new panel below the options panel for export actions
    panels.addPanel({ id: 'export-panel' });
    panels.addButton('export-panel', {
      id: 'export-mjml',
      className: 'fa fa-code mr-2',
      label: 'MJML',
      command: function () {
        downloadMJML();
      },
      attributes: {
        title: 'Export MJML',
      },
    });
    panels.addButton('export-panel', {
      id: 'export-html',
      className: 'fa fa-file-code-o',
      label: 'HTML',
      command: function () {
        downloadHTML();
      },
      attributes: {
        title: 'Export HTML',
      },
    });
  });
})();