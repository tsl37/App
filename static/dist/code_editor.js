"use strict";
let pinned_variables = [];
var code_editor = ace.edit("code-editor");
code_editor.setTheme("ace/theme/monokai");
code_editor.session.setMode("ace/mode/c_cpp");
code_editor.resize();
code_editor.setValue(`var leader = 0;
var state = 0;
var id = UID;
var msg;
if(state == 0)
{ 
    state = 1;
    0->id;
}
else
{   
var msg;
if(msgs.length >0)
{
msg = <-msgs;
  if(msg == UID)
  {
      leader = 1;
   }    
   else
   {  
       if(msg >id )
        {          
            0->msg;  
            id = msg;
            
        }   
       
   }
}
}`);
async function get_variable_names() {
    const response = await fetch('/variable_names', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code_editor.getValue() })
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    else {
        console.error('Failed to fetch variable names');
        return [];
    }
}
const Offcanvas = document.getElementById('VariablePinOffCanvas');
if (Offcanvas) {
    Offcanvas.addEventListener('show.bs.offcanvas', async (event) => {
        const variableList = await get_variable_names();
        const container = document.getElementById('variable-list');
        container.innerHTML = '';
        variableList.forEach((variable) => {
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
            pinned_variables.push(checkbox.value);
        });
        console.log('Pinned variables:', pinned_variables);
        refresh_graph();
    });
}
async function code_validity_check() {
    const response = await fetch('/syntax_check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code_editor.getValue() })
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    else {
        console.error('Failed to check syntax');
        return false;
    }
}
async function load_file(filename) {
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
            code_editor.setValue(data.file, -1);
            const offcanvas = document.getElementById('SaveOffCanvas');
            if (offcanvas) {
                const bsOffcanvas = window.bootstrap?.Offcanvas.getInstance(offcanvas);
                bsOffcanvas?.hide();
            }
        }
        else {
            console.error('Failed to load file:', data.error);
        }
    }
    else {
        console.error('Failed to fetch file contents');
    }
}
function delete_file(filename) {
}
