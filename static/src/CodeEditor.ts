class CodeEditor {
    private editor: any;
    private currentFilename: string = '';

    constructor() {
        update_files();
        this.editor = ace.edit("code-editor");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/c_cpp");
        this.editor.resize();
        this.editor.setValue(``);
    }

    setValue(value: string) {
        this.editor.setValue(value, -1);
    }

    getValue() {
        return this.editor.getValue();
    }

    async getVariableNames() {
        const response = await fetch('/variable_names', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: this.getValue() })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to fetch variable names');
            return [];
        }
    }

    async checkValidity() {
        const response = await fetch('/syntax_check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: this.getValue() })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to check syntax');
            return false;
        }
    }

    async loadFile(filename: string) {
        const response = await fetch('/get_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file: filename })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.file) {
                this.setValue(data.file);
                this.currentFilename = filename;
                const offcanvas = document.getElementById('SaveOffCanvas');
                if (offcanvas) {
                    const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(offcanvas);
                    bsOffcanvas?.hide();
                }
            } else {
                console.error('Failed to load file:', data.error);
            }
        } else {
            console.error('Failed to fetch file contents');
        }
    }

    async deleteFile(filename: string) {
        const response = await fetch('/delete_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "filename": filename })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log('File deleted successfully');
                update_files();
            } else {
                console.error('Failed to delete file:', data.error);
            }
        } else {
            console.error('Failed to delete file');
        }
    }

    async saveFile(filename: string, file: string) {
        const response = await fetch('/save_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "filename": filename, "content": file })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log('File saved successfully');
                this.currentFilename = filename;
                update_files();
            } else {
                console.error('Failed to save file:', data.error);
            }
        } else {
            console.error('Failed to save file');
        }
    }
}

let pinned_variables: string[] = [];
let current_filename: string = "";

const codeEditor = new CodeEditor();

const Offcanvas = document.getElementById('VariablePinOffCanvas');
if (Offcanvas) {
    Offcanvas.addEventListener('show.bs.offcanvas', async (event) => {
        const variableList = await codeEditor.getVariableNames();
        const container: any = document.getElementById('variable-list');
        container.innerHTML = '';

        variableList.forEach((variable: string) => {
            const div = document.createElement('div');
            div.classList.add('form-check');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('form-check-input');
            checkbox.id = `var-${variable}`;
            checkbox.value = variable;
            checkbox.checked = pinned_variables.includes(variable);

            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.htmlFor = `var-${variable}`;
            label.textContent = variable;

            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    });

    Offcanvas.addEventListener('hidden.bs.offcanvas', event => {
        pinned_variables.length = 0;
        document.querySelectorAll('#variable-list input[type="checkbox"]:checked').forEach(checkbox => {
            pinned_variables.push((checkbox as any).value);
        });
        console.log('Pinned variables:', pinned_variables);
        refresh_graph();
    });
}

function save_button() {
    const filename = prompt("Enter filename to save:", codeEditor['currentFilename']);
    const file = codeEditor.getValue();
    if (filename && file) {
        codeEditor.saveFile(filename, file);
    } else {
        console.error('Filename or file content is empty');
    }
}

async function update_files() {
    const response = await fetch('/get_files', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const files = await response.json();
        const offcanvasBody = document.querySelector('#SaveOffCanvas .offcanvas-body');
        if (offcanvasBody) {
            offcanvasBody.innerHTML = '';
            files.forEach((file: string) => {
                const fileEntry = document.createElement('div');
                fileEntry.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');

                const fileNameSpan = document.createElement('span');
                fileNameSpan.textContent = file;

                const buttonGroup = document.createElement('div');

                const loadButton = document.createElement('button');
                loadButton.classList.add('btn', 'btn-primary', 'btn-sm');
                loadButton.innerHTML = '<i class="bi bi-folder2-open"></i>';
                loadButton.title = 'Load File';
                loadButton.onclick = () => codeEditor.loadFile(file);

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
                deleteButton.title = 'Delete File';
                deleteButton.onclick = async () => {
                    await codeEditor.deleteFile(file);
                    update_files();
                };

                buttonGroup.appendChild(loadButton);
                buttonGroup.appendChild(deleteButton);

                fileEntry.appendChild(fileNameSpan);
                fileEntry.appendChild(buttonGroup);

                offcanvasBody.appendChild(fileEntry);
            });
        }
    } else {
        console.error('Failed to fetch file list');
    }
}
