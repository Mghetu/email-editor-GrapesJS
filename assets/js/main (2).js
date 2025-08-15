/*
 * main.js
 *
 * This script bootstraps the GrapesJS editor with the MJML plugin
 * and registers several custom MJML blocks as well as export commands
 * for MJML and HTML.  Extensive comments throughout the file
 * describe each significant step in detail.  Unlike earlier versions
 * of this example, there is no dependency on Tailwind CSS; all
 * layout and styling is achieved through MJML attributes and inline
 * styles.
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
     *    the container.  Our CSS ensures the container itself fills
     *    the viewport.
     *  - `storageManager`: Persists the editor state in localStorage so
     *    that page reloads don’t wipe your work.  Autosave triggers after
     *    a configured number of changes (stepsBeforeSave).
     *  - `plugins`: Array of plugin identifiers; the plugin names match
     *    the globals exported by the script tags included in index.html.
     *  - `pluginsOpts`: Options passed to specific plugins.  See
     *    https://github.com/GrapesJS/mjml for details.  This example
     *    loads only the MJML plugin.
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
      // Load only the MJML plugin.  We omit the Tailwind plugin entirely
      // to remove any dependency on Tailwind CSS.  The MJML plugin
      // provides a collection of email‑friendly components and live
      // compilation without needing additional CSS frameworks.
      plugins: ['grapesjs-mjml'],
      pluginsOpts: {
        // MJML plugin options
        'grapesjs-mjml': {
          // Do not reset inline styles when rendering MJML.  This
          // preserves inline styles applied directly on MJML elements.
          resetStyle: false,
        },
      },
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
<mj-section background-color="#f7fafc" padding="30px 0">
  <mj-column>
    <mj-text font-size="24px" font-weight="bold" align="center">Welcome!</mj-text>
    <mj-text font-size="16px" align="center">Create beautiful responsive emails.</mj-text>
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
    <mj-text font-weight="bold">Column 1</mj-text>
    <mj-text font-size="14px">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.</mj-text>
  </mj-column>
  <mj-column width="50%">
    <mj-text font-weight="bold">Column 2</mj-text>
    <mj-text font-size="14px">Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem.</mj-text>
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

    // -------------------------------------------------------------------------
    // Group block
    //
    // The mj-group component groups multiple mj-column elements within an
    // mj-section.  It shares many of the same attributes as mj-column (eg.
    // width, vertical-align, background-color) but allows columns to be
    // displayed inline on Outlook clients.  You can read more about the
    // component in the MJML documentation here: https://documentation.mjml.io/#mj-group
    //
    // The grapesjs-mjml plugin does not register a dedicated group block by
    // default, so we add one here.  Note that mj-group must be dropped
    // inside an mj-section (as enforced by the plugin's definition of
    // draggable elements) and it may only contain mj-column children.  In
    // this default template we include two columns with placeholder text.
    addMjmlBlock(
      'mj-group',
      'Group (Columns)',
      'MJML',
      `
<mj-section>
  <mj-group>
    <mj-column>
      <mj-text font-size="14px" font-weight="bold">Group Column 1</mj-text>
      <mj-text font-size="12px">Add your content here</mj-text>
    </mj-column>
    <mj-column>
      <mj-text font-size="14px" font-weight="bold">Group Column 2</mj-text>
      <mj-text font-size="12px">Add your content here</mj-text>
    </mj-column>
  </mj-group>
</mj-section>
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
    <!-- You can define custom styles here -->
  </mj-head>
  <mj-body background-color="#ffffff">
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" font-weight="600" align="center">Your email title</mj-text>
        <mj-text font-size="16px" align="center" color="#6b7280">Start building your message by dragging blocks from the left panel.</mj-text>
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

    // -------------------------------------------------------------------------
    // Always keep mj-group columns side by side on mobile in the preview
    //
    // MJML’s native behaviour keeps columns inside an mj-group side by side on
    // mobile, but the GrapesJS preview stacks them due to the generated
    // media query rules.  To mirror MJML’s behaviour, inject a global
    // stylesheet into the preview iframe immediately after the editor
    // finishes loading.  This stylesheet overrides the default mobile
    // widths for columns inside mj-group containers, ensuring they retain
    // their desktop widths on screens narrower than 480px.  Once added,
    // this style persists for the lifetime of the session.
    editor.on('load', function () {
      var frameEl = editor.Canvas.getFrameEl();
      if (!frameEl) return;
      var doc = frameEl.contentDocument || frameEl.contentWindow.document;
      // Avoid injecting multiple times
      if (doc.getElementById('gjs-group-mobile-style')) return;
      var style = doc.createElement('style');
      style.id = 'gjs-group-mobile-style';
      style.innerHTML =
        '@media only screen and (max-width:480px){ ' +
        '.mj-group .mj-column-per-50{width:50%!important; display:table-cell!important;} ' +
        '.mj-group .mj-column-per-33{width:33.333%!important; display:table-cell!important;} ' +
        '.mj-group .mj-column-per-66{width:66.666%!important; display:table-cell!important;} ' +
        '.mj-group .mj-column-per-25{width:25%!important; display:table-cell!important;} ' +
        '.mj-group .mj-column-per-75{width:75%!important; display:table-cell!important;} ' +
        '}';
      doc.head.appendChild(style);
    });
  });
})();