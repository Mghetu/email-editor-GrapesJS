// Global variables
let editor;
let currentExportType = 'html';

// Initialize the editor when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    setupEventListeners();
    hideLoading();
});

function initializeEditor() {
    editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        plugins: ['gjs-mjml'],
        pluginsOpts: {
            'gjs-mjml': {
                // MJML plugin options
                fonts: {
                    'Google Fonts': 'https://fonts.googleapis.com/css?family=',
                }
            }
        },
        canvas: {
            styles: [
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
            ]
        },
        storageManager: {
            type: 'local',
            autosave: true,
            autoload: true,
            stepsBeforeSave: 3,
        },
        assetManager: {
            upload: false,
            uploadText: 'Drop files here or click to upload',
            assets: getDefaultAssets()
        },
        styleManager: {
            sectors: [{
                name: 'General',
                properties: [
                    'float', 'display', 'position', 'top', 'right', 'left', 'bottom'
                ]
            }, {
                name: 'Typography',
                properties: [
                    'font-family', 'font-size', 'font-weight', 'letter-spacing',
                    'color', 'line-height', 'text-shadow'
                ]
            }, {
                name: 'Decorations',
                properties: [
                    'border-radius', 'border', 'box-shadow', 'background'
                ]
            }, {
                name: 'Extra',
                properties: ['opacity', 'cursor', 'z-index']
            }]
        },
        blockManager: {
            appendTo: '.gjs-blocks-c',
            blocks: getCustomBlocks()
        },
        panels: {
            defaults: [{
                id: 'basic-actions',
                el: '.panel__basic-actions',
                buttons: [{
                    id: 'visibility',
                    active: true,
                    className: 'btn-toggle-borders',
                    label: '<i class="fa fa-clone"></i>',
                    command: 'sw-visibility',
                }, {
                    id: 'export',
                    className: 'btn-export',
                    label: '<i class="fa fa-code"></i>',
                    command: 'export-template',
                    context: 'export-template',
                }, {
                    id: 'show-json',
                    className: 'btn-show-json',
                    label: '<i class="fa fa-file-code-o"></i>',
                    context: 'show-json',
                    command(editor) {
                        editor.Modal.setTitle('Components JSON')
                            .setContent(`<textarea style="width:100%; height: 250px;">
                                ${JSON.stringify(editor.getComponents(), null, 2)}
                            </textarea>`)
                            .open();
                    },
                }]
            }]
        },
        selectorManager: {
            appendTo: '.styles-container'
        },
        deviceManager: {
            devices: [{
                name: 'Desktop',
                width: '',
            }, {
                name: 'Tablet',
                width: '768px',
                widthMedia: '992px',
            }, {
                name: 'Mobile portrait',
                width: '320px',
                widthMedia: '768px',
            }]
        }
    });

    // Add custom commands
    addCustomCommands();
    
    // Load default template
    loadDefaultTemplate();
    
    // Auto-save functionality
    setupAutoSave();
}

function getDefaultAssets() {
    return [
        {
            type: 'image',
            src: 'https://via.placeholder.com/600x400/667eea/ffffff?text=Email+Header',
            height: 400,
            width: 600
        },
        {
            type: 'image',
            src: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Product',
            height: 200,
            width: 300
        },
        {
            type: 'image',
            src: 'https://via.placeholder.com/150x150/4CAF50/ffffff?text=Logo',
            height: 150,
            width: 150
        }
    ];
}

function getCustomBlocks() {
    return [
        {
            id: 'header-block',
            label: '<i class="fas fa-heading"></i> Header',
            category: 'Email Sections',
            content: {
                type: 'mj-section',
                components: [{
                    type: 'mj-column',
                    components: [{
                        type: 'mj-text',
                        content: '<h1 style="color: #333; text-align: center;">Your Header Here</h1>'
                    }]
                }],
                style: {
                    'background-color': '#f8f9fa',
                    'padding': '20px 0'
                }
            }
        },
        {
            id: 'hero-block',
            label: '<i class="fas fa-star"></i> Hero Section',
            category: 'Email Sections',
            content: {
                type: 'mj-hero',
                components: [{
                    type: 'mj-text',
                    content: '<h2 style="color: white; text-align: center;">Welcome to Our Newsletter</h2><p style="color: white; text-align: center;">Your amazing content starts here</p>'
                }, {
                    type: 'mj-button',
                    content: 'Get Started'
                }],
                style: {
                    'background-color': '#667eea',
                    'background-url': 'https://via.placeholder.com/600x400/667eea/ffffff',
                    'padding': '100px 0'
                }
            }
        },
        {
            id: 'two-column-block',
            label: '<i class="fas fa-columns"></i> Two Columns',
            category: 'Email Sections',
            content: {
                type: 'mj-section',
                components: [{
                    type: 'mj-column',
                    components: [{
                        type: 'mj-image',
                        style: {
                            'width': '100%'
                        }
                    }, {
                        type: 'mj-text',
                        content: '<h3>Column 1 Title</h3><p>Your content here...</p>'
                    }]
                }, {
                    type: 'mj-column',
                    components: [{
                        type: 'mj-image',
                        style: {
                            'width': '100%'
                        }
                    }, {
                        type: 'mj-text',
                        content: '<h3>Column 2 Title</h3><p>Your content here...</p>'
                    }]
                }]
            }
        },
        {
            id: 'footer-block',
            label: '<i class="fas fa-shoe-prints"></i> Footer',
            category: 'Email Sections',
            content: {
                type: 'mj-section',
                components: [{
                    type: 'mj-column',
                    components: [{
                        type: 'mj-divider',
                        style: {
                            'border-color': '#ddd',
                            'border-width': '1px'
                        }
                    }, {
                        type: 'mj-text',
                        content: '<p style="text-align: center; color: #666; font-size: 12px;">© 2025 Your Company. All rights reserved.</p><p style="text-align: center; color: #666; font-size: 12px;"><a href="#" style="color: #666;">Unsubscribe</a> | <a href="#" style="color: #666;">Privacy Policy</a></p>'
                    }]
                }],
                style: {
                    'background-color': '#f8f9fa',
                    'padding': '20px 0'
                }
            }
        }
    ];
}

function addCustomCommands() {
    editor.Commands.add('export-template', {
        run: function() {
            openExportModal();
        }
    });

    editor.Commands.add('preview-email', {
        run: function() {
            openPreviewModal();
        }
    });
}

function loadDefaultTemplate() {
    const defaultTemplate = `
        <mj-mjml>
            <mj-head>
                <mj-title>Welcome Email</mj-title>
                <mj-preview>Welcome to our amazing newsletter!</mj-preview>
                <mj-attributes>
                    <mj-all font-family="Inter, Arial, sans-serif" />
                    <mj-text font-size="16px" color="#333" line-height="1.6" />
                    <mj-button background-color="#667eea" color="white" border-radius="6px" />
                </mj-attributes>
            </mj-head>
            <mj-body background-color="#f4f4f4">
                <mj-section background-color="white" padding="20px">
                    <mj-column>
                        <mj-text align="center" font-size="24px" font-weight="bold" color="#333">
                            Welcome to Our Newsletter
                        </mj-text>
                        <mj-text>
                            Thank you for subscribing! We're excited to share amazing content with you.
                        </mj-text>
                        <mj-button href="#" background-color="#667eea">
                            Get Started
                        </mj-button>
                    </mj-column>
                </mj-section>
                
                <mj-section background-color="white" padding="20px">
                    <mj-column width="50%">
                        <mj-image src="https://via.placeholder.com/300x200/764ba2/ffffff?text=Feature+1" alt="Feature 1" />
                        <mj-text align="center" font-weight="bold">Amazing Feature 1</mj-text>
                        <mj-text>Description of your first amazing feature.</mj-text>
                    </mj-column>
                    <mj-column width="50%">
                        <mj-image src="https://via.placeholder.com/300x200/4CAF50/ffffff?text=Feature+2" alt="Feature 2" />
                        <mj-text align="center" font-weight="bold">Amazing Feature 2</mj-text>
                        <mj-text>Description of your second amazing feature.</mj-text>
                    </mj-column>
                </mj-section>
                
                <mj-section background-color="#f8f9fa" padding="20px">
                    <mj-column>
                        <mj-divider border-color="#ddd" />
                        <mj-text align="center" font-size="12px" color="#666">
                            © 2025 Your Company. All rights reserved.<br>
                            <a href="#" style="color: #666;">Unsubscribe</a> | 
                            <a href="#" style="color: #666;">Privacy Policy</a>
                        </mj-text>
                    </mj-column>
                </mj-section>
            </mj-body>
        </mj-mjml>
    `;
    
    if (!localStorage.getItem('gjs-mjml-email')) {
        editor.setComponents(defaultTemplate);
    }
}

function setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
        if (editor) {
            const data = {
                components: editor.getComponents(),
                styles: editor.getCss(),
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gjs-mjml-email-backup', JSON.stringify(data));
        }
    }, 30000);
}

function setupEventListeners() {
    // Export buttons
    document.getElementById('export-btn').addEventListener('click', () => {
        currentExportType = 'html';
        openExportModal();
    });

    document.getElementById('export-mjml-btn').addEventListener('click', () => {
        currentExportType = 'mjml';
        openExportModal();
    });

    document.getElementById('preview-btn').addEventListener('click', openPreviewModal);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Modal background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModals();
            }
        });
    });

    // Export tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentExportType = e.target.dataset.tab;
            updateExportCode();
        });
    });

    // Copy code button
    document.getElementById('copy-code').addEventListener('click', copyToClipboard);

    // Preview device buttons
    document.querySelectorAll('.preview-device').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.preview-device').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const device = e.target.dataset.device;
            updatePreviewDevice(device);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    saveProject();
                    break;
                case 'e':
                    e.preventDefault();
                    openExportModal();
                    break;
                case 'p':
                    e.preventDefault();
                    openPreviewModal();
                    break;
            }
        }
        if (e.key === 'Escape') {
            closeModals();
        }
    });
}

function openExportModal() {
    document.getElementById('export-modal').style.display = 'block';
    updateExportCode();
}

function openPreviewModal() {
    document.getElementById('preview-modal').style.display = 'block';
    updatePreview();
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function updateExportCode() {
    const textarea = document.getElementById('export-code');
    
    if (currentExportType === 'html') {
        const mjml = editor.getHtml();
        // In a real implementation, you'd convert MJML to HTML here
        // For now, we'll show the MJML output with a note
        textarea.value = `<!-- MJML Code (use MJML compiler to convert to HTML) -->\n${mjml}`;
    } else {
        textarea.value = editor.getHtml();
    }
}

function updatePreview() {
    const iframe = document.getElementById('preview-frame');
    const mjmlCode = editor.getHtml();
    
    // Create a preview document
    const previewDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Preview</title>
            <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f4f4f4; }
                .email-container { max-width: 600px; margin: 0 auto; background: white; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <!-- Note: In production, this MJML would be compiled to HTML -->
                <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; margin-bottom: 20px; border-radius: 4px;">
                    <strong>Preview Note:</strong> This is a basic preview. In production, MJML code would be compiled to responsive HTML.
                </div>
                <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${escapeHtml(mjmlCode)}</pre>
            </div>
        </body>
        </html>
    `;
    
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(previewDoc);
}

function updatePreviewDevice(device) {
    const iframe = document.getElementById('preview-frame');
    iframe.className = device;
}

function copyToClipboard() {
    const textarea = document.getElementById('export-code');
    textarea.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('copy-code');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.style.background = '#4CAF50';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
}

function saveProject() {
    const data = {
        components: editor.getComponents(),
        styles: editor.getCss(),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 6px;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize tooltips and help system
function initializeHelp() {
    // Add keyboard shortcuts info
    const helpBtn = document.createElement('button');
    helpBtn.innerHTML = '<i class="fas fa-question-circle"></i>';
    helpBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #3498db;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
    `;
    
    helpBtn.addEventListener('click', () => {
        alert(`Keyboard Shortcuts:
        
Ctrl+S - Save project
Ctrl+E - Export code  
Ctrl+P - Preview email
Esc - Close modals

Tips:
- Drag blocks from the left panel to build your email
- Use the style panel on the right to customize elements
- Your work is auto-saved every 30 seconds
- Click Preview to see how your email looks
- Export MJML code to use with email services`);
    });
    
    document.body.appendChild(helpBtn);
}

// Call help initialization
setTimeout(initializeHelp, 2000);
