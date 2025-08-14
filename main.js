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
        
        // Plugin configuration - Using stable 0.0.31 version
        plugins: ['grapesjs-mjml'],
        pluginsOpts: {
            'grapesjs-mjml': {
                // MJML plugin options for v0.0.31
                categoryLabel: 'MJML Components'
            }
        },
        
        // Canvas configuration
        canvas: {
            styles: [
                // Add any custom canvas styles if needed
            ],
            scripts: []
        },
        
        // Panel configuration - Simplified for compatibility
        panels: {
            defaults: [
                {
                    id: 'commands',
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
                        }
                    ],
                }
            ]
        }
    });,
        
        // Block manager configuration - Simplified
        blockManager: {
            appendTo: '.blocks-container'
        },
        
        // Style manager configuration - Simplified  
        styleManager: {
            appendTo: '.styles-container'
        },
        
        // Layer manager configuration - Simplified
        layerManager: {
            appendTo: '.layers-container'
        },
        
        // Trait manager configuration - Simplified
        traitManager: {
            appendTo: '.traits-container'
        },
        
        // Device manager for responsive design - Simplified
        deviceManager: {
            devices: [
                {
                    name: 'Desktop',
                    width: ''
                }, {
                    name: 'Mobile',
                    width: '320px'
                }
            ]
        }
    });
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
    editor.on('component:update', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            autoSave();
        }, 2000); // Auto-save after 2 seconds of inactivity
    });
}

/**
 * Setup custom commands
 */
function setupCustomCommands() {
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
        const cssCode = editor.getCss();
        
        // For the stable v0.0.31, we'll download the MJML code
        // Users can compile it separately using MJML tools
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MJML Email Template</title>
    <style>
        ${cssCode}
    </style>
</head>
<body>
    <!-- MJML Template - Use https://mjml.io/try-it-live to compile to HTML -->
    ${mjmlCode}
</body>
</html>`;
        
        // Create and download file
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mjml-template-${new Date().getTime()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('MJML template downloaded! Use https://mjml.io/try-it-live to compile to HTML.');
        console.log('MJML template downloaded successfully');
    } catch (error) {
        console.error('Error downloading template:', error);
        alert('Error downloading template. Please try again.');
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