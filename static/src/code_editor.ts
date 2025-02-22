
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