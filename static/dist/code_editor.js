"use strict";
let pinned_variables = [];
var editor = ace.edit("code-editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.resize();
editor.setValue(`int leader = 0;
int state = 0;
int id = UID;
int msg;
if(state == 0)
{ 
    state = 1;
    0->id;
}
else
{   
int msg;
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
    return ["id", "leader", "state", "msg", "boop"];
}
const Offcanvas = document.getElementById('VariablePinOffCanvas');
if (Offcanvas) {
    Offcanvas.addEventListener('show.bs.offcanvas', async (event) => {
        const variableList = await get_variable_names();
        const container = document.getElementById('variable-list');
        container.innerHTML = '';
        variableList.forEach(variable => {
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
