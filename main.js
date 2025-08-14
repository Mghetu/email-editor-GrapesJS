/**
 * MJML Email Editor with GrapesJS
 * Main JavaScript file for initializing the editor and handling functionality
 */

// Global variables
let editor;

// Storage keys for localStorage
const STORAGE_KEY = 'mjml-email-templates';
const LAST_TEMPLATE_KEY = 'mjml-last-template';

/**
 * Initialize the GrapesJS editor with MJML plugin
 */
function initEditor() {
    editor = grapesjs.init({
        // Basic configuration
        container: '#gjs',
        fromElement: true,
        height: '100%',
        width: 'auto',
        
        // Storage configuration (disabled to use custom localStorage)
        storageManager: false,
        
        // Plugin configuration
        plugins: ['grapesjs-mjml'],
        pluginsOpts: {
            'grapesjs-mjml': {
                // MJML plugin options
                categoryLabel: 'MJML Components',
                
                // Custom blocks configuration
                blocks: ['mj-1-column', 'mj-2-columns', 'mj-3-columns', 'mj-text', 'mj-image', 'mj-button', 'mj-social', 'mj-divider', 'mj-spacer', 'mj-hero', 'mj-navbar'],
                
                // Add custom group component
                customComponents: [
                    {
                        type: 'mj-group',
                        content: `
                            <mj-group>
                                <mj-column width="50%">
                                    <mj-text>Column 1</mj-text>
                                </mj-column>
                                <mj-column width="50%">
                                    <mj-text>Column 2</mj-text>
                                </mj-column>
                            </mj-group>
                        `,
                        category: 'MJML Components',
                        attributes: {
                            name: 'Group',
                            content: 'Group component for advanced layouts'
                        }
                    }
                ]
            }
        },
        
        // Canvas configuration
        canvas: {
            styles: [
                // Add any custom canvas styles if needed
            ],
            scripts: []
        },
        
        // Panel configuration
        panels: {
            defaults: [
                {
                    id: 'layers',
                    el: '.panel__right',
                    resizable: {
                        maxDim: 350,
                        minDim: 200,
                        tc: 0,
                        cl: 1,
                        cr: 0,
                        bc: 0,
                        keyWidth: 'flex-basis',
                    },
                },
                {
                    id: 'panel-switcher',
                    el: '.panel__switcher',
                    buttons: [
                        {
                            id: 'show-layers',
                            active: true,
                            label: 'Layers',
                            command: 'show-layers',
                            togglable: false,
                        }, {
                            id: 'show-style',
                            active: true,
                            label: 'Styles',
                            command: 'show-styles',
                            togglable: false,
                        }, {
                            id: 'show-traits',
                            active: true,
                            label: 'Settings',
                            command: 'show-traits',
                            togglable: false,
                        }
                    ],
                }
            ]
        },
        
        // Block manager configuration
        blockManager: {
            appendTo: '.blocks-container',
            blocks: []
        },
        
        // Style manager configuration
        styleManager: {
            appendTo: '.styles-container',
            sectors: [
                {
                    name: 'Dimension',
                    open: false,
                    buildProps: ['width', 'min-height', 'padding'],
                    properties: [
                        {
                            type: 'integer',
                            name: 'Width',
                            property: 'width',
                            units: ['px', '%'],
                            defaults: 'auto',
                            min: 0,
                        }
                    ]
                }, {
                    name: 'Typography',
                    open: false,
                    buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height'],
                    properties: [
                        {
                            name: 'Font',
                            property: 'font-family'
                        }, {
                            name: 'Weight',
                            property: 'font-weight'
                        }, {
                            name: 'Font Color',
                            property: 'color',
                        }
                    ]
                }, {
                    name: 'Decorations',
                    open: false,
                    buildProps: ['background-color', 'border-radius', 'border', 'box-shadow'],
                    properties: [
                        {
                            name: 'Background Color',
                            property: 'background-color',
                        }
                    ]
                }, {
                    name: 'Extra',
                    open: false,
                    buildProps: ['transition', 'perspective', 'transform'],
                    properties: []
                }
            ]
        },
        
        // Layer manager configuration
        layerManager: {
            appendTo: '.layers-container'
        },
        
        // Trait manager configuration (Properties panel)
        traitManager: {
            appendTo: '.traits-container',
        },
        
        // Device manager for responsive design
        deviceManager: {
            devices: [
                {
                    name: 'Desktop',
                    width: '',
                }, {
                    name: 'Mobile',
                    width: '320px',
                    widthMedia: '480px',
                }
            ]
        },
        
        // Asset manager configuration
        assetManager: {
            embedAsBase64: true,
        }
    });
    
    // Setup editor events and commands
    setupEditorEvents();
    setupCustomCommands();
    
    // Load last saved template on startup
    loadLastTemplate();
    
    console.log('MJML Email Editor initialized successfully!');
}

/**
 * Setup editor events
 */
function setupEditorEvents() {
    // Auto-save on content change (debounced)
    let saveTimeout;
    editor.on('component:update storage:load', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            autoSave();
        }, 2000); // Auto-save after 2 seconds of inactivity
    });
    
    // Update custom panels visibility
    editor.on('run:show-layers', () => {
        const lm = editor.LayerManager;
        lm.render('.layers-container');
    });
    
    editor.on('run:show-styles', () => {
        const sm = editor.StyleManager;
        sm.render('.styles-container');
    });
    
    editor.on('run:show-traits', () => {
        const tm = editor.TraitManager;
        tm.render('.traits-container');
    });
}

/**
 * Setup custom commands
 */
function setupCustomCommands() {
    // Add command to export MJML to HTML
    editor.Commands.add('export-mjml', {
        run: function(editor) {
            const mjml = editor.getHtml();
            const css = editor.getCss();
            
            try {
                // Use the MJML parser from the plugin to convert to HTML
                const mjmlToHtml = editor.runCommand('mjml-get-code');
                return mjmlToHtml;
            } catch (error) {
                console.error('Error converting MJML to HTML:', error);
                return mjml; // Fallback to raw MJML
            }
        }
    });
    
    // Add command to clear the canvas
    editor.Commands.add('clear-canvas', {
        run: function(editor) {
            if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
                editor.DomComponents.clear();
                editor.setComponents(`
                    <mjml>
                        <mj-head>
                            <mj-title>New Email Template</mj-title>
                        </mj-head>
                        <mj-body background-color="#f4f4f4">
                            <mj-section background-color="#ffffff" padding="20px">
                                <mj-column>
                                    <mj-text font-size="20px" color="#626262" align="center">
                                        Start building your email template
                                    </mj-text>
                                </mj-column>
                            </mj-section>
                        </mj-body>
                    </mjml>
                `);
            }
        }
    });
}

/**
 * Save template to localStorage
 */
function saveTemplate() {
    try {
        const template = {
            html: editor.getHtml(),
            css: editor.getCss(),
            components: editor.getComponents(),
            styles: editor.getStyles(),
            timestamp: new Date().toISOString(),
            name: prompt('Enter a name for this template:') || `Template ${Date.now()}`
        };
        
        // Get existing templates
        const templates = getStoredTemplates();
        
        // Add new template
        templates.push(template);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        localStorage.setItem(LAST_TEMPLATE_KEY, JSON.stringify(template));
        
        alert('Template saved successfully!');
        console.log('Template saved:', template.name);
    } catch (error) {
        console.error('Error saving template:', error);
        alert('Error saving template. Please try again.');
    }
}

/**
 * Load template from localStorage
 */
function loadTemplate() {
    try {
        const templates = getStoredTemplates();
        
        if (templates.length === 0) {
            alert('No saved templates found.');
            return;
        }
        
        // Create template selection dialog
        const templateList = templates.map((template, index) => 
            `${index + 1}. ${template.name} (${new Date(template.timestamp).toLocaleDateString()})`
        ).join('\n');
        
        const selection = prompt(`Select a template to load:\n\n${templateList}\n\nEnter the number (1-${templates.length}):`);
        
        if (selection && !isNaN(selection)) {
            const index = parseInt(selection) - 1;
            if (index >= 0 && index < templates.length) {
                const template = templates[index];
                
                // Load the template
                editor.setComponents(template.components || template.html);
                if (template.styles) {
                    editor.setStyle(template.styles);
                }
                
                alert(`Template "${template.name}" loaded successfully!`);
                console.log('Template loaded:', template.name);
            } else {
                alert('Invalid selection.');
            }
        }
    } catch (error) {
        console.error('Error loading template:', error);
        alert('Error loading template. Please try again.');
    }
}

/**
 * Auto-save current work
 */
function autoSave() {
    try {
        const template = {
            html: editor.getHtml(),
            css: editor.getCss(),
            components: editor.getComponents(),
            styles: editor.getStyles(),
            timestamp: new Date().toISOString(),
            name: 'Auto-saved'
        };
        
        localStorage.setItem(LAST_TEMPLATE_KEY, JSON.stringify(template));
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

/**
 * Load last saved template
 */
function loadLastTemplate() {
    try {
        const lastTemplate = localStorage.getItem(LAST_TEMPLATE_KEY);
        if (lastTemplate) {
            const template = JSON.parse(lastTemplate);
            console.log('Loading last saved template...');
            
            // Only load if it's different from the default content
            if (template.components || template.html) {
                setTimeout(() => {
                    editor.setComponents(template.components || template.html);
                    if (template.styles) {
                        editor.setStyle(template.styles);
                    }
                }, 100);
            }
        }
    } catch (error) {
        console.error('Error loading last template:', error);
    }
}

/**
 * Get stored templates from localStorage
 */
function getStoredTemplates() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error getting stored templates:', error);
        return [];
    }
}

/**
 * Download compiled HTML email
 */
function downloadHTML() {
    try {
        // Get MJML code
        const mjmlCode = editor.getHtml();
        
        // Try to get compiled HTML if MJML plugin supports it
        let htmlContent = mjmlCode;
        
        // Check if mjml-browser is available (from the plugin)
        if (window.mjml && window.mjml.mjml2html) {
            try {
                const result = window.mjml.mjml2html(mjmlCode);
                htmlContent = result.html;
            } catch (error) {
                console.log('MJML compilation not available, downloading MJML code instead');
            }
        }
        
        // Create HTML document
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        ${editor.getCss()}
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
        
        // Create and download file
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-template-${new Date().getTime()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('HTML email downloaded successfully');
    } catch (error) {
        console.error('Error downloading HTML:', error);
        alert('Error downloading HTML. Please try again.');
    }
}

/**
 * Clear all saved templates
 */
function clearAllTemplates() {
    if (confirm('Are you sure you want to clear all saved templates? This action cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_TEMPLATE_KEY);
        alert('All templates cleared successfully.');
    }
}

/**
 * Setup event listeners for toolbar buttons
 */
function setupEventListeners() {
    // Save button
    document.getElementById('save-btn').addEventListener('click', saveTemplate);
    
    // Load button
    document.getElementById('load-btn').addEventListener('click', loadTemplate);
    
    // Download button
    document.getElementById('download-btn').addEventListener('click', downloadHTML);
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
        editor.runCommand('clear-canvas');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveTemplate();
        }
        
        // Ctrl+O to load
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            loadTemplate();
        }
        
        // Ctrl+D to download
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            downloadHTML();
        }
    });
}

/**
 * Initialize the application
 */
function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initEditor();
            setupEventListeners();
        });
    } else {
        initEditor();
        setupEventListeners();
    }
}

// Start the application
init();